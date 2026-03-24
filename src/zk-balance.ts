/**
 * ZK Balance Spend — generates Groth16 proofs for private balance deductions.
 */

import { buildPoseidon } from "circomlibjs";
import nacl from "tweetnacl";
import { Buffer } from "buffer";

export interface BalanceSpendResult {
  proof: any;
  publicSignals: string[];
  oldCommitment: string;
  newCommitment: string;
  encryptedPayload: string;
  ephemeralPubkey: string;
  nonce: string;
}

export interface BalanceSpendParams {
  balance: number;
  amount: number;
  saltOld: string;
  minPrice: number;
  facilitatorZkPubkey: Uint8Array;
  wasmPath: string;
  zkeyPath: string;
}

let poseidonInstance: any = null;

async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

export async function generateBalanceSpendProof(
  params: BalanceSpendParams,
): Promise<BalanceSpendResult> {
  const { balance, amount, saltOld, minPrice, facilitatorZkPubkey, wasmPath, zkeyPath } = params;

  const poseidon = await getPoseidon();
  const F = poseidon.F;

  // Generate new salt for the updated commitment
  const saltNewBytes = nacl.randomBytes(16);
  const saltNew = BigInt("0x" + Buffer.from(saltNewBytes).toString("hex")).toString();

  // Compute commitments
  const oldCommitment = F.toString(poseidon([BigInt(balance), BigInt(saltOld)]));
  const newBalance = balance - amount;
  const newCommitment = F.toString(poseidon([BigInt(newBalance), BigInt(saltNew)]));

  // Build circuit input
  const input = {
    balance: balance.toString(),
    amount: amount.toString(),
    saltOld,
    saltNew,
    oldCommitment,
    newCommitment,
    minPrice: minPrice.toString(),
  };

  // Generate Groth16 proof
  const snarkjs = await import("snarkjs");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath,
    zkeyPath,
  );

  // Encrypt {amount, balance, saltOld, saltNew} for facilitator
  const ephemeral = nacl.box.keyPair();
  const nonceBytes = nacl.randomBytes(nacl.box.nonceLength);
  const message = Buffer.from(
    JSON.stringify({ amount, balance, saltOld, saltNew, newBalance }),
  );
  const encrypted = nacl.box(
    message,
    nonceBytes,
    facilitatorZkPubkey,
    ephemeral.secretKey,
  );

  return {
    proof,
    publicSignals,
    oldCommitment,
    newCommitment,
    encryptedPayload: Buffer.from(encrypted).toString("base64"),
    ephemeralPubkey: Buffer.from(ephemeral.publicKey).toString("base64"),
    nonce: Buffer.from(nonceBytes).toString("base64"),
  };
}
