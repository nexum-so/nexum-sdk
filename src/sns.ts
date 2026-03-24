import { Connection, PublicKey } from "@solana/web3.js";

export class SNSResolver {
  constructor(private connection: Connection) {}

  async resolve(domain: string): Promise<PublicKey | null> {
    try {
      const { getDomainKeySync, NameRegistryState } = await import(
        "@bonfida/spl-name-service"
      );
      const { pubkey } = getDomainKeySync(domain);
      const { registry } = await NameRegistryState.retrieve(
        this.connection,
        pubkey
      );
      return registry.owner;
    } catch {
      return null;
    }
  }

  async reverseLookup(owner: PublicKey): Promise<string | null> {
    try {
      const { getAllDomains, reverseLookup } = await import(
        "@bonfida/spl-name-service"
      );
      const domains = await getAllDomains(this.connection, owner);
      if (domains.length === 0) return null;
      return reverseLookup(this.connection, domains[0]);
    } catch {
      return null;
    }
  }
}
