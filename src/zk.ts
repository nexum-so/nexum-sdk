import { buildPoseidon } from "circomlibjs";
import nacl from "tweetnacl";
import { Buffer } from "buffer";

export interface ZkProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

export interface ZkPaymentResult {
  proof: ZkProof;
  publicInputs: string[];
  commitment: string;
  encryptedAmount: string;
  ephemeralPubkey: string;
  nonce: string;
}

export interface ZkPaymentParams {
  amount: number;
  minPrice: number;
  protocolFloor?: number;
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

export async function computeCommitment(
  amount: number,
  salt: bigint,
): Promise<string> {
  const poseidon = await getPoseidon();
  const hash = poseidon([BigInt(amount), salt]);
  return poseidon.F.toString(hash);
}

export async function generateZkPayment(
  params: ZkPaymentParams,
): Promise<ZkPaymentResult> {
  const { amount, minPrice, facilitatorZkPubkey, wasmPath, zkeyPath } = params;
  const protocolFloor = params.protocolFloor || 1000;

  // Generate random salt
  const saltBytes = nacl.randomBytes(16);
  const salt = BigInt(
    "0x" + Buffer.from(saltBytes).toString("hex"),
  );

  // Compute Poseidon commitment
  const commitment = await computeCommitment(amount, salt);

  // Build circuit input
  const input = {
    amount: amount.toString(),
    salt: salt.toString(),
    commitment,
    minPrice: minPrice.toString(),
    protocolFloor: protocolFloor.toString(),
  };

  // Generate Groth16 proof via snarkjs
  // snarkjs is loaded dynamically to support both Node.js and browser
  const snarkjs = await import("snarkjs");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmPath,
    zkeyPath,
  );

  // Encrypt {amount, salt} for the facilitator
  const ephemeral = nacl.box.keyPair();
  const nonceBytes = nacl.randomBytes(nacl.box.nonceLength);
  const message = Buffer.from(
    JSON.stringify({ amount, salt: salt.toString() }),
  );
  const encrypted = nacl.box(
    message,
    nonceBytes,
    facilitatorZkPubkey,
    ephemeral.secretKey,
  );

  return {
    proof,
    publicInputs: publicSignals,
    commitment,
    encryptedAmount: Buffer.from(encrypted).toString("base64"),
    ephemeralPubkey: Buffer.from(ephemeral.publicKey).toString("base64"),
    nonce: Buffer.from(nonceBytes).toString("base64"),
  };
}

/**
 * Convert snarkjs proof format to byte arrays for Solana instruction data.
 * Handles the proof_a negation and endianness requirements.
 */
export function proofToSolanaBytes(proof: ZkProof): {
  proofA: Uint8Array;
  proofB: Uint8Array;
  proofC: Uint8Array;
} {
  // proof.pi_a = [x, y, "1"]
  const ax = bigintToBytes32BE(proof.pi_a[0]);
  const ay = bigintToBytes32BE(proof.pi_a[1]);

  // proof.pi_b = [[x_imag, x_real], [y_imag, y_real], ["1", "0"]]
  const bx0 = bigintToBytes32BE(proof.pi_b[0][0]);
  const bx1 = bigintToBytes32BE(proof.pi_b[0][1]);
  const by0 = bigintToBytes32BE(proof.pi_b[1][0]);
  const by1 = bigintToBytes32BE(proof.pi_b[1][1]);

  // proof.pi_c = [x, y, "1"]
  const cx = bigintToBytes32BE(proof.pi_c[0]);
  const cy = bigintToBytes32BE(proof.pi_c[1]);

  return {
    proofA: new Uint8Array([...ax, ...ay]),
    proofB: new Uint8Array([...bx0, ...bx1, ...by0, ...by1]),
    proofC: new Uint8Array([...cx, ...cy]),
  };
}

export function commitmentToBytes32(commitment: string): Uint8Array {
  return bigintToBytes32BE(commitment);
}

function bigintToBytes32BE(s: string): Uint8Array {
  let n = BigInt(s);
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return bytes;
}
