/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Server, RefreshCw, Cpu, Check, AlertCircle, ShieldAlert, Wifi, WifiOff, FileCode } from 'lucide-react';
import { ConnectionStatus, LMStudioConfig, BackendType } from '../types';

interface SidebarProps {
  config: LMStudioConfig;
  onChangeConfig: (newConfig: Partial<LMStudioConfig>) => void;
  serverStatus: ConnectionStatus;
  activeModel: string;
  onTestConnection: () => Promise<void>;
  isTesting: boolean;
  backendType?: BackendType;
}

export default function Sidebar({
  config,
  onChangeConfig,
  serverStatus,
  activeModel,
  onTestConnection,
  isTesting,
  backendType = 'lm-studio'
}: SidebarProps) {
  const [editingEndpoint, setEditingEndpoint] = useState(config.endpoint);
  const [editingModel, setEditingModel] = useState(config.model);

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeConfig({
      endpoint: editingEndpoint.trim(),
      model: editingModel.trim()
    });
  };

  const handleReset = () => {
    const defaultEndpoint = backendType === 'moondream' ? 'http://localhost:8000' : 'http://localhost:1234';
    const defaultModel = 'moondream2';
    setEditingEndpoint(defaultEndpoint);
    setEditingModel(defaultModel);
    onChangeConfig({
      endpoint: defaultEndpoint,
      model: defaultModel
    });
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Network Connectivity Block & Live Monitor */}
      <div className="cyber-glass rounded-lg border border-cyber-border p-4 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[10px] bg-gradient-to-b from-transparent to-transparent" />
        
        <div className="flex items-center justify-between mb-3.5">
          <h4 className="text-[10px] font-mono tracking-widest text-cyber-neon-blue uppercase">
            LOCAL ENGINE STATUS
          </h4>
          <span className="flex h-2.5 w-2.5 relative">
            {serverStatus === 'connected' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-neon-green"></span>
              </>
            ) : serverStatus === 'checking' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-neon-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-neon-blue"></span>
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-neon-pink opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-neon-pink"></span>
              </>
            )}
          </span>
        </div>

        {/* Big visual banner of state */}
        <div className="bg-cyber-black/70 border border-cyber-border rounded p-3 mb-3 text-center">
          {serverStatus === 'connected' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-cyber-neon-green">
                <Wifi className="w-5 h-5" />
                <span className="font-display font-semibold text-xs tracking-wider uppercase">ONLINE STATION</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">ENDPOINT RESOLVED SUCCESSFULLY</p>
            </div>
          ) : serverStatus === 'checking' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-cyber-neon-blue animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="font-display font-semibold text-xs tracking-wider uppercase">PINGING LOCALHOST...</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">RESOLVING SERVICE PORTS</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-cyber-neon-pink">
                <WifiOff className="w-5 h-5" />
                <span className="font-display font-semibold text-xs tracking-wider uppercase">API SERVER OFFLINE</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-pretty">LOCALHOST:1234 REFUSED PING</p>
            </div>
          )}
        </div>

        {/* Model and Server Info Spec */}
        <div className="space-y-2 py-1 border-t border-cyber-border/40 mt-3 pt-3 text-[11px] font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>ACTIVE MODEL:</span>
            <span className="text-slate-200 uppercase truncate max-w-[140px] text-right font-medium text-cyber-neon-blue">
              {serverStatus === 'connected' ? (activeModel || config.model) : 'NONE'}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>PING CODE:</span>
            <span className="text-slate-200">
              {serverStatus === 'connected' ? '200 OK_COMPATIBLE' : serverStatus === 'checking' ? 'PENDING...' : 'ERR_CONN_REFUSED'}
            </span>
          </div>
        </div>

        <button
          onClick={onTestConnection}
          disabled={isTesting}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-[rgba(30,38,64,0.4)] hover:bg-cyber-neon-blue hover:text-cyber-black text-slate-300 font-display font-medium text-xs border border-cyber-border hover:border-cyber-neon-blue hover:neon-glow-blue rounded transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          {isTesting ? 'Testing Link...' : 'Test Connection'}
        </button>
      </div>

      {/* API Endpoint Configurations & Model Settings */}
      <div className="cyber-glass rounded-lg border border-cyber-border p-4 relative">
        <h4 className="text-[10px] font-mono tracking-widest text-[#9d4edd] uppercase mb-4">
          PORT & HOST CONFIGURATION
        </h4>

        <form onSubmit={handleApplySettings} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-mono mb-1.5 text-[10px] uppercase">
              {backendType === 'moondream' ? 'Moondream Backend' : 'LM Studio'} Endpoint URL:
            </label>
            <input
              type="text"
              value={editingEndpoint}
              onChange={(e) => setEditingEndpoint(e.target.value)}
              placeholder={backendType === 'moondream' ? "http://localhost:8000" : "http://localhost:1234"}
              className="w-full bg-cyber-black border border-cyber-border rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#9d4edd] focus:neon-border-pink"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1.5 text-[10px] uppercase">
              Active Vision Model Tag:
            </label>
            {config.availableModels.length > 0 ? (
              <select
                value={config.model}
                onChange={(e) => {
                  setEditingModel(e.target.value);
                  onChangeConfig({ model: e.target.value });
                }}
                className="w-full bg-cyber-black border border-cyber-border rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#9d4edd] focus:neon-border-pink cursor-pointer"
              >
                {config.availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={editingModel}
                onChange={(e) => setEditingModel(e.target.value)}
                placeholder="e.g. moondream2 or llava"
                className="w-full bg-cyber-black border border-cyber-border rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#9d4edd] focus:neon-border-pink"
              />
            )}
            <p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal uppercase">
              If model auto-detection fails, enter your custom model tag above exactly as declared in LM Studio.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-1.5 px-2 bg-transparent text-slate-400 hover:text-slate-200 hover:bg-cyber-gray border border-cyber-border rounded text-[11px] font-display transition-all cursor-pointer text-center"
            >
              Reset defaults
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 px-2 bg-[rgba(157,78,221,0.1)] hover:bg-[#9d4edd] text-slate-200 hover:text-white border border-[#9d4edd] rounded text-[11px] font-display transition-all cursor-pointer font-medium text-center"
            >
              Apply Config
            </button>
          </div>
        </form>
      </div>

      {/* Localhost Privacy Shield Information */}
      <div className="cyber-glass rounded-lg border border-cyber-border/80 bg-[rgba(13,15,26,0.5)] p-4 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-cyber-neon-green shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h5 className="font-display font-medium text-slate-200 text-xs">Offline Privacy Mode</h5>
            <p className="text-[10px] leading-relaxed text-slate-450 font-mono">
              All vectorization, tokenization, image conversion, and vision inference are executed locally on your workstation hardware. Zero metrics or pixel data leave this device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
