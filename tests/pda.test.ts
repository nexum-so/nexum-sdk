import { expect } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { deriveAgentCardPDA, deriveVaultPDA, deriveTaskRecordPDA } from "../src/pda";

const PROGRAM_ID = new PublicKey("DT1ecSa7avxJurDmfeZ2ou2VJZLEoXSMYVRQxLMEg17G");

describe("PDA derivation", () => {
  const owner = Keypair.generate().publicKey;
  const agentId = "test-agent";

  it("deriveAgentCardPDA returns a valid PublicKey and bump", () => {
    const [pda, bump] = deriveAgentCardPDA(owner, agentId);
    expect(pda).to.be.instanceOf(PublicKey);
    expect(bump).to.be.a("number").and.be.gte(0).and.be.lte(255);
  });

  it("deriveAgentCardPDA is deterministic", () => {
    const [pda1] = deriveAgentCardPDA(owner, agentId);
    const [pda2] = deriveAgentCardPDA(owner, agentId);
    expect(pda1.toBase58()).to.equal(pda2.toBase58());
  });

  it("different owners produce different PDAs", () => {
    const owner2 = Keypair.generate().publicKey;
    const [pda1] = deriveAgentCardPDA(owner, agentId);
    const [pda2] = deriveAgentCardPDA(owner2, agentId);
    expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
  });

  it("different agent IDs produce different PDAs", () => {
    const [pda1] = deriveAgentCardPDA(owner, "agent-a");
    const [pda2] = deriveAgentCardPDA(owner, "agent-b");
    expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
  });

  it("deriveVaultPDA derives from agent card", () => {
    const [agentCard] = deriveAgentCardPDA(owner, agentId);
    const [vault, bump] = deriveVaultPDA(agentCard);
    expect(vault).to.be.instanceOf(PublicKey);
    expect(bump).to.be.a("number");
    expect(vault.toBase58()).to.not.equal(agentCard.toBase58());
  });

  it("deriveVaultPDA is deterministic", () => {
    const [agentCard] = deriveAgentCardPDA(owner, agentId);
    const [v1] = deriveVaultPDA(agentCard);
    const [v2] = deriveVaultPDA(agentCard);
    expect(v1.toBase58()).to.equal(v2.toBase58());
  });

  it("deriveTaskRecordPDA uses caller, agent, and nonce", () => {
    const caller = Keypair.generate().publicKey;
    const [agentCard] = deriveAgentCardPDA(owner, agentId);
    const nonce = new BN(12345);
    const [pda, bump] = deriveTaskRecordPDA(caller, agentCard, nonce);
    expect(pda).to.be.instanceOf(PublicKey);
    expect(bump).to.be.a("number");
  });

  it("different nonces produce different task record PDAs", () => {
    const caller = Keypair.generate().publicKey;
    const [agentCard] = deriveAgentCardPDA(owner, agentId);
    const [pda1] = deriveTaskRecordPDA(caller, agentCard, new BN(1));
    const [pda2] = deriveTaskRecordPDA(caller, agentCard, new BN(2));
    expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
  });

  it("accepts custom program ID", () => {
    const customId = Keypair.generate().publicKey;
    const [pda1] = deriveAgentCardPDA(owner, agentId, PROGRAM_ID);
    const [pda2] = deriveAgentCardPDA(owner, agentId, customId);
    expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
  });
});
