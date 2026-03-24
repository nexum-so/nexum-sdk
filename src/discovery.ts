import { DiscoverFilters, AgentCard } from "./types";

export class DiscoveryClient {
  constructor(private relayUrl: string) {}

  async discover(filters: DiscoverFilters = {}): Promise<AgentCard[]> {
    const params = new URLSearchParams();
    if (filters.skills?.length) params.set("skills", filters.skills.join(","));
    if (filters.minStake) params.set("min_stake", String(filters.minStake));
    if (filters.maxPrice) params.set("max_price", String(filters.maxPrice));
    if (filters.minTasksCompleted)
      params.set("min_tasks_completed", String(filters.minTasksCompleted));
    if (filters.maxFailureRate)
      params.set("max_failure_rate", String(filters.maxFailureRate));
    if (filters.status) params.set("status", filters.status);
    if (filters.ecosystem) params.set("ecosystem", filters.ecosystem);

    const res = await fetch(`${this.relayUrl}/agents?${params}`);
    if (!res.ok) throw new Error(`Discovery failed: ${res.status}`);
    return res.json() as Promise<AgentCard[]>;
  }

  async getAgent(owner: string, agentId: string): Promise<AgentCard> {
    const res = await fetch(`${this.relayUrl}/agents/${owner}/${agentId}`);
    if (!res.ok) throw new Error(`Agent not found: ${res.status}`);
    return res.json() as Promise<AgentCard>;
  }

  async getSkills(): Promise<string[]> {
    const res = await fetch(`${this.relayUrl}/skills`);
    if (!res.ok) throw new Error(`Failed to fetch skills: ${res.status}`);
    return res.json() as Promise<string[]>;
  }

  async getStats(): Promise<{
    totalAgents: number;
    activeAgents: number;
    totalTasks: number;
  }> {
    const res = await fetch(`${this.relayUrl}/stats`);
    if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
    return res.json() as Promise<{ totalAgents: number; activeAgents: number; totalTasks: number }>;
  }
}
