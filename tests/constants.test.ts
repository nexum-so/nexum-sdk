import { expect } from "chai";
import { getClusterConfig, PROTOCOL_FLOOR_USDC } from "../src/constants";
import { PublicKey } from "@solana/web3.js";

describe("constants", () => {
  it("devnet config has valid program ID", () => {
    const config = getClusterConfig("devnet");
    expect(config.programId).to.be.instanceOf(PublicKey);
    expect(config.programId.toBase58()).to.equal("DT1ecSa7avxJurDmfeZ2ou2VJZLEoXSMYVRQxLMEg17G");
  });

  it("mainnet config has real USDC mint", () => {
    const config = getClusterConfig("mainnet-beta");
    expect(config.usdcMint.toBase58()).to.equal("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  });

  it("devnet and mainnet have different USDC mints", () => {
    const devnet = getClusterConfig("devnet");
    const mainnet = getClusterConfig("mainnet-beta");
    expect(devnet.usdcMint.toBase58()).to.not.equal(mainnet.usdcMint.toBase58());
  });

  it("both clusters have RPC URLs", () => {
    expect(getClusterConfig("devnet").rpcUrl).to.include("devnet");
    expect(getClusterConfig("mainnet-beta").rpcUrl).to.include("mainnet");
  });

  it("both clusters have facilitator and relay URLs", () => {
    for (const cluster of ["devnet", "mainnet-beta"] as const) {
      const config = getClusterConfig(cluster);
      expect(config.facilitatorUrl).to.be.a("string").and.include("https://");
      expect(config.relayUrl).to.be.a("string").and.include("https://");
    }
  });

  it("protocol floor is 1000", () => {
    expect(PROTOCOL_FLOOR_USDC).to.equal(1000);
  });
});
