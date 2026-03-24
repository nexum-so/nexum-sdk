// Core
export { NexumClient } from "./client";
export { NexumAgent } from "./agent";
export { DiscoveryClient } from "./discovery";
export { SNSResolver } from "./sns";

// Constants & Config
export { getClusterConfig, PROTOCOL_FLOOR_USDC } from "./constants";
export type { NexumCluster, ClusterConfig } from "./constants";

// Types
export * from "./types";

// PDA helpers
export * from "./pda";

// Utilities
export { computeResourceHash, generateNonce } from "./utils";

// Payment middleware (for agents)
export { createX402Middleware } from "./x402";

// A2A protocol
export { fetchA2ACard, sendA2AMessage } from "./a2a";

// ZK
export {
  generateZkPayment,
  computeCommitment,
  proofToSolanaBytes,
  commitmentToBytes32,
} from "./zk";
export { generateBalanceSpendProof } from "./zk-balance";
