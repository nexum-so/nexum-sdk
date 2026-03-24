/**
 * @nexum-so/sdk/agent
 *
 * High-level API for agent developers.
 *
 * Usage:
 *   import { NexumAgent } from "@nexum-so/sdk/agent";
 *
 *   const agent = new NexumAgent({
 *     keypair,
 *     agentId: "my-agent",
 *     cluster: "devnet",
 *   });
 *
 *   await agent.register({ name: "My Agent", endpoint, skills, minPrice });
 *   app.post("/message/send", agent.paywall(), handler);
 *   await agent.releaseEarnings();
 */

import type { Request, Response, NextFunction } from "express";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { IDL } from "./idl/nexum";
import { deriveAgentCardPDA, deriveVaultPDA } from "./pda";
import { getClusterConfig, type NexumCluster } from "./constants";

export interface NexumAgentConfig {
  keypair: Keypair;
  agentId: string;
  cluster?: NexumCluster;
  rpcUrl?: string;
  facilitatorUrl?: string;
  programId?: PublicKey;
}

export interface RegisterParams {
  name: string;
  endpoint: string;
  skills: string[];
  minPriceUsdc: number;
  mcpUrl?: string;
  snsDomain?: string;
}

export class NexumAgent {
  private keypair: Keypair;
  private agentId: string;
  private connection: Connection;
  private program: Program;
  private cluster: NexumCluster;
  private facilitatorUrl: string;
  public agentCardPda: PublicKey;
  public programId: PublicKey;

  constructor(config: NexumAgentConfig) {
    this.keypair = config.keypair;
    this.agentId = config.agentId;
    this.cluster = config.cluster || "devnet";

    const clusterConfig = getClusterConfig(this.cluster);
    this.programId = config.programId || clusterConfig.programId;
    this.facilitatorUrl = config.facilitatorUrl || clusterConfig.facilitatorUrl;
    this.connection = new Connection(
      config.rpcUrl || clusterConfig.rpcUrl,
      "confirmed",
    );

    const wallet = new Wallet(this.keypair);
    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program(IDL as any, provider);

    [this.agentCardPda] = deriveAgentCardPDA(
      this.keypair.publicKey,
      this.agentId,
      this.programId,
    );
  }

  async register(params: RegisterParams): Promise<string> {
    const owner = this.keypair.publicKey;
    const [vaultPda] = deriveVaultPDA(this.agentCardPda, this.programId);

    const ata = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.keypair,
      getClusterConfig(this.cluster).usdcMint,
      owner,
    );

    const tx = await (this.program.methods as any)
      .registerAgent({
        agentId: this.agentId,
        name: params.name,
        endpoint: params.endpoint,
        skills: params.skills,
        protocolVersion: "1.0",
        source: { native: {} },
        mcpUrl: params.mcpUrl || null,
        minPriceUsdc: new BN(params.minPriceUsdc),
        snsDomain: params.snsDomain || null,
      })
      .accounts({
        owner,
        agentCard: this.agentCardPda,
        vault: vaultPda,
        paymentTokenAccount: ata.address,
        usdcMint: getClusterConfig(this.cluster).usdcMint,
        systemProgram: SystemProgram.programId,
      })
      .signers([this.keypair])
      .rpc();

    return tx;
  }

  async updateEndpoint(endpoint: string): Promise<string> {
    const tx = await (this.program.methods as any)
      .updateAgent({
        name: null,
        endpoint,
        skills: null,
        minPriceUsdc: null,
        snsDomain: null,
      })
      .accounts({
        owner: this.keypair.publicKey,
        agentCard: this.agentCardPda,
      })
      .signers([this.keypair])
      .rpc();

    return tx;
  }

  async getEarnings(): Promise<number> {
    const res = await fetch(
      `${this.facilitatorUrl}/earnings/${this.agentCardPda.toBase58()}`,
    );
    const data = await res.json() as any;
    return typeof data.earnings === "number" ? data.earnings : Number(data.earnings) || 0;
  }

  async releaseEarnings(): Promise<{ tx: string; amount: number } | null> {
    const res = await fetch(`${this.facilitatorUrl}/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentCardPda: this.agentCardPda.toBase58(),
      }),
    });
    const data = await res.json() as any;
    if (!data.success) return null;
    return { tx: data.transaction, amount: data.amount };
  }

  /**
   * Express middleware that gates endpoints behind payment.
   * Accepts both Payment-Proof (ZK balance) and Payment-Signature (legacy x402).
   */
  paywall(minPriceUsdc?: number): (req: Request, res: Response, next: NextFunction) => void {
    const facilitatorUrl = this.facilitatorUrl;
    const agentCardPda = this.agentCardPda;
    const usdcMint = getClusterConfig(this.cluster).usdcMint;
    const price = minPriceUsdc || 1000;

    return async (req: Request, res: Response, next: NextFunction) => {
      const paymentProof = req.headers["payment-proof"] as string | undefined;
      const paymentSig = req.headers["payment-signature"] as string | undefined;

      // No payment — return 402
      if (!paymentProof && !paymentSig) {
        const requirements = {
          x402Version: 2,
          accepts: [
            {
              scheme: "zk-balance",
              network: "solana-devnet",
              maxAmountRequired: String(price),
              resource: req.originalUrl,
              payTo: agentCardPda.toBase58(),
              asset: usdcMint.toBase58(),
              extra: { facilitatorUrl, zkBalance: true },
            },
          ],
        };

        res
          .status(402)
          .set("PAYMENT-REQUIRED", Buffer.from(JSON.stringify(requirements)).toString("base64"))
          .json({ error: "Payment required", data: requirements });
        return;
      }

      try {
        // ZK Balance
        if (paymentProof) {
          const proofData = JSON.parse(
            Buffer.from(paymentProof, "base64").toString("utf-8"),
          );
          const verifyRes = await fetch(`${facilitatorUrl}/verify-zk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...proofData, minPrice: price }),
          });
          const data = await verifyRes.json() as any;
          if (!data.isValid) {
            res.status(402).json({ error: `ZK verification failed: ${data.reason}` });
            return;
          }
          next();
          return;
        }

        // Legacy x402
        if (paymentSig) {
          const verifyRes = await fetch(`${facilitatorUrl}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentSignature: paymentSig }),
          });
          if (!verifyRes.ok) {
            res.status(402).json({ error: "Payment verification failed" });
            return;
          }
          next();
          return;
        }
      } catch {
        res.status(502).json({ error: "Facilitator unavailable" });
      }
    };
  }

  /**
   * Returns a JSON-serializable agent card for /.well-known/agent.json
   */
  agentCard(params: { description: string; publicUrl: string }) {
    return {
      name: this.agentId,
      description: params.description,
      url: params.publicUrl,
      provider: { organization: "Nexum" },
      version: "1.0",
      capabilities: {
        protocols: ["a2a", "x402", "zk-balance"],
      },
      nexum: {
        programId: this.programId.toBase58(),
        agentCard: this.agentCardPda.toBase58(),
        usdcMint: getClusterConfig(this.cluster).usdcMint.toBase58(),
        network: `solana-${this.cluster}`,
        paymentMethods: ["zk-balance", "x402"],
      },
    };
  }
}
