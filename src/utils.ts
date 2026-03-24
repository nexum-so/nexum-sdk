import { createHash, randomBytes } from "crypto";
import { BN } from "@coral-xyz/anchor";
import { ResourceHashParams } from "./types";

export function generateNonce(): BN {
  const bytes = randomBytes(8);
  return new BN(bytes, "le");
}

export function computeResourceHash(params: ResourceHashParams): Uint8Array {
  const bodyHash = createHash("sha256")
    .update(typeof params.body === "string" ? params.body : new Uint8Array(params.body))
    .digest();

  const hash = createHash("sha256");
  hash.update(params.method.toUpperCase());
  hash.update(params.path);
  hash.update(new Uint8Array(bodyHash));
  hash.update(new Uint8Array(params.agentCard.toBuffer()));
  hash.update(new Uint8Array(params.caller.toBuffer()));
  hash.update(new Uint8Array(params.nonce.toArrayLike(Buffer, "le", 8)));

  return new Uint8Array(hash.digest());
}
