import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Server, Key, Palette, Info, Save, RotateCw, Check, Wifi, WifiOff } from 'lucide-react';
import { fetchConfig, saveConfig, testConnection } from '../api/client';
import toast from 'react-hot-toast';

export default function SettingsPanel() {
  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    fetchConfig().then(res => {
      if (res.success && res.data) {
        setConfig(res.data);
        setFormData(res.data);
      }
    });
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveConfig(formData);
      if (res.success) {
        toast.success('Settings saved! Server URL will take effect on next refresh.');
        setConfig(formData);
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestMessage('');
    try {
      const res = await testConnection(formData.llamaCppUrl, formData.llamaCppApiKey);
      if (res.success) {
        setTestMessage('Connection successful!');
        setConnected(true);
        toast.success('Connected to llama.cpp server');
      } else {
        setTestMessage(`Connection failed: ${res.error || 'Unknown error'}`);
        setConnected(false);
        toast.error(res.error || 'Connection failed');
      }
    } catch {
      setTestMessage('Connection failed: Network error');
      setConnected(false);
      toast.error('Network error');
    } finally {
      setTesting(false);
    }
  };

  if (!config) {
    return (
      <div className="max-w-2xl">
        <div className="card text-center py-12">
          <SettingsIcon size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-400 mt-1">Configure your dashboard preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={testing || saving}
            className="btn-secondary flex items-center gap-2"
          >
            {testing ? <RotateCw size={18} className="animate-spin" /> : <Wifi size={18} />}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || testing}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? <RotateCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Connection status */}
      {testMessage && (
        <div className={`card flex items-center gap-3 ${
          connected
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-red-500/30 bg-red-500/5'
        }`}>
          {connected ? (
            <Wifi size={20} className="text-emerald-400 shrink-0" />
          ) : (
            <WifiOff size={20} className="text-red-400 shrink-0" />
          )}
          <p className={`text-sm ${connected ? 'text-emerald-300' : 'text-red-300'}`}>
            {testMessage}
          </p>
        </div>
      )}

      {/* Server Connection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server size={20} className="text-blue-400" />
          Server Connection
        </h3>
        <div className="space-y-4">
          <SettingInput
            label="llama.cpp Server URL"
            value={formData.llamaCppUrl || ''}
            onChange={(v) => handleChange('llamaCppUrl', v)}
            placeholder="https://llm.aradhel.dev/v1"
            description="The base URL of your llama.cpp server (OpenAI-compatible endpoint)"
            required
          />
          <SettingInput
            label="API Key"
            value={formData.llamaCppApiKey || ''}
            onChange={(v) => handleChange('llamaCppApiKey', v)}
            placeholder="Leave empty if no authentication"
            description="API key for authenticating with the llama.cpp server"
            type="password"
          />
        </div>
      </div>

      {/* Dashboard Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <SettingsIcon size={20} className="text-purple-400" />
          Dashboard Settings
        </h3>
        <div className="space-y-4">
          <SettingInput
            label="Dashboard Name"
            value={formData.dashboardName || ''}
            onChange={(v) => handleChange('dashboardName', v)}
            placeholder="Llama Dashboard"
            description="Name displayed in the sidebar header"
          />
          <SettingInput
            label="Refresh Interval (ms)"
            value={formData.refreshInterval || ''}
            onChange={(v) => handleChange('refreshInterval', parseInt(v) || 0)}
            placeholder="10000"
            description="How often to refresh dashboard data (minimum 1000ms)"
            type="number"
            min={1000}
          />
          <SettingInput
            label="Max Tokens"
            value={formData.maxTokens || ''}
            onChange={(v) => handleChange('maxTokens', parseInt(v) || 0)}
            placeholder="4096"
            description="Default max tokens for chat completions"
            type="number"
          />
        </div>
      </div>

      {/* GPU Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info size={20} className="text-emerald-400" />
          GPU Configuration
        </h3>
        <div className="space-y-4">
          <SettingInput
            label="Primary GPU"
            value={formData.primaryGpu || ''}
            onChange={(v) => handleChange('primaryGpu', v)}
            placeholder="NVIDIA RTX PRO 4000 Blackwell"
            description="Name of the primary GPU"
          />
          <SettingInput
            label="VRAM (MB)"
            value={formData.vram || ''}
            onChange={(v) => handleChange('vram', parseInt(v) || 0)}
            placeholder="24576"
            description="Total VRAM in megabytes"
            type="number"
          />
          <SettingInput
            label="CUDA Version"
            value={formData.cudaVersion || ''}
            onChange={(v) => handleChange('cudaVersion', v)}
            placeholder="12.x"
            description="CUDA version in use"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Palette size={20} className="text-pink-400" />
          Appearance
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Theme</label>
            <select
              value={formData.theme || 'dark'}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="input w-full max-w-xs"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">UI theme (dark mode enforced in this build)</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info size={20} className="text-blue-400" />
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

function SettingInput({ label, value, onChange, placeholder, description, type = 'text', required, min }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-300 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (type === 'number') {
            onChange(e.target.value);
          } else {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
        className="input max-w-xl"
        required={required}
        min={min}
      />
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}
