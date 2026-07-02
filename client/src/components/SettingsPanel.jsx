import { Settings as SettingsIcon, Server, Key, Palette, Info } from 'lucide-react';

export default function SettingsPanel({ config }) {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 mt-1">Configure your dashboard preferences</p>
      </div>

      {/* Server Connection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server size={20} className="text-blue-400" />
          Server Connection
        </h3>
        <div className="space-y-4">
          <SettingField
            label="llama.cpp Server URL"
            value={config?.llamaCppUrl || 'https://llm.aradhel.dev/v1'}
            description="The base URL of your llama.cpp server"
            readonly
          />
          <SettingField
            label="Refresh Interval"
            value={`${config?.refreshInterval || 10000}ms`}
            description="How often to refresh dashboard data"
            readonly
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Palette size={20} className="text-purple-400" />
          Appearance
        </h3>
        <div className="space-y-4">
          <SettingField
            label="Theme"
            value={config?.theme || 'dark'}
            description="UI theme (dark mode enforced)"
            readonly
          />
          <SettingField
            label="Dashboard Name"
            value={config?.dashboardName || 'Llama Dashboard'}
            description="Name displayed in the sidebar"
            readonly
          />
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info size={20} className="text-emerald-400" />
          About
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Version</span>
            <span className="text-white">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Backend</span>
            <span className="text-white">Express.js</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Frontend</span>
            <span className="text-white">React + Vite + Tailwind</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">API Protocol</span>
            <span className="text-white">OpenAI Compatible</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingField({ label, value, description, readonly }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {readonly && <span className="text-xs text-gray-500">Read-only</span>}
      </div>
      <div className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg">
        <p className="text-white text-sm">{value}</p>
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
