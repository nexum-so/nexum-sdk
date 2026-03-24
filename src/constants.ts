import { PublicKey } from "@solana/web3.js";

export type NexumCluster = "devnet" | "mainnet-beta";

export interface ClusterConfig {
  programId: PublicKey;
  usdcMint: PublicKey;
  rpcUrl: string;
  facilitatorUrl: string;
  relayUrl: string;
}

const CONFIGS: Record<NexumCluster, ClusterConfig> = {
  devnet: {
    programId: new PublicKey("DT1ecSa7avxJurDmfeZ2ou2VJZLEoXSMYVRQxLMEg17G"),
    usdcMint: new PublicKey("4fJAa2oz29ixytmXuoEmEaC8UiaYy4xwmr5PRC1sjFyT"),
    rpcUrl: "https://api.devnet.solana.com",
    facilitatorUrl: "https://facilitator.nexum.so",
    relayUrl: "https://relay.nexum.so",
  },
  "mainnet-beta": {
    programId: new PublicKey("DT1ecSa7avxJurDmfeZ2ou2VJZLEoXSMYVRQxLMEg17G"), // TODO: deploy mainnet
    usdcMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // real USDC
    rpcUrl: "https://api.mainnet-beta.solana.com",
    facilitatorUrl: "https://facilitator.nexum.so",
    relayUrl: "https://relay.nexum.so",
  },
};

export function getClusterConfig(cluster: NexumCluster): ClusterConfig {
  return CONFIGS[cluster];
}

export const PROTOCOL_FLOOR_USDC = 1000;
