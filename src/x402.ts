import type { Request, Response, NextFunction } from "express";
import { X402Config } from "./types";

export function createX402Middleware(config: X402Config) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const paymentSig = req.headers["payment-signature"] as string | undefined;
    const paymentProof = req.headers["payment-proof"] as string | undefined;

    // No payment provided — return 402
    if (!paymentSig && !paymentProof) {
      const requirements = {
        x402Version: 2,
        accepts: [
          {
            scheme: "exact",
            network: config.network || "solana-devnet",
            maxAmountRequired: String(config.priceUsdc),
            resource: req.originalUrl,
            payTo: config.paymentAddress,
            asset: config.usdcMint,
            extra: {
              facilitatorUrl: config.facilitatorUrl,
              zkBalance: true,
            },
          },
        ],
      };
      res
        .status(402)
        .set(
          "PAYMENT-REQUIRED",
          Buffer.from(JSON.stringify(requirements)).toString("base64")
        )
        .json({ error: "Payment required" });
      return;
    }

    try {
      // ZK Balance proof (preferred)
      if (paymentProof) {
        const proofData = JSON.parse(
          Buffer.from(paymentProof, "base64").toString("utf-8")
        );
        const verifyRes = await fetch(`${config.facilitatorUrl}/verify-zk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...proofData,
            minPrice: config.priceUsdc,
          }),
        });
        const data = await verifyRes.json() as any;
        if (!data.isValid) {
          res.status(402).json({ error: `ZK verification failed: ${data.reason}` });
          return;
        }
        next();
        return;
      }

      // Legacy x402 transaction
      if (paymentSig) {
        const verifyRes = await fetch(`${config.facilitatorUrl}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentSignature: paymentSig }),
        });
        if (!verifyRes.ok) {
          res.status(402).json({ error: "Payment verification failed" });
          return;
        }
        next();
        return;
      }
    } catch {
      res.status(502).json({ error: "Facilitator unavailable" });
    }
  };
}
