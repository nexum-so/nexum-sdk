import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { generateNonce, computeResourceHash } from "../src/utils";

describe("utils", () => {
  describe("generateNonce", () => {
    it("returns a BN", () => {
      const nonce = generateNonce();
      expect(nonce).to.be.instanceOf(BN);
    });

    it("generates unique values", () => {
      const nonces = new Set<string>();
      for (let i = 0; i < 100; i++) {
        nonces.add(generateNonce().toString());
      }
      expect(nonces.size).to.equal(100);
    });

    it("fits in 8 bytes", () => {
      const nonce = generateNonce();
      const buf = nonce.toArrayLike(Buffer, "le", 8);
      expect(buf.length).to.equal(8);
    });
  });

  describe("computeResourceHash", () => {
    const caller = Keypair.generate().publicKey;
    const agentCard = Keypair.generate().publicKey;
    const nonce = new BN(12345);

    it("returns 32-byte Uint8Array", () => {
      const hash = computeResourceHash({
        method: "POST",
        path: "/message/send",
        body: '{"message":"hello"}',
        agentCard,
        caller,
        nonce,
      });
      expect(hash).to.be.instanceOf(Uint8Array);
      expect(hash.length).to.equal(32);
    });

    it("is deterministic", () => {
      const params = {
        method: "POST",
        path: "/message/send",
        body: '{"message":"hello"}',
        agentCard,
        caller,
        nonce,
      };
      const h1 = computeResourceHash(params);
      const h2 = computeResourceHash(params);
      expect(Buffer.from(h1).toString("hex")).to.equal(Buffer.from(h2).toString("hex"));
    });

    it("different bodies produce different hashes", () => {
      const base = { method: "POST", path: "/", agentCard, caller, nonce };
      const h1 = computeResourceHash({ ...base, body: "hello" });
      const h2 = computeResourceHash({ ...base, body: "world" });
      expect(Buffer.from(h1).toString("hex")).to.not.equal(Buffer.from(h2).toString("hex"));
    });

    it("different methods produce different hashes", () => {
      const base = { path: "/", body: "x", agentCard, caller, nonce };
      const h1 = computeResourceHash({ ...base, method: "GET" });
      const h2 = computeResourceHash({ ...base, method: "POST" });
      expect(Buffer.from(h1).toString("hex")).to.not.equal(Buffer.from(h2).toString("hex"));
    });

    it("different callers produce different hashes", () => {
      const base = { method: "POST", path: "/", body: "x", agentCard, nonce };
      const h1 = computeResourceHash({ ...base, caller });
      const h2 = computeResourceHash({ ...base, caller: Keypair.generate().publicKey });
      expect(Buffer.from(h1).toString("hex")).to.not.equal(Buffer.from(h2).toString("hex"));
    });

    it("is case-insensitive on method", () => {
      const base = { path: "/", body: "x", agentCard, caller, nonce };
      const h1 = computeResourceHash({ ...base, method: "post" });
      const h2 = computeResourceHash({ ...base, method: "POST" });
      expect(Buffer.from(h1).toString("hex")).to.equal(Buffer.from(h2).toString("hex"));
    });
  });
});
