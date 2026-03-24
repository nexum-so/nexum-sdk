import { A2AAgentCard, A2AMessage, A2AResponse } from "./types";

export async function fetchA2ACard(url: string): Promise<A2AAgentCard> {
  const baseUrl = url.replace(/\/+$/, "");
  const res = await fetch(`${baseUrl}/.well-known/agent.json`);
  if (!res.ok) throw new Error(`Failed to fetch agent card: ${res.status}`);
  return res.json() as Promise<A2AAgentCard>;
}

export async function sendA2AMessage(
  agentUrl: string,
  message: A2AMessage,
  extraHeaders?: Record<string, string>
): Promise<A2AResponse> {
  const res = await fetch(`${agentUrl}/message/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(message),
  });
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers),
    body: await res.json(),
  };
}
