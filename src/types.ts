import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export type AgentStatus = "active" | "paused" | "deregistered";
export type AgentSource = "native" | "mcp";

export interface RegisterAgentParams {
  agentId: string;
  name: string;
  endpoint: string;
  skills: string[];
  protocolVersion: string;
  source: AgentSource;
  mcpUrl?: string;
  minPriceUsdc: number;
  snsDomain?: string;
  paymentTokenAccount: PublicKey;
  usdcMint: PublicKey;
}

export interface UpdateAgentParams {
  name?: string;
  endpoint?: string;
  skills?: string[];
  minPriceUsdc?: number;
  snsDomain?: string;
}

export interface PayAndReportParams {
  agentCard: PublicKey;
  nonce?: BN;
  paymentAmount: number;
  resourceHash: Uint8Array;
  callerTokenAccount: PublicKey;
}

export interface SendTaskParams {
  agentCard: PublicKey;
  message: A2AMessage;
  paymentAmount: number;
  callerTokenAccount: PublicKey;
}

export interface DiscoverFilters {
  skills?: string[];
  minStake?: number;
  maxPrice?: number;
  minTasksCompleted?: number;
  maxFailureRate?: number;
  status?: AgentStatus;
  ecosystem?: string;
}

export interface ResourceHashParams {
  method: string;
  path: string;
  body: string | Buffer;
  agentCard: PublicKey;
  caller: PublicKey;
  nonce: BN;
}

export interface AgentCard {
  owner: PublicKey;
  agentId: string;
  name: string;
  snsDomain: string | null;
  endpoint: string;
  skills: string[];
  protocolVersion: string;
  source: AgentSource;
  mcpUrl: string | null;
  paymentAddress: PublicKey;
  usdcMint: PublicKey;
  minPriceUsdc: number;
  stake: number;
  unstakeRequestedAt: number | null;
  tasksCompleted: number;
  tasksFailed: number;
  totalUsdcReceived: number;
  lastTaskAt: number;
  registeredAt: number;
  updatedAt: number;
  status: AgentStatus;
  bump: number;
}

export interface TaskRecord {
  caller: PublicKey;
  agentCard: PublicKey;
  nonce: number;
  paymentAmount: number;
  resourceHash: Uint8Array;
  reportedAt: number;
  closeableAt: number;
  isFailed: boolean;
  bump: number;
}

export interface A2AAgentCard {
  name: string;
  description: string;
  url: string;
  capabilities: {
    skills: string[];
    protocols: string[];
  };
}

export interface A2AMessage {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params: Record<string, unknown>;
}

export interface A2AResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export interface TaskResult {
  status: "completed" | "failed" | "pending";
  data?: unknown;
  error?: string;
}

export interface X402Config {
  priceUsdc: number;
  paymentAddress: string;
  usdcMint: string;
  facilitatorUrl: string;
  network?: string;
}

export interface X402PaymentRequirements {
  x402Version: number;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    payTo: string;
    asset: string;
    extra: { facilitatorUrl: string };
  }>;
}
