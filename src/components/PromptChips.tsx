/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, Type, FileSearch, Sparkles, Smile, Layers, HelpCircle } from 'lucide-react';

interface PromptPreset {
  label: string;
  prompt: string;
  icon: React.ReactNode;
  category: string;
}

interface PromptChipsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled: boolean;
}

export default function PromptChips({ onSelectPrompt, disabled }: PromptChipsProps) {
  const presets: PromptPreset[] = [
    {
      label: "General ID",
      prompt: "What is in this image? Provide a brief clear summary of the main subject.",
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      category: "identity"
    },
    {
      label: "Detailed Scene Description",
      prompt: "Describe this image in comprehensive detail, including the setting, objects, composition, colors, and lighting.",
      icon: <Eye className="w-3.5 h-3.5" />,
      category: "describe"
    },
    {
      label: "OCR Text Extraction",
      prompt: "Read all readable text from this image and output it as clean text. Maintain layout structure if possible.",
      icon: <Type className="w-3.5 h-3.5" />,
      category: "ocr"
    },
    {
      label: "Analyze Document/Report",
      prompt: "Analyze this document or report. Identify the core headers, table data, key takeaway numbers, and summarize its primary contents.",
      icon: <FileSearch className="w-3.5 h-3.5" />,
      category: "document"
    },
    {
      label: "Mood & Style Analysis",
      prompt: "Analyze the color palette, artistic style (if applicable), lighting contrast, and overall emotional mood of this image.",
      icon: <Smile className="w-3.5 h-3.5" />,
      category: "mood"
    },
    {
      label: "Object & Elements Audit",
      prompt: "Detect and catalog all key objects, subjects, or entities visible in this picture. List them clearly with approximate layout positions.",
      icon: <Layers className="w-3.5 h-3.5 text-cyber-neon-green" />,
      category: "objects"
    },
    {
      label: "Resume / CV Insight",
      prompt: "Review this resume or work profile. Highlight the candidate name, professional summary, primary tech stacks, and career duration.",
      icon: <Sparkles className="w-3.5 h-3.5 text-cyber-neon-purple" />,
      category: "resume"
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
          Quick Analysis Presets
        </h4>
        <span className="text-[9px] font-mono text-slate-500">CLICK CHIP TO INITIATE</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((p, index) => (
          <button
            key={index}
            onClick={() => !disabled && onSelectPrompt(p.prompt)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all pointer-events-auto ${
              disabled
                ? 'opacity-40 cursor-not-allowed border-cyber-border text-slate-500'
                : 'border-cyber-border bg-[rgba(22,26,48,0.4)] text-slate-300 hover:text-cyber-neon-blue hover:border-cyber-neon-blue hover:bg-[rgba(0,240,255,0.04)] hover:neon-glow-blue cursor-pointer font-medium'
            }`}
          >
            <span className="text-slate-400 group-hover:text-cyber-neon-blue">{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
