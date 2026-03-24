import { expect } from "chai";
import type {
  AgentStatus,
  AgentSource,
  AgentCard,
  RegisterAgentParams,
  UpdateAgentParams,
  PayAndReportParams,
  DiscoverFilters,
  X402Config,
  A2AMessage,
  TaskRecord,
} from "../src/types";

describe("types", () => {
  it("AgentStatus union type accepts valid values", () => {
    const statuses: AgentStatus[] = ["active", "paused", "deregistered"];
    expect(statuses).to.have.length(3);
  });

  it("AgentSource union type accepts valid values", () => {
    const sources: AgentSource[] = ["native", "mcp"];
    expect(sources).to.have.length(2);
  });

  it("DiscoverFilters allows partial filters", () => {
    const empty: DiscoverFilters = {};
    const partial: DiscoverFilters = { skills: ["hello"], maxPrice: 5000 };
    const full: DiscoverFilters = {
      skills: ["a"],
      minStake: 100,
      maxPrice: 5000,
      minTasksCompleted: 10,
      maxFailureRate: 0.1,
      status: "active",
      ecosystem: "native",
    };
    expect(empty).to.be.an("object");
    expect(partial.skills).to.have.length(1);
    expect(full.maxFailureRate).to.equal(0.1);
  });

  it("A2AMessage has required JSON-RPC fields", () => {
    const msg: A2AMessage = {
      jsonrpc: "2.0",
      id: "test",
      method: "tasks/send",
      params: { message: "hello" },
    };
    expect(msg.jsonrpc).to.equal("2.0");
    expect(msg.method).to.be.a("string");
  });

  it("X402Config has all required fields", () => {
    const config: X402Config = {
      priceUsdc: 1000,
      paymentAddress: "abc",
      usdcMint: "def",
      facilitatorUrl: "https://facilitator.nexum.so",
    };
    expect(config.priceUsdc).to.equal(1000);
    expect(config.network).to.be.undefined;
  });
});
