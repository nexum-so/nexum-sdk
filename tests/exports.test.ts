import { expect } from "chai";

describe("SDK exports", () => {
  it("exports NexumClient", async () => {
    const sdk = await import("../src/index");
    expect(sdk.NexumClient).to.be.a("function");
  });

  it("exports NexumAgent", async () => {
    const sdk = await import("../src/index");
    expect(sdk.NexumAgent).to.be.a("function");
  });

  it("exports DiscoveryClient", async () => {
    const sdk = await import("../src/index");
    expect(sdk.DiscoveryClient).to.be.a("function");
  });

  it("exports SNSResolver", async () => {
    const sdk = await import("../src/index");
    expect(sdk.SNSResolver).to.be.a("function");
  });

  it("exports PDA helpers", async () => {
    const sdk = await import("../src/index");
    expect(sdk.deriveAgentCardPDA).to.be.a("function");
    expect(sdk.deriveVaultPDA).to.be.a("function");
    expect(sdk.deriveTaskRecordPDA).to.be.a("function");
  });

  it("exports utility functions", async () => {
    const sdk = await import("../src/index");
    expect(sdk.computeResourceHash).to.be.a("function");
    expect(sdk.generateNonce).to.be.a("function");
  });

  it("exports x402 middleware", async () => {
    const sdk = await import("../src/index");
    expect(sdk.createX402Middleware).to.be.a("function");
  });

  it("exports A2A functions", async () => {
    const sdk = await import("../src/index");
    expect(sdk.fetchA2ACard).to.be.a("function");
    expect(sdk.sendA2AMessage).to.be.a("function");
  });

  it("exports ZK functions", async () => {
    const sdk = await import("../src/index");
    expect(sdk.generateZkPayment).to.be.a("function");
    expect(sdk.computeCommitment).to.be.a("function");
    expect(sdk.proofToSolanaBytes).to.be.a("function");
    expect(sdk.commitmentToBytes32).to.be.a("function");
    expect(sdk.generateBalanceSpendProof).to.be.a("function");
  });

  it("exports cluster config", async () => {
    const sdk = await import("../src/index");
    expect(sdk.getClusterConfig).to.be.a("function");
    expect(sdk.PROTOCOL_FLOOR_USDC).to.equal(1000);
  });
});
