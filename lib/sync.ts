/**
 * Agent sync logic for Cashman AI Training.
 *
 * Placeholder - training agents will be added later.
 */

import {
  syncAgentDefinitions,
  getAgentSyncStatus,
} from "@jazzmind/busibox-app/lib/agent/sync";
import type {
  AgentSyncResult,
  SyncStatus,
  AgentDefinitionInput,
} from "@jazzmind/busibox-app/lib/agent";

export type { AgentSyncResult, SyncStatus };

// Training agents will be defined here in a future update
const AGENT_DEFINITIONS: AgentDefinitionInput[] = [];

export async function syncAgents(agentApiToken: string): Promise<AgentSyncResult> {
  return syncAgentDefinitions(agentApiToken, AGENT_DEFINITIONS);
}

export async function getSyncStatus(agentToken: string): Promise<SyncStatus> {
  return getAgentSyncStatus(agentToken, AGENT_DEFINITIONS);
}
