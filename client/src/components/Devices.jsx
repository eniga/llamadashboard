import { Cpu, MemoryStick, Info, RefreshCw } from 'lucide-react';

export default function Devices({ devices }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Device Information</h2>
          <p className="text-gray-400 mt-1">Hardware and GPU details for your server</p>
        </div>
      </div>

      {devices.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {devices.map(device => (
            <div key={device.id} className="card-hover">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Cpu size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                    <p className="text-sm text-gray-400">GPU {device.id} • {device.vendor}</p>
                  </div>
                </div>
                <span className="badge-green">{device.status || 'Ready'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <DeviceInfo label="VRAM (Total)" value={`${(device.vram / 1024).toFixed(0)} GB`} />
                <DeviceInfo label="VRAM (Used)" value={`${((device.vramUsed || 0) / 1024).toFixed(1)} GB`} />
                <DeviceInfo label="VRAM (Free)" value={`${((device.vramFree || device.vram) / 1024).toFixed(1)} GB`} />
                <DeviceInfo label="Compute Capability" value={device.computeCapability || 'N/A'} />
                <DeviceInfo label="CUDA Version" value={device.cudaVersion || 'N/A'} />
                <DeviceInfo label="Device Type" value={device.type || 'GPU'} />
              </div>

              {device.vram && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Memory Utilization</span>
                    <span className="text-white font-medium">
                      {device.vram ? `${((device.vramUsed || 0) / device.vram) * 100}%` : '0%'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                      style={{ width: device.vram ? `${((device.vramUsed || 0) / device.vram) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Cpu size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Devices Detected</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Unable to retrieve device information from the llama.cpp server. 
            Ensure the server is running with GPU support enabled.
          </p>
        </div>
      )}

      {/* Server info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info size={20} className="text-blue-400" />
          Server Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Backend</p>
            <p className="text-white font-medium">CUDA</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Device Count</p>
            <p className="text-white font-medium">{devices.length || 0}</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Total VRAM</p>
            <p className="text-white font-medium">
              {`${(devices.reduce((sum, d) => sum + (d.vram || 0), 0) / 1024).toFixed(0)} GB`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}
