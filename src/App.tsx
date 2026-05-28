/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Message, LMStudioConfig, ConnectionStatus } from './types';
import UploadZone from './components/UploadZone';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PromptChips from './components/PromptChips';
import { Terminal, Shield, RefreshCw, Smartphone, Monitor } from 'lucide-react';

// Compress image to reduce payload size and improve loading speed
const compressImage = async (base64: string, maxWidth: number = 512): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64);
      }
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
};

export default function App() {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [serverStatus, setServerStatus] = useState<ConnectionStatus>('checking');
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);

  const [config, setConfig] = useState<LMStudioConfig>({
    endpoint: 'http://localhost:1234',
    model: 'moondream2',
    availableModels: [],
  });

  // Check connection only once on mount, with caching
  useEffect(() => {
    if (!hasCheckedConnection) {
      // Try to restore from cache first
      const cached = localStorage.getItem('lm-studio-models');
      if (cached) {
        try {
          const { models, timestamp } = JSON.parse(cached);
          // Use cache if less than 10 minutes old
          if (Date.now() - timestamp < 600000) {
            setConfig((prev) => ({
              ...prev,
              availableModels: models,
              model: models.includes(prev.model) ? prev.model : models[0] || prev.model,
            }));
            setServerStatus('connected');
            setHasCheckedConnection(true);
            return;
          }
        } catch (e) {
          // Cache invalid, proceed with fetch
        }
      }
      checkServerConnection();
      setHasCheckedConnection(true);
    }
  }, [hasCheckedConnection]);

  const checkServerConnection = async () => {
    setIsTesting(true);
    setServerStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${config.endpoint}/v1/models`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const modelList = data.data?.map((m: any) => m.id) || [];
      
      let nextModel = config.model;
      if (modelList.length > 0) {
        if (!modelList.includes(config.model)) {
          nextModel = modelList[0];
        }
      }

      setConfig((prev) => ({
        ...prev,
        model: nextModel,
        availableModels: modelList,
      }));
      // Cache models for next time
      localStorage.setItem('lm-studio-models', JSON.stringify({
        models: modelList,
        timestamp: Date.now(),
      }));
      setServerStatus('connected');
    } catch (err: any) {
      console.warn('Connection failed:', err.message);
      setServerStatus('disconnected');
    } finally {
      setIsTesting(false);
    }
  };

  const handleUpdateConfig = (newVals: Partial<LMStudioConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newVals,
    }));
  };

  const handleClearImage = () => {
    setActiveImage(null);
    setFileName('');
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSelectPresetPrompt = (presetText: string) => {
    if (!activeImage) return;
    handleSendMessage(presetText);
  };

  const handleSendMessage = async (rawInput: string) => {
    if (!rawInput.trim() || isLoading) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: rawInput,
      timestamp: timeString,
      imageUrl: activeImage || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const requestMessages: any[] = [];
      
      // Limit to last 2 messages for faster inference (keep conversation context light)
      const recentMessages = messages.slice(-2);
      
      recentMessages.forEach((m) => {
        if (m.role === 'user') {
          const contentItems: any[] = [{ type: 'text', text: m.content }];
          if (m.imageUrl) {
            contentItems.push({
              type: 'image_url',
              image_url: { url: m.imageUrl }
            });
          }
          requestMessages.push({ role: 'user', content: contentItems });
        } else if (m.role === 'assistant') {
          requestMessages.push({ role: 'assistant', content: m.content });
        }
      });

      const activeContent: any[] = [{ type: 'text', text: rawInput }];
      if (activeImage) {
        activeContent.push({
          type: 'image_url',
          image_url: { url: activeImage }
        });
      }
      requestMessages.push({ role: 'user', content: activeContent });

      const res = await fetch(`${config.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          model: config.model,
          messages: requestMessages,
          temperature: 0.1,
          max_tokens: 512,
          top_p: 0.9,
        }),
      });

      if (!res.ok) {
        throw new Error(`Inference Server returned HTTP error status ${res.status}`);
      }

      const replyData = await res.json();
      const assistantResponse = replyData.choices?.[0]?.message?.content || 
        'Model executed successfully but returned empty content.';
      
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Vision inference error:', err);
      
      const errResponse = `**LM STUDIO CONNECTION ERROR**

Could not connect to LM Studio at \`${config.endpoint}\`.

**Troubleshooting:**
1. Ensure LM Studio is running
2. Start the Local Server (port 1234)
3. Load a vision model (Moondream2 or LLaVA)
4. Check that CORS is enabled

*Error: ${err.message}*`;

      const assistantErrorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isError: true,
      };

      setMessages((prev) => [...prev, assistantErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelected = async (base64Data: string, name: string) => {
    const compressed = await compressImage(base64Data);
    setActiveImage(compressed);
    setFileName(name);
  };

  return (
    <main className="min-h-screen bg-[#050507] text-slate-200 relative overflow-x-hidden p-4 md:p-6 lg:p-8 flex flex-col justify-between">
      {/* Visual cyber-grid pattern */}
      <div className="absolute inset-0 cyber-grid pointer-events-none z-0" />
      
      {/* Atmosphere Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between relative z-10 gap-6">
        
        {/* Header Section */}
        <header className="h-16 flex items-center justify-between px-6 bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl relative">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
              NEURAL<span className="text-cyan-400 font-light">SIGHT</span> 
              <span className="text-[9px] bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest ml-2 hidden sm:inline-block">
                Vision v2.0
              </span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'connected' 
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                  : serverStatus === 'checking' 
                    ? 'bg-cyan-500' 
                    : 'bg-rose-500'
              }`}></div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium hidden sm:inline">
                {serverStatus === 'connected' ? 'API Online' : serverStatus === 'checking' ? 'Checking...' : 'API Offline'}
              </span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            <div className="flex items-center space-x-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-[10px] text-slate-500 uppercase tracking-tighter hidden sm:inline">Model</span>
              <span className="text-xs font-mono text-cyan-300 truncate max-w-[150px]">
                {config.model}
              </span>
            </div>
          </div>
        </header>

        {/* Core Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* Left Pane: Image Input */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase mb-3.5">
                  FRAME TELEMETRY ENCODING
                </h4>
                <UploadZone
                  onImageSelected={handleImageSelected}
                  selectedImage={activeImage}
                  onClearImage={handleClearImage}
                />
              </div>

              <div className="mt-5">
                <PromptChips
                  onSelectPrompt={handleSelectPresetPrompt}
                  disabled={isLoading || !activeImage}
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <Sidebar
                config={config}
                onChangeConfig={handleUpdateConfig}
                serverStatus={serverStatus}
                activeModel={config.model}
                onTestConnection={checkServerConnection}
                isTesting={isTesting}
              />
            </div>
          </div>

          {/* Right Pane: Chat Console */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              activeImage={activeImage}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              serverStatus={serverStatus}
              selectedModel={config.model}
            />
          </div>

        </div>

        {/* Bottom Status Bar */}
        <footer className="h-10 sm:h-8 bg-black/40 border border-white/10 flex items-center px-6 justify-between text-[10px] tracking-tight text-slate-500 font-mono rounded-xl backdrop-blur-md">
          <div className="flex space-x-4">
            <span>ENGINE: <span className="text-slate-400">LM Studio</span></span>
            <span>STATUS: <span className={serverStatus === 'connected' ? 'text-emerald-500' : 'text-rose-500'}>{serverStatus.toUpperCase()}</span></span>
          </div>
          <div className="hidden md:flex space-x-4">
            <span className="uppercase italic">Privacy Mode: Active (Fully Offline)</span>
          </div>
        </footer>

      </div>
    </main>
  );
}
