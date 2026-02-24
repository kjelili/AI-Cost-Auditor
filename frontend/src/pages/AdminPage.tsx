import { useEffect, useState } from 'react';
import { adminApi, VirtualKey, UsageEvent } from '../api/admin';
import { Key, Plus, Copy, Check, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminPage = () => {
  const { user } = useAuth();
  const [virtualKeys, setVirtualKeys] = useState<VirtualKey[]>([]);
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedVkId, setSelectedVkId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    user_email: '',
    cost_centre: '',
    environment: '',
    agent_name: '',
    monthly_budget_cap: '',
    max_tokens_per_request: '',
    max_reasoning_tokens: '',
  });

  useEffect(() => {
    if (user?.is_admin) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [keys, events] = await Promise.all([
        adminApi.listVirtualKeys(),
        adminApi.listUsageEvents(50),
      ]);
      setVirtualKeys(keys);
      setUsageEvents(events);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        user_email: formData.user_email || null,
        cost_centre: formData.cost_centre || null,
        environment: formData.environment || null,
        agent_name: formData.agent_name || null,
        monthly_budget_cap: formData.monthly_budget_cap ? parseFloat(formData.monthly_budget_cap) : null,
        max_tokens_per_request: formData.max_tokens_per_request ? parseInt(formData.max_tokens_per_request) : null,
        max_reasoning_tokens: formData.max_reasoning_tokens ? parseInt(formData.max_reasoning_tokens) : null,
      };
      await adminApi.createVirtualKey(data);
      setShowCreateForm(false);
      setFormData({
        name: '',
        user_email: '',
        cost_centre: '',
        environment: '',
        agent_name: '',
        monthly_budget_cap: '',
        max_tokens_per_request: '',
        max_reasoning_tokens: '',
      });
      loadData();
    } catch (err) {
      console.error('Failed to create virtual key:', err);
      alert('Failed to create virtual key');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user?.is_admin) {
    return (
      <div className="card text-center">
        <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Manage virtual keys and view usage events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Virtual Key
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card animate-slide-up">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Virtual Key</h2>
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Production API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  className="input"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Centre</label>
                <input
                  type="text"
                  value={formData.cost_centre}
                  onChange={(e) => setFormData({ ...formData, cost_centre: e.target.value })}
                  className="input"
                  placeholder="e.g., Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="input"
                >
                  <option value="">Select...</option>
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={formData.agent_name}
                  onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                  className="input"
                  placeholder="e.g., HR Bot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget Cap ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_budget_cap}
                  onChange={(e) => setFormData({ ...formData, monthly_budget_cap: e.target.value })}
                  className="input"
                  placeholder="1000.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens per Request</label>
                <input
                  type="number"
                  value={formData.max_tokens_per_request}
                  onChange={(e) => setFormData({ ...formData, max_tokens_per_request: e.target.value })}
                  className="input"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Reasoning Tokens</label>
                <input
                  type="number"
                  value={formData.max_reasoning_tokens}
                  onChange={(e) => setFormData({ ...formData, max_reasoning_tokens: e.target.value })}
                  className="input"
                  placeholder="2000"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Virtual Keys List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2" />
          Virtual Keys ({virtualKeys.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget Cap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {virtualKeys.map((vk) => (
                <tr key={vk.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vk.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {vk.key.substring(0, 20)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(vk.key, vk.key)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy key"
                      >
                        {copiedKey === vk.key ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vk.user_email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vk.environment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vk.monthly_budget_cap ? `$${vk.monthly_budget_cap.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vk.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vk.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedVkId(selectedVkId === vk.id ? null : vk.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {selectedVkId === vk.id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Events */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Usage Events</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(event.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {event.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {event.total_tokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${event.total_cost.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.status_code === 200
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {event.status_code || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
