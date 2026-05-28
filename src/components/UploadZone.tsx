/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadZoneProps {
  onImageSelected: (base64Data: string, fileName: string) => void;
  selectedImage: string | null;
  onClearImage: () => void;
}

export default function UploadZone({ 
  onImageSelected, 
  selectedImage, 
  onClearImage 
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    // Limit to 10MB to avoid oversized base64 payloads to local server
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size is too large. Max 10MB allowed.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`cursor-pointer group flex flex-col items-center justify-center border border-dashed rounded-lg p-6 py-8 text-center transition-all ${
              isDragging
                ? 'border-cyber-neon-blue bg-[rgba(0,240,255,0.05)] neon-glow-blue'
                : 'border-cyber-border hover:border-cyber-neon-blue bg-[rgba(13,15,26,0.3)] hover:bg-[rgba(30,38,64,0.2)]'
            }`}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[rgba(30,38,64,0.5)] group-hover:bg-[rgba(0,240,255,0.1)] transition-colors border border-cyber-border group-hover:border-cyber-neon-blue text-slate-400 group-hover:text-cyber-neon-blue mb-4">
              <Upload className="w-6 h-6" />
            </div>
            
            <h3 className="font-display font-medium text-slate-200 mb-1 group-hover:text-cyber-neon-blue transition-colors">
              Drag & Drop Image
            </h3>
            <p className="text-xs text-slate-400 max-w-sm px-4">
              Supports <span className="text-slate-300 font-semibold">JPG, PNG, WEBP</span> format images up to 10MB. Or, click to browse your workstation.
            </p>

            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 text-xs text-cyber-neon-pink bg-[rgba(255,0,127,0.1)] border border-[rgba(255,0,127,0.2)] px-3 py-1.5 rounded">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-lg overflow-hidden border border-cyber-border bg-cyber-dark p-2"
          >
            <div className="aspect-video w-full flex items-center justify-center bg-cyber-black rounded overflow-hidden relative group">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-[10px] font-mono text-cyber-neon-blue">IMAGE LOADED // BASE64 READY</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 truncate">
                <ImageIcon className="w-3.5 h-3.5 text-cyber-neon-blue" />
                <span className="font-mono text-[10px] truncate max-w-[200px]">Active Frame Selected</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearImage();
                }}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-[rgba(255,0,127,0.1)] hover:bg-[rgba(255,0,127,0.2)] text-cyber-neon-pink border border-[rgba(255,0,127,0.2)] hover:border-cyber-neon-pink transition-all font-display font-medium"
              >
                <X className="w-3 h-3" />
                Unload
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
