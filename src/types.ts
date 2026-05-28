/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  imageUrl?: string;
  isError?: boolean;
}

export interface LMStudioConfig {
  endpoint: string; // e.g. "http://localhost:1234"
  model: string;    // e.g. "moondream2" or "llava"
  availableModels: string[];
}

export interface MoondreamConfig {
  endpoint: string; // e.g. "http://localhost:8000"
  model: string;    // "moondream2"
}

export type BackendType = 'lm-studio' | 'moondream';

export interface AppConfig {
  backend: BackendType;
  lmStudio: LMStudioConfig;
  moondream: MoondreamConfig;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

export interface ServerStatus {
  status: ConnectionStatus;
  model: string;
  error?: string;
}

export type AnalysisType = 'general' | 'ocr' | 'object' | 'document' | 'scene' | 'mood' | 'resume';
