import { BarChart3, Clock, Zap, Repeat, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatDuration, formatBytes } from '../utils/formatters';

export default function Stats({ stats }) {
  if (!stats) {
    return (
      <div className="card text-center py-12">
        <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No Statistics Available</h3>
        <p className="text-gray-500">Statistics will appear here once the server processes requests.</p>
      </div>
    );
  }

  const avgEvalTime = stats.t_eval_count > 0
    ? stats.t_eval_time / stats.t_eval_count
    : 0;

  const avgPromptTime = stats.t_prompt_count > 0
    ? stats.t_prompt_time / stats.t_prompt_count
    : 0;

  const tokensPerSecond = stats.t_eval_time > 0
    ? (stats.t_eval_count / stats.t_eval_time) * 1000
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Statistics & Usage</h2>
        <p className="text-gray-400 mt-1">Server performance and token usage metrics</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={BarChart3}
          label="Total Tokens"
          value={stats.t_token_count?.toLocaleString() || '0'}
          subtext="All tokens processed"
          color="blue"
        />
        <MetricCard
          icon={ArrowUpRight}
          label="Prompt Tokens"
          value={stats.t_prompt_count?.toLocaleString() || '0'}
          subtext="Input tokens"
          color="emerald"
        />
        <MetricCard
          icon={ArrowDownRight}
          label="Output Tokens"
          value={stats.t_eval_count?.toLocaleString() || '0'}
          subtext="Generated tokens"
          color="purple"
        />
        <MetricCard
          icon={Zap}
          label="Tokens/Second"
          value={tokensPerSecond.toFixed(1)}
          subtext="Generation speed"
          color="orange"
        />
      </div>

      {/* Timing breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            Processing Times
          </h3>
          <div className="space-y-4">
            <TimingRow
              label="Total Prompt Time"
              value={stats.t_prompt_time ? formatDuration(stats.t_prompt_time) : '-'}
              avg={avgPromptTime > 0 ? `${avgPromptTime.toFixed(2)}ms/token` : '-'}
            />
            <TimingRow
              label="Total Eval Time"
              value={stats.t_eval_time ? formatDuration(stats.t_eval_time) : '-'}
              avg={avgEvalTime > 0 ? `${avgEvalTime.toFixed(2)}ms/token` : '-'}
            />
            <TimingRow
              label="First Token Latency"
              value={stats.timings?.prompt_per_token_ms ? `${stats.timings.prompt_per_token_ms.toFixed(2)}ms` : '-'}
              avg=""
            />
            <TimingRow
              label="Decode per Token"
              value={stats.timings?.eval_per_token_ms ? `${stats.timings.eval_per_token_ms.toFixed(2)}ms` : '-'}
              avg=""
            />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Repeat size={20} className="text-emerald-400" />
            Token Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Prompt Tokens</span>
                <span className="text-white font-medium">
                  {stats.t_token_count > 0
                    ? `${((stats.t_prompt_count || 0) / stats.t_token_count * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: stats.t_token_count
                      ? `${((stats.t_prompt_count || 0) / stats.t_token_count) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Output Tokens</span>
                <span className="text-white font-medium">
                  {stats.t_token_count > 0
                    ? `${((stats.t_eval_count || 0) / stats.t_token_count * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: stats.t_token_count
                      ? `${((stats.t_eval_count || 0) / stats.t_token_count) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Prompt Tokens</p>
                  <p className="text-xl font-bold text-blue-400">{stats.t_prompt_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Eval Tokens</p>
                  <p className="text-xl font-bold text-emerald-400">{stats.t_eval_count || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raw stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Raw Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatItem label="Total Tokens" value={stats.t_token_count || 0} />
          <StatItem label="Prompt Tokens" value={stats.t_prompt_count || 0} />
          <StatItem label="Eval Tokens" value={stats.t_eval_count || 0} />
          <StatItem label="Prompt Time (ms)" value={stats.t_prompt_time?.toFixed(2) || 0} />
          <StatItem label="Eval Time (ms)" value={stats.t_eval_time?.toFixed(2) || 0} />
          <StatItem label="Expected VRAM (GB)" value={stats.vram_required_tokens?.toFixed(2) || 0} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, color }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="card-hover">
      <div className="flex items-center gap-3 mb-3">
        <div className={colors[color]}>
          <Icon size={18} />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-label mt-1">{subtext}</p>
    </div>
  );
}

function TimingRow({ label, value, avg }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-3">
        {avg && <span className="text-xs text-gray-500">avg: {avg}</span>}
        <span className="text-sm font-medium text-white">{value}</span>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="p-3 bg-gray-800/50 rounded-lg">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
