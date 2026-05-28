/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { Send, Trash2, Cpu, Copy, Check, Terminal, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  activeImage: string | null;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  serverStatus: 'connected' | 'disconnected' | 'checking';
  selectedModel: string;
}

export default function ChatWindow({
  messages,
  isLoading,
  activeImage,
  onSendMessage,
  onClearChat,
  serverStatus,
  selectedModel,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopy = async (text: string, msgId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const parseFormattedText = (text: string) => {
    if (!text) return null;
    
    // Split text by lines to construct proper layout
    const lines = text.split('\n');
    
    return lines.map((line, lineIdx) => {
      // Check for markdown sub-headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={lineIdx} className="text-sm font-semibold font-display text-cyber-neon-blue mt-3 mb-1 uppercase tracking-wider">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={lineIdx} className="text-base font-semibold font-display text-[#9d4edd] mt-4 mb-2 border-b border-[rgba(157,78,221,0.2)] pb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }
      
      // Bullet items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const cleaned = line.replace(/^[\s]*[-*]\s+/, '');
        return (
          <div key={lineIdx} className="flex items-start gap-2 ml-2 my-1 text-slate-300">
            <span className="text-cyber-neon-blue font-bold text-xs mt-1">▪</span>
            <span className="text-xs leading-relaxed">{formatInlineBold(cleaned)}</span>
          </div>
        );
      }

      // Numbered List Items
      if (/^\d+\.\s+/.test(line.trim())) {
        const cleaned = line.trim().replace(/^\d+\.\s+/, '');
        const num = line.trim().match(/^\d+/)?.[0];
        return (
          <div key={lineIdx} className="flex items-start gap-2 ml-2 my-1 text-slate-300">
            <span className="text-cyber-neon-purple font-mono font-bold text-xs mt-0.5">{num}.</span>
            <span className="text-xs leading-relaxed">{formatInlineBold(cleaned)}</span>
          </div>
        );
      }

      // Pure empty lines
      if (!line.trim()) {
        return <div key={lineIdx} className="h-2" />;
      }

      // Regular paragraph line
      return (
        <p key={lineIdx} className="text-xs leading-relaxed text-slate-350 my-1">
          {formatInlineBold(line)}
        </p>
      );
    });
  };

  // Safe helper to bold instances of **text** inline
  const formatInlineBold = (raw: string) => {
    const parts = raw.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-cyber-neon-blue font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      
      // Inline backticks `code`
      const codeParts = part.split(/(`.*?`)/g);
      return codeParts.map((subPart, j) => {
        if (subPart.startsWith('`') && subPart.endsWith('`')) {
          return (
            <code key={j} className="bg-cyber-gray px-1.5 py-0.5 rounded text-[11px] font-mono border border-cyber-border text-[#ff007f]">
              {subPart.slice(1, -1)}
            </code>
          );
        }
        return subPart;
      });
    });
  };

  return (
    <div className="flex flex-col h-full cyber-glass rounded-lg border border-cyber-border overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-neon-blue to-transparent opacity-50" />
      
      {/* Upper Terminal Title Rail */}
      <div className="flex items-center justify-between px-4 py-3 bg-[rgba(13,15,26,0.8)] border-b border-cyber-border font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyber-neon-blue" />
          <span className="text-xs text-slate-300 uppercase tracking-widest font-semibold flex items-center gap-2">
            Local Vision Console 
            <span className="text-[10px] text-slate-500 font-normal">v1.2.0</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyber-neon-pink bg-[rgba(30,38,64,0.3)] hover:bg-[rgba(255,0,127,0.1)] border border-cyber-border hover:border-cyber-neon-pink px-2.5 py-1 rounded transition-all cursor-pointer font-display"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Buffer</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Window Panel */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 cyber-grid relative min-h-[300px]"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
            >
              <Cpu className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
              <h5 className="font-display text-slate-300 font-medium mb-1 text-sm uppercase tracking-wider">
                System Awaiting Frame Loader
              </h5>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Upload JPG, PNG, or WEBP. Choose an analysis prompt chip or enter custom requests. Execution operates fully on your local hardware.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 max-w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* Role header bar with info */}
                    <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-slate-500">
                      <span>{isUser ? 'HOST_VISITOR' : `MODEL_LOG // ${selectedModel || 'OFFLINE'}`}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Chat Bubble card container */}
                    <div 
                      className={`rounded-lg p-3.5 border ${
                        isUser 
                          ? 'bg-[rgba(30,38,64,0.4)] border-cyber-border text-slate-200' 
                          : msg.isError 
                            ? 'bg-[rgba(255,0,127,0.05)] border-[rgba(255,0,127,0.3)] text-cyber-neon-pink'
                            : 'bg-cyber-gray border-cyber-border text-slate-200'
                      }`}
                    >
                      {/* Attach analyzed frame payload inside user prompt trigger bubble */}
                      {isUser && msg.imageUrl && (
                        <div className="mb-3 rounded overflow-hidden max-w-[200px] border border-cyber-border bg-black">
                          <img 
                            src={msg.imageUrl} 
                            alt="Analyzed frame" 
                            className="max-h-32 w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="bg-black/60 text-[8px] font-mono text-center text-slate-400 py-0.5">
                            ANALYZED FRAME ATTACHED
                          </div>
                        </div>
                      )}

                      {/* Content block */}
                      <div className="space-y-1 text-xs">
                        {isUser ? (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        ) : (
                          parseFormattedText(msg.content)
                        )}
                      </div>

                      {/* Utility bar for AI responses */}
                      {!isUser && !msg.isError && (
                        <div className="mt-3 pt-2.5 border-t border-[rgba(30,38,64,0.4)] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-neon-green" />
                            <span>DECODED SUCCESSFUL</span>
                          </div>
                          
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-cyber-neon-blue px-1.5 py-0.5 rounded hover:bg-[rgba(0,240,255,0.05)] transition-all"
                            title="Copy reply to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-cyber-neon-green" />
                                <span className="text-cyber-neon-green">COPIED</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>COPY</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Typing/Analysis Processing State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start gap-3 items-start"
            >
              <div className="flex flex-col gap-2 max-w-[85%]">
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <span>DEPLOYED_MODEL_ANALYSIS</span>
                  <span>•</span>
                  <span>COMPUTING_REPLY</span>
                </div>
                
                <div className="cyber-glass rounded-lg p-4 border border-cyber-border flex flex-col gap-2 bg-[rgba(13,15,26,0.9)] max-w-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1.5 relative items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyber-neon-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-cyber-neon-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-cyber-neon-pink animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-slate-300 font-mono tracking-widest uppercase flex items-center gap-1">
                      GPU WORKSTATION BUSY <span className="cursor-blink">|</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono leading-relaxed mt-1">
                    Querying local API server at localhost:1234... converting frame metrics... running vision embedding weights...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input panel prompt executor */}
      <div className="p-4 bg-[rgba(13,15,26,0.95)] border-t border-cyber-border">
        {/* Dynamic Warning if not connected to server */}
        {serverStatus === 'disconnected' && (
          <div className="mb-3 flex items-center gap-2 p-2 rounded bg-[rgba(255,0,127,0.06)] border border-[rgba(255,0,127,0.2)] text-[11px] text-slate-300">
            <AlertCircle className="w-4 h-4 text-cyber-neon-pink shrink-0" />
            <div className="leading-relaxed">
              <span className="text-cyber-neon-pink font-semibold">LM Studio Offline.</span> Please launch LM Studio on port <code className="bg-black/55 px-1 py-0.5 rounded font-mono">1234</code> with a vision-equipped core loaded (e.g. Moondream2 or LLaVA).
            </div>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              !activeImage 
                ? 'WARNING: Please upload an image frame first to perform vision analysis...' 
                : 'Enter query about this image frame (e.g., "Extract text", "Show mood")...'
            }
            disabled={isLoading || !activeImage}
            className={`flex-1 bg-cyber-dark border rounded px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 transition-all ${
              !activeImage 
                ? 'border-cyber-border opacity-50 cursor-not-allowed placeholder:text-slate-600' 
                : 'border-cyber-border focus:border-cyber-neon-blue focus:ring-cyber-neon-blue/45 placeholder:text-slate-500 focus:neon-glow-blue'
            }`}
          />
          
          <button
            type="submit"
            disabled={isLoading || !inputText.trim() || !activeImage}
            className={`flex items-center justify-center rounded px-4 border transition-all ${
              isLoading || !inputText.trim() || !activeImage
                ? 'bg-cyber-border text-slate-600 border-cyber-border cursor-not-allowed'
                : 'bg-[rgba(0,240,255,0.08)] text-cyber-neon-blue border-cyber-neon-blue hover:text-white hover:bg-cyber-neon-blue hover:neon-border-blue font-display font-medium text-xs cursor-pointer'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
