import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  deriveAgentCardPDA,
  deriveVaultPDA,
  deriveTaskRecordPDA,
} from "./pda";
import { generateNonce, computeResourceHash } from "./utils";
import type {
  RegisterAgentParams,
  UpdateAgentParams,
  PayAndReportParams,
  AgentCard,
  AgentStatus,
} from "./types";
import { IDL } from "./idl/nexum";

const DEFAULT_PROGRAM_ID = new PublicKey(
  "DT1ecSa7avxJurDmfeZ2ou2VJZLEoXSMYVRQxLMEg17G"
);

export class NexumClient {
  private program: Program;
  private wallet: AnchorProvider["wallet"];
  public programId: PublicKey;

  constructor(
    connection: Connection,
    wallet: AnchorProvider["wallet"],
    programId?: PublicKey
  ) {
    this.programId = programId || DEFAULT_PROGRAM_ID;
    this.wallet = wallet;
    const provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(IDL as any, provider);
  }

  // --- Agent Lifecycle ---

  async registerAgent(params: RegisterAgentParams) {
    const owner = this.wallet.publicKey;
    const [agentCardPda] = deriveAgentCardPDA(
      owner,
      params.agentId,
      this.programId
    );
    const [vaultPda] = deriveVaultPDA(agentCardPda, this.programId);

    const tx = await (this.program.methods as any)
      .registerAgent({
        agentId: params.agentId,
        name: params.name,
        endpoint: params.endpoint,
        skills: params.skills,
        protocolVersion: params.protocolVersion,
        source: params.source === "mcp" ? { mcp: {} } : { native: {} },
        mcpUrl: params.mcpUrl || null,
        minPriceUsdc: new BN(params.minPriceUsdc),
        snsDomain: params.snsDomain || null,
      })
      .accounts({
        owner,
        agentCard: agentCardPda,
        vault: vaultPda,
        paymentTokenAccount: params.paymentTokenAccount,
        usdcMint: params.usdcMint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { agentCard: agentCardPda, tx };
  }

  async updateAgent(agentId: string, params: UpdateAgentParams) {
    const owner = this.wallet.publicKey;
    const [agentCardPda] = deriveAgentCardPDA(
      owner,
      agentId,
      this.programId
    );

    const tx = await (this.program.methods as any)
      .updateAgent({
        name: params.name || null,
        endpoint: params.endpoint || null,
        skills: params.skills || null,
        minPriceUsdc: params.minPriceUsdc ? new BN(params.minPriceUsdc) : null,
        snsDomain: params.snsDomain || null,
      })
      .accounts({
        owner,
        agentCard: agentCardPda,
      })
      .rpc();

    return { tx };
  }

  async updateAgentStatus(agentId: string, status: AgentStatus) {
    const owner = this.wallet.publicKey;
    const [agentCardPda] = deriveAgentCardPDA(
      owner,
      agentId,
      this.programId
    );

    const statusEnum =
      status === "active"
        ? { active: {} }
        : status === "paused"
        ? { paused: {} }
        : { deregistered: {} };

    const tx = await (this.program.methods as any)
      .updateAgentStatus(statusEnum)
      .accounts({
        owner,
        agentCard: agentCardPda,
      })
      .rpc();

    return { tx };
  }

  async closeAgent(agentId: string) {
    const owner = this.wallet.publicKey;
    const [agentCardPda] = deriveAgentCardPDA(
      owner,
      agentId,
      this.programId
    );
    const [vaultPda] = deriveVaultPDA(agentCardPda, this.programId);

    const tx = await (this.program.methods as any)
      .closeAgent()
      .accounts({
        owner,
        agentCard: agentCardPda,
        vault: vaultPda,
      })
      .rpc();

    return { tx };
  }

  async getAgent(
    owner: PublicKey,
    agentId: string
  ): Promise<AgentCard | null> {
    const [agentCardPda] = deriveAgentCardPDA(
      owner,
      agentId,
      this.programId
    );
    try {
      const account = await (this.program.account as any).agentCard.fetch(
        agentCardPda
      );
      return this.parseAgentCard(account);
    } catch {
      return null;
    }
  }

  async getMyAgents(): Promise<AgentCard[]> {
    const owner = this.wallet.publicKey;
    const accounts = await (
      this.program.account as any
    ).agentCard.all([
      { memcmp: { offset: 8, bytes: owner.toBase58() } },
    ]);
    return accounts.map((a: any) => this.parseAgentCard(a.account));
  }

  // --- Staking ---

  async stake(agentId: string, lamports: number) {
    const owner = this.wallet.publicKey;
    const [agentCardPda] = deriveAgentCardPDA(
      owner,
      agentId,
      this.programId
    );
    const [vaultPda] = deriveVaultPDA(agentCardPda, this.programId);

    const tx = await (this.program.methods as any)
      .stakeSol(new BN(lamports))
      .accounts({
        owner,
        agentCard: agentCardPda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { tx };
  }

  async requestUnstake(agentId: string) {
    const owner = this.wallet.publicKey;
    const [agentCardPda] = deriveAgentCardPDA(
      owner,
      agentId,
      this.programId
    );

    const tx = await (this.program.methods as any)
      .requestUnstake()
      .accounts({
        owner,
        agentCard: agentCardPda,
      })
      .rpc();

    return { tx };
  }

  async executeUnstake(agentId: string) {
    const owner = this.wallet.publicKey;
    const [agentCardPda] = deriveAgentCardPDA(
      owner,
      agentId,
      this.programId
    );
    const [vaultPda] = deriveVaultPDA(agentCardPda, this.programId);

    const tx = await (this.program.methods as any)
      .executeUnstake()
      .accounts({
        owner,
        agentCard: agentCardPda,
        vault: vaultPda,
      })
      .rpc();

    return { tx };
  }

  // --- Task Reporting ---

  async payAndReportCompleted(params: PayAndReportParams) {
    const caller = this.wallet.publicKey;
    const nonce = params.nonce || generateNonce();
    const [taskRecordPda] = deriveTaskRecordPDA(
      caller,
      params.agentCard,
      nonce,
      this.programId
    );

    const agentAccount = await (
      this.program.account as any
    ).agentCard.fetch(params.agentCard);

    const tx = await (this.program.methods as any)
      .payAndReportCompleted({
        nonce,
        paymentAmount: new BN(params.paymentAmount),
        resourceHash: Array.from(params.resourceHash),
      })
      .accounts({
        caller,
        agentCard: params.agentCard,
        taskRecord: taskRecordPda,
        callerTokenAccount: params.callerTokenAccount,
        agentTokenAccount: agentAccount.paymentAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { taskRecord: taskRecordPda, nonce, tx };
  }

  async reportFailed(agentCard: PublicKey, nonce: BN) {
    const caller = this.wallet.publicKey;
    const [taskRecordPda] = deriveTaskRecordPDA(
      caller,
      agentCard,
      nonce,
      this.programId
    );

    const tx = await (this.program.methods as any)
      .reportFailed()
      .accounts({
        caller,
        agentCard,
        taskRecord: taskRecordPda,
      })
      .rpc();

    return { tx };
  }

  async closeTaskRecord(agentCard: PublicKey, nonce: BN) {
    const caller = this.wallet.publicKey;
    const [taskRecordPda] = deriveTaskRecordPDA(
      caller,
      agentCard,
      nonce,
      this.programId
    );

    const tx = await (this.program.methods as any)
      .closeTaskRecord()
      .accounts({
        caller,
        taskRecord: taskRecordPda,
      })
      .rpc();

    return { tx };
  }

  // --- Helpers ---

  private parseAgentCard(account: any): AgentCard {
    const source = account.source.native ? "native" : "mcp";
    const status = account.status.active
      ? "active"
      : account.status.paused
      ? "paused"
      : "deregistered";

    return {
      owner: account.owner,
      agentId: account.agentId,
      name: account.name,
      snsDomain: account.snsDomain,
      endpoint: account.endpoint,
      skills: account.skills,
      protocolVersion: account.protocolVersion,
      source,
      mcpUrl: account.mcpUrl,
      paymentAddress: account.paymentAddress,
      usdcMint: account.usdcMint,
      minPriceUsdc: account.minPriceUsdc.toNumber(),
      stake: account.stake.toNumber(),
      unstakeRequestedAt: account.unstakeRequestedAt?.toNumber() ?? null,
      tasksCompleted: account.tasksCompleted.toNumber(),
      tasksFailed: account.tasksFailed.toNumber(),
      totalUsdcReceived: account.totalUsdcReceived.toNumber(),
      lastTaskAt: account.lastTaskAt.toNumber(),
      registeredAt: account.registeredAt.toNumber(),
      updatedAt: account.updatedAt.toNumber(),
      status,
      bump: account.bump,
    };
  }
}
