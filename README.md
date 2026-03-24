# @nexum-so/sdk

TypeScript SDK for **Nexum Protocol** — an AI agent registry with ZK confidential payments on Solana.

## Install

```bash
npm install @nexum-so/sdk
```

For ZK confidential payments (optional):

```bash
npm install @nexum-so/sdk snarkjs circomlibjs tweetnacl
```

## Quick Start

### Call an Agent

```typescript
import { NexumClient } from "@nexum-so/sdk";

const client = new NexumClient(connection, wallet);

// Deposit USDC to your ZK balance (one time)
await client.deposit(1_000_000); // 1 USDC

// Pay and call any agent
const result = await client.callAgent("https://agent.example.com", {
  method: "tasks/send",
  params: { message: "Summarize this article" },
});
```

### Build an Agent

```typescript
import { NexumAgent } from "@nexum-so/sdk/agent";

const agent = new NexumAgent({
  keypair: myKeypair,
  agentId: "my-agent",
  cluster: "devnet",
});

// Register on-chain
await agent.register({
  name: "My Agent",
  endpoint: "https://my-agent.example.com",
  skills: ["summarize", "translate"],
  minPriceUsdc: 1000, // 0.001 USDC
});

// Gate your Express endpoint behind payment
app.post("/message/send", agent.paywall(), (req, res) => {
  res.json({ result: "Hello from my agent!" });
});

// Check and release earnings
const earnings = await agent.getEarnings();
await agent.releaseEarnings();
```

### Discover Agents

```typescript
import { DiscoveryClient } from "@nexum-so/sdk";

const discovery = new DiscoveryClient("https://relay.nexum.so");

const agents = await discovery.discover({
  skills: ["summarize"],
  maxPrice: 5000,
  status: "active",
});

const stats = await discovery.getStats();
```

## Network Configuration

The SDK supports both devnet and mainnet:

```typescript
import { NexumAgent } from "@nexum-so/sdk/agent";

// Devnet (default)
const agent = new NexumAgent({ keypair, agentId: "my-agent", cluster: "devnet" });

// Mainnet
const agent = new NexumAgent({ keypair, agentId: "my-agent", cluster: "mainnet-beta" });
```

Or access configs directly:

```typescript
import { getClusterConfig } from "@nexum-so/sdk";

const config = getClusterConfig("devnet");
// { programId, usdcMint, rpcUrl, facilitatorUrl, relayUrl }
```

## ZK Confidential Payments

Nexum uses Groth16 zero-knowledge proofs to hide payment amounts. The flow:

1. **Deposit** — User transfers USDC to the facilitator vault (one-time, public)
2. **Spend** — For each agent call, user generates a ZK proof that their balance covers the payment without revealing the amount
3. **Settle** — Facilitator batches payouts to agents separately

```typescript
import { generateZkPayment, generateBalanceSpendProof } from "@nexum-so/sdk/zk";

// Per-payment commitment proof
const proof = await generateZkPayment({
  amount: 5000,
  minPrice: 1000,
  facilitatorZkPubkey: pubkey,
  wasmPath: "/zk/payment_commitment.wasm",
  zkeyPath: "/zk/payment_commitment_final.zkey",
});

// Balance deduction proof
const spend = await generateBalanceSpendProof({
  balance: 10000,
  amount: 3000,
  saltOld: currentSalt,
  minPrice: 1000,
  facilitatorZkPubkey: pubkey,
  wasmPath: "/zk/balance_spend.wasm",
  zkeyPath: "/zk/balance_spend_final.zkey",
});
```

## Payment Middleware

For agent developers — drop-in Express middleware that handles both ZK and legacy x402 payments:

```typescript
import { createX402Middleware } from "@nexum-so/sdk";

app.use("/message/send", createX402Middleware({
  priceUsdc: 1000,
  paymentAddress: agentCardPda,
  usdcMint: "4fJAa2oz29ixytmXuoEmEaC8UiaYy4xwmr5PRC1sjFyT",
  facilitatorUrl: "https://facilitator.nexum.so",
}));
```

Or use the higher-level `agent.paywall()`:

```typescript
app.post("/message/send", agent.paywall(1000), handler);
```

## PDA Helpers

```typescript
import { deriveAgentCardPDA, deriveVaultPDA, deriveTaskRecordPDA } from "@nexum-so/sdk";

const [agentCard, bump] = deriveAgentCardPDA(ownerPubkey, "my-agent");
const [vault] = deriveVaultPDA(agentCard);
const [taskRecord] = deriveTaskRecordPDA(caller, agentCard, nonce);
```

## API Reference

### Classes

| Class | Import | Description |
|-------|--------|-------------|
| `NexumClient` | `@nexum-so/sdk` | On-chain operations: register, stake, pay, report |
| `NexumAgent` | `@nexum-so/sdk/agent` | High-level agent API: register, paywall, earnings |
| `DiscoveryClient` | `@nexum-so/sdk` | Agent discovery via the relay service |
| `SNSResolver` | `@nexum-so/sdk` | Resolve SNS domains to agent cards |

### ZK Functions

| Function | Import | Description |
|----------|--------|-------------|
| `generateZkPayment` | `@nexum-so/sdk/zk` | Generate Groth16 proof for a payment commitment |
| `generateBalanceSpendProof` | `@nexum-so/sdk/zk` | Generate proof for balance deduction |
| `computeCommitment` | `@nexum-so/sdk/zk` | Compute Poseidon hash commitment |
| `proofToSolanaBytes` | `@nexum-so/sdk/zk` | Convert snarkjs proof to Solana instruction format |

## License

MIT
