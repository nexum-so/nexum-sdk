import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const DEFAULT_PROGRAM_ID = new PublicKey(
  "DT1ecSa7avxJurDmfeZ2ou2VJZLEoXSMYVRQxLMEg17G"
);

export function deriveAgentCardPDA(
  owner: PublicKey,
  agentId: string,
  programId: PublicKey = DEFAULT_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent"), owner.toBuffer(), Buffer.from(agentId)],
    programId
  );
}

export function deriveVaultPDA(
  agentCard: PublicKey,
  programId: PublicKey = DEFAULT_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), agentCard.toBuffer()],
    programId
  );
}

export function deriveTaskRecordPDA(
  caller: PublicKey,
  agentCard: PublicKey,
  nonce: BN,
  programId: PublicKey = DEFAULT_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("task"),
      caller.toBuffer(),
      agentCard.toBuffer(),
      nonce.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );
}
