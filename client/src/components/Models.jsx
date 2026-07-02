import { useState, useEffect } from 'react';
import { Box, Loader2, Play, StopCircle, RefreshCw, Info } from 'lucide-react';
import { loadModel, unloadModel, fetchModels } from '../api/client';
import toast from 'react-hot-toast';

export default function Models({ models, onRefresh, onModelAction }) {
  const [loadingModel, setLoadingModel] = useState(null);
  const [showLoadForm, setShowLoadForm] = useState(false);
  const [loadModelName, setLoadModelName] = useState('');

  const handleLoad = async () => {
    if (!loadModelName.trim()) return;
    setLoadingModel(loadModelName);
    try {
      const res = await loadModel(loadModelName.trim());
      if (res.success) {
        toast.success(`Loading model: ${loadModelName}`);
        setLoadModelName('');
        setShowLoadForm(false);
        await onModelAction();
      } else {
        toast.error(res.error || 'Failed to load model');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load model');
    } finally {
      setLoadingModel(null);
    }
  };

  const handleUnload = async (modelId) => {
    try {
      const res = await unloadModel(modelId);
      if (res.success) {
        toast.success(`Unloaded model: ${modelId}`);
        await onModelAction();
      } else {
        toast.error(res.error || 'Failed to unload model');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to unload model');
    }
  };

  const loadedModels = models.filter(m => m.loaded);
  const unloadedModels = models.filter(m => !m.loaded);

  // If no loaded models but models exist, fetch fresh data
  useEffect(() => {
    if (models.length > 0 && loadedModels.length === 0) {
      fetchModels().then(res => {
        if (res.success && res.data) {
          onRefresh?.();
        }
      });
    }
  }, [models, loadedModels.length]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Models</h2>
          <p className="text-gray-400 mt-1">
            {loadedModels.length > 0
              ? `${loadedModels.length} model${loadedModels.length > 1 ? 's' : ''} currently loaded`
              : 'No models currently loaded'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLoadForm(!showLoadForm)}
            className="btn-primary flex items-center gap-2"
          >
            {showLoadForm ? <StopCircle size={18} /> : <Play size={18} />}
            {showLoadForm ? 'Cancel' : 'Load Model'}
          </button>
          <button onClick={onRefresh} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Load model form */}
      {showLoadForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play size={20} className="text-emerald-400" />
            Load a Model
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={loadModelName}
              onChange={(e) => setLoadModelName(e.target.value)}
              placeholder="Enter model name (e.g., llama-3.1-8b-instruct.Q4_K_M.gguf)"
              className="input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
              disabled={loadingModel !== null}
            />
            <button
              onClick={handleLoad}
              disabled={!loadModelName.trim() || loadingModel !== null}
              className="btn-primary flex items-center gap-2"
            >
              {loadingModel ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              Load
            </button>
          </div>
        </div>
      )}

      {/* Loaded models */}
      {loadedModels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Box size={20} className="text-emerald-400" />
            Currently Loaded
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loadedModels.map(model => (
              <div key={model.id} className="card-hover border-emerald-500/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h4 className="text-white font-medium truncate">{model.id}</h4>
                    <p className="text-sm text-gray-400">{model.owned_by || 'local'}</p>
                  </div>
                  <span className="badge-green">Loaded</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUnload(model.id)}
                    className="btn-danger flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    <StopCircle size={16} />
                    Unload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available models */}
      {unloadedModels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Available Models</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {unloadedModels.map(model => (
              <div key={model.id} className="card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <h4 className="text-white font-medium truncate">{model.id}</h4>
                    <p className="text-sm text-gray-400">{model.owned_by || 'local'}</p>
                  </div>
                  <span className="badge-yellow">Available</span>
                </div>
                <button
                  onClick={() => {
                    setLoadModelName(model.id);
                    setShowLoadForm(true);
                  }}
                  className="btn-success w-full flex items-center justify-center gap-2 text-sm"
                >
                  <Play size={16} />
                  Load Model
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {models.length === 0 && !showLoadForm && (
        <div className="card text-center py-12">
          <Box size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Models Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            The server returned no models. This could mean:
          </p>
          <ul className="text-gray-500 text-sm text-left max-w-md mx-auto space-y-1">
            <li>• The llama.cpp server has no models in its models directory</li>
            <li>• The server is running but hasn't indexed the models yet</li>
            <li>• You can manually load a model using the "Load Model" button above</li>
          </ul>
          <button onClick={onRefresh} className="btn-secondary mt-4">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      )}

      {/* No loaded models but models exist */}
      {models.length > 0 && loadedModels.length === 0 && !showLoadForm && (
        <div className="card text-center py-8">
          <Box size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Models Currently Loaded</h3>
          <p className="text-gray-500 mb-4">
            {models.length} model{models.length > 1 ? 's' : ''} available. Select one to load.
          </p>
          <button
            onClick={() => setShowLoadForm(true)}
            className="btn-primary"
          >
            <Play size={16} />
            Load a Model
          </button>
        </div>
      )}
    </div>
  );
}
