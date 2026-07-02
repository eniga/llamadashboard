import { Cpu, Box, BarChart3, MessageSquare, Clock, Zap, ArrowRight } from 'lucide-react';
import { formatBytes, formatDuration } from '../utils/formatters';

export default function Dashboard({ devices, models, stats, connected }) {
  const loadedModels = models.filter(m => m.loaded);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-gray-400 mt-1">
            {connected
              ? 'Your llama.cpp server is running and connected'
              : 'Unable to connect to llama.cpp server'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-800">
            <Zap size={16} className={connected ? 'text-emerald-400' : 'text-red-400'} />
            <span className="text-sm text-gray-300">
              {connected ? 'Operational' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Cpu}
          label="GPUs"
          value={devices.length || 0}
          subtext={devices[0]?.name || 'No devices detected'}
          color="blue"
        />
        <StatCard
          icon={Box}
          label="Available Models"
          value={models.length}
          subtext={`${loadedModels.length} currently loaded`}
          color="emerald"
        />
        <StatCard
          icon={BarChart3}
          label="Tokens Processed"
          value={stats?.t_token_count || 0}
          subtext={`Eval: ${stats?.t_eval_count || 0} | Prompt: ${stats?.t_prompt_count || 0}`}
          color="purple"
        />
        <StatCard
          icon={Clock}
          label="Avg Token Time"
          value={stats?.t_token_time ? `${(stats.t_token_time / (stats.t_eval_count || 1)).toFixed(1)}ms` : '0ms'}
          subtext="per token"
          color="orange"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VRAM Usage */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu size={20} className="text-blue-400" />
            GPU Memory
          </h3>
          {devices.length > 0 ? (
            <div className="space-y-4">
              {devices.map(device => {
                const vramGb = (device.vram / 1024).toFixed(0);
                const usedGb = ((device.vramUsed || 0) / 1024).toFixed(1);
                return (
                  <div key={device.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{device.name}</span>
                      <span className="text-gray-400">
                        {usedGb} GB / {vramGb} GB
                      </span>
                    </div>
                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                      style={{
                        width: device.vram
                          ? `${((device.vramUsed || 0) / device.vram) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No GPU information available</p>
          )}
        </div>

        {/* Currently Loaded Models */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Box size={20} className="text-emerald-400" />
            Loaded Models
          </h3>
          {loadedModels.length > 0 ? (
            <div className="space-y-3">
              {loadedModels.map(model => (
                <div key={model.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{model.id}</p>
                    <p className="text-xs text-gray-400">{model.owned_by || 'local'}</p>
                  </div>
                  <span className="badge-green ml-2 shrink-0">Active</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Box size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No models currently loaded</p>
            </div>
          )}
        </div>

        {/* Recent Activity / Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-400" />
            Server Stats
          </h3>
          <div className="space-y-3">
            <StatRow label="Total Tokens" value={stats?.t_token_count || 0} />
            <StatRow label="Prompt Tokens" value={stats?.t_prompt_count || 0} />
            <StatRow label="Evaluation Tokens" value={stats?.t_eval_count || 0} />
            <StatRow label="Processing Time" value={stats?.t_prompt_time ? formatDuration(stats.t_prompt_time) : '-'} />
            <StatRow label="Evaluation Time" value={stats?.t_eval_time ? formatDuration(stats.t_eval_time) : '-'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="card-hover">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={18} />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="stat-value">{typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}</p>
      {subtext && <p className="stat-label mt-1">{subtext}</p>}
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-white">
        {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
