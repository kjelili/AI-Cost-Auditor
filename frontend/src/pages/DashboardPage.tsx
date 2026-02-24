import { useEffect, useState } from "react";
import { metricsApi, MetricsOverview } from "../api/metrics";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "../shared/lib/cn";

const CHART_COLORS = [
  "rgb(14 165 233)",
  "rgb(16 185 129)",
  "rgb(245 158 11)",
  "rgb(239 68 68)",
  "rgb(139 92 246)",
];

export function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await metricsApi.getOverview();
      setMetrics(data);
      setError("");
    } catch (err: unknown) {
      setError("Failed to load metrics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[16rem] items-center justify-center">
        <span
          className="h-12 w-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" aria-hidden />
        <p className="text-fluid-base text-gray-600">{error ?? "No data available"}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Spend Today",
      value: `$${metrics.cost.spend_today.toFixed(2)}`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: 'Month to Date',
      value: `$${metrics.cost.spend_mtd.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Forecasted Month End',
      value: `$${metrics.cost.forecasted_month_end.toFixed(2)}`,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Estimated Waste',
      value: `$${metrics.waste.estimated_waste.toFixed(2)}`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const topUsersData = metrics.top_users.slice(0, 5).map((user) => ({
    name: user.user_email.split('@')[0],
    cost: user.total_cost,
    requests: user.request_count,
  }));

  const topProjectsData = metrics.top_projects.slice(0, 5).map((project) => ({
    name: project.project_name,
    cost: project.total_cost,
    requests: project.request_count,
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-fluid-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-fluid-base text-gray-600">
          Overview of your AI API costs and usage
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fluid-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="mt-1 font-display text-fluid-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={cn(stat.bgColor, "rounded-xl p-3")}>
                  <Icon className={cn("h-6 w-6", stat.color)} aria-hidden />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary-600" aria-hidden />
            <div>
              <p className="text-fluid-sm text-gray-600">Total Requests (MTD)</p>
              <p className="font-display text-fluid-2xl font-bold text-gray-900">
                {metrics.cost.total_requests.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 text-primary-600" aria-hidden />
            <div>
              <p className="text-fluid-sm text-gray-600">Total Tokens (MTD)</p>
              <p className="font-display text-fluid-2xl font-bold text-gray-900">
                {metrics.cost.total_tokens.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden />
            <div>
              <p className="text-fluid-sm text-gray-600">Repeated Prompts</p>
              <p className="font-display text-fluid-2xl font-bold text-gray-900">
                {metrics.waste.repeated_prompts_count}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {topUsersData.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-fluid-xl font-semibold text-gray-900">
              <Users className="h-5 w-5" aria-hidden />
              Top Users (30 days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topUsersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 231 235)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="cost" fill={CHART_COLORS[0]} name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {topProjectsData.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-fluid-xl font-semibold text-gray-900">
              <FileText className="h-5 w-5" aria-hidden />
              Top Projects (30 days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProjectsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="rgb(229 231 235)"
                  dataKey="cost"
                >
                  {topProjectsData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {metrics.waste.top_repeated_hashes.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-fluid-xl font-semibold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />
            Top Repeated Prompts (Waste Detection)
          </h2>
          <div className="overflow-x-auto -mx-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-fluid-sm font-medium uppercase tracking-wider text-gray-500">
                    Prompt Hash
                  </th>
                  <th className="px-4 py-3 text-left text-fluid-sm font-medium uppercase tracking-wider text-gray-500">
                    Repeat Count
                  </th>
                  <th className="px-4 py-3 text-left text-fluid-sm font-medium uppercase tracking-wider text-gray-500">
                    Estimated Waste
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metrics.waste.top_repeated_hashes.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-4 text-fluid-sm font-mono text-gray-900">
                      {item.hash}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-fluid-sm text-gray-600">
                      {item.count}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-fluid-sm font-semibold text-red-600">
                      ${item.estimated_waste.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
