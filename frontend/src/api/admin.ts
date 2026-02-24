import apiClient from './client';

export interface VirtualKey {
  id: number;
  key: string;
  name: string;
  team_id: number | null;
  project_id: number | null;
  user_email: string | null;
  cost_centre: string | null;
  environment: string | null;
  agent_name: string | null;
  monthly_budget_cap: number | null;
  max_tokens_per_request: number | null;
  max_reasoning_tokens: number | null;
  is_active: boolean;
  created_at: string;
}

export interface VirtualKeyCreate {
  name: string;
  team_id?: number | null;
  project_id?: number | null;
  user_email?: string | null;
  cost_centre?: string | null;
  environment?: string | null;
  agent_name?: string | null;
  monthly_budget_cap?: number | null;
  max_tokens_per_request?: number | null;
  max_reasoning_tokens?: number | null;
}

export interface UsageEvent {
  id: number;
  virtual_key_id: number;
  user_id: number | null;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  prompt_hash: string | null;
  status_code: number | null;
  was_blocked: boolean;
  block_reason: string | null;
  created_at: string;
}

export const adminApi = {
  createVirtualKey: async (data: VirtualKeyCreate): Promise<VirtualKey> => {
    const response = await apiClient.post<VirtualKey>('/api/admin/virtual-keys', data);
    return response.data;
  },
  
  listVirtualKeys: async (): Promise<VirtualKey[]> => {
    const response = await apiClient.get<VirtualKey[]>('/api/admin/virtual-keys');
    return response.data;
  },
  
  getVirtualKey: async (id: number): Promise<VirtualKey> => {
    const response = await apiClient.get<VirtualKey>(`/api/admin/virtual-keys/${id}`);
    return response.data;
  },
  
  listUsageEvents: async (limit = 100, virtual_key_id?: number): Promise<UsageEvent[]> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (virtual_key_id) {
      params.append('virtual_key_id', virtual_key_id.toString());
    }
    const response = await apiClient.get<UsageEvent[]>(`/api/admin/usage-events?${params}`);
    return response.data;
  },
};
