import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Box,
  BarChart3,
  MessageSquare,
  Settings,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  MemoryStick,
  Clock,
  Terminal,
  Copy,
  Check
} from 'lucide-react';
import { fetchDevices, fetchModels, fetchStats, fetchConfig, checkHealth, loadModel, unloadModel } from './api/client';
import Dashboard from './components/Dashboard';
import Devices from './components/Devices';
import Models from './components/Models';
import Stats from './components/Stats';
import Chat from './components/Chat';
import SettingsPanel from './components/SettingsPanel';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'devices', label: 'Devices', icon: Cpu },
  { id: 'models', label: 'Models', icon: Box },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const location = window.location;
  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [devices, setDevices] = useState([]);
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [configRes, devicesRes, modelsRes, statsRes, healthRes] = await Promise.all([
        fetchConfig(),
        fetchDevices(),
        fetchModels(),
        fetchStats(),
        checkHealth(),
      ]);

      if (configRes.success) setConfig(configRes.data);
      if (devicesRes.success) setDevices(devicesRes.data || []);
      if (modelsRes.success) setModels(modelsRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
      setConnected(healthRes.success);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="loading-spinner mx-auto w-10 h-10"></div>
          <p className="text-gray-400">Connecting to llama.cpp server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
        }}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🦙</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gradient">{config?.dashboardName || 'Llama Dashboard'}</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-400">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={`/${item.id}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all"
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard devices={devices} models={models} stats={stats} connected={connected} />} />
          <Route path="/devices" element={<Devices devices={devices} />} />
          <Route path="/models" element={<Models models={models} onRefresh={fetchData} onModelAction={fetchData} />} />
          <Route path="/stats" element={<Stats stats={stats} />} />
          <Route path="/chat" element={<Chat connected={connected} />} />
          <Route path="/settings" element={<SettingsPanel />} />
        </Routes>
      </main>
    </div>
  );
}

