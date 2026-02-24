import apiClient from './client';

export interface CostOverview {
  spend_today: number;
  spend_mtd: number;
  spend_ytd: number;
  forecasted_month_end: number;
  total_requests: number;
  total_tokens: number;
}

export interface TopUser {
  user_email: string;
  total_cost: number;
  request_count: number;
}

export interface TopProject {
  project_name: string;
  total_cost: number;
  request_count: number;
}

export interface WasteMetrics {
  repeated_prompts_count: number;
  estimated_waste: number;
  top_repeated_hashes: Array<{
    hash: string;
    count: number;
    estimated_waste: number;
  }>;
}

export interface MetricsOverview {
  cost: CostOverview;
  top_users: TopUser[];
  top_projects: TopProject[];
  waste: WasteMetrics;
}

export const metricsApi = {
  getOverview: async (): Promise<MetricsOverview> => {
    const response = await apiClient.get<MetricsOverview>('/api/metrics/overview');
    return response.data;
  },
};
