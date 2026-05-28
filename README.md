<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Local AI Image Analyzer with Moondream Integration

This is a full-stack, completely **local** AI image analysis application built with **Moondream2** vision model and LM Studio support.

View your app in AI Studio: https://ai.studio/apps/b4292a0b-06de-41b7-b25c-d0dbc162b1b7

## Features

✨ **Fully Local & Offline** - All AI inference runs locally on your hardware  
🎯 **Moondream2 Support** - Fast, efficient vision model built on transformers  
🔄 **Dual Backend Support** - Switch between Moondream backend and LM Studio  
💬 **Multi-turn Conversations** - Maintain context across multiple image analyses  
⚡ **GPU Accelerated** - Supports CUDA for faster inference  
🛡️ **Privacy First** - Zero data leaves your machine  

## Run Locally

### Prerequisites
- Node.js (v18+)
- Python 3.8+ (for Moondream backend)
- 4GB+ VRAM (for GPU acceleration)
- 8GB+ RAM (minimum)

### Option 1: Using Moondream Backend (Recommended)

**1. Install Node dependencies:**
```bash
npm install
```

**2. Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**3. Start the Moondream backend (in a separate terminal):**
```bash
npm run backend:dev
```
The backend will start at `http://localhost:8000` and download the Moondream2 model on first run (~1.5GB).

**4. Run the frontend (in another terminal):**
```bash
npm run dev
```
Access the app at `http://localhost:3000`

**5. Select "Moondream" backend in the app header and start analyzing images!**

### Option 2: Using LM Studio

**1. Download and install LM Studio** from https://lmstudio.ai

**2. In LM Studio:**
   - Navigate to the Models tab
   - Search for and download `moondream2` or `llava` model
   - Go to the Local Server tab
   - Click "Start Server" (port 1234)

**3. Install dependencies and run frontend:**
```bash
npm install
npm run dev
```

**4. Select "LM Studio" backend in the app header**

## Project Structure

```
├── src/
│   ├── App.tsx              # Main React app with backend switching
│   ├── types.ts             # TypeScript interfaces for both backends
│   ├── components/
│   │   ├── ChatWindow.tsx    # Chat interface
│   │   ├── UploadZone.tsx    # Image upload component
│   │   ├── Sidebar.tsx       # Configuration panel
│   │   └── PromptChips.tsx   # Quick prompt suggestions
│   ├── index.css            # Styling
│   └── main.tsx             # Entry point
├── backend.py               # Moondream FastAPI server
├── package.json             # Frontend dependencies
├── requirements.txt         # Python dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite bundler config
└── README.md                # This file
```

## Backend Comparison

| Feature | Moondream | LM Studio |
|---------|-----------|-----------|
| Setup Complexity | Medium | Easy |
| Model Size | ~1.5GB | Varies |
| Speed | Very Fast | Fast |
| GPU Support | Yes (CUDA) | Yes |
| Configuration | Auto-managed | Manual |
| Additional Software | Python | Separate app |

## API Endpoints

Both backends expose OpenAI-compatible endpoints:

### Chat Completions
```bash
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "moondream2",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "What's in this image?" },
        { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
      ]
    }
  ],
  "max_tokens": 512,
  "temperature": 0.2
}
```

### List Models
```bash
GET /v1/models
```

### Health Check (Moondream only)
```bash
GET /health
```

## Configuration

### Frontend Settings
- **Backend**: Switch between Moondream and LM Studio in the header dropdown
- **Endpoint**: Customize the API endpoint in the sidebar (default: `http://localhost:8000` or `http://localhost:1234`)
- **Model**: Select different vision models if available

### Environment Variables
Create a `.env.local` file:
```env
# Moondream Backend Configuration
BACKEND_PORT=8000
USE_GPU=true
```

## Quick Start Examples

### Image Description
1. Upload an image using the upload zone
2. Type: "Describe what you see in this image"
3. Get detailed analysis from Moondream2

### OCR (Text Recognition)
1. Upload a document/image with text
2. Type: "Read all the text in this image"
3. Get extracted text

### Object Detection
1. Upload an image
2. Type: "What objects can you identify?"
3. Get object listing and locations

### Scene Analysis
1. Upload a photo
2. Type: "Analyze the scene, including colors, lighting, and composition"
3. Get detailed scene breakdown

## Troubleshooting

### Backend not connecting
**Moondream:** Ensure backend is running with `npm run backend:dev` and Python dependencies are installed  
**LM Studio:** Verify LM Studio is open and Local Server is started

### Model too slow
- Ensure GPU is enabled (check Moondream backend logs for "Using device: cuda")
- Close other applications to free up VRAM
- Use LM Studio with a quantized model version

### "Out of Memory" error
- Reduce `max_tokens` in chat settings
- Close other applications
- If on CPU, consider using LM Studio with a smaller quantized model

### Image upload fails
- Ensure image format is JPEG, PNG, or WEBP
- Keep file size under 10MB
- Try a different image format

## Development

### Build frontend for production
```bash
npm run build
```

### Run backend in production mode
```bash
npm run backend:prod
```

### Lint TypeScript
```bash
npm run lint
```

## Performance Tips

1. **GPU Acceleration**: If you have an NVIDIA GPU, ensure CUDA is installed for 3-5x speedup
2. **Model Quantization**: Use quantized versions of models for faster inference with LM Studio
3. **Batch Processing**: Process multiple images in sequence for better GPU utilization
4. **Memory Management**: Restart backend if experiencing memory leaks during long sessions

## License

Apache 2.0

## Credits

- **Moondream2**: https://github.com/vikhyatk/moondream
- **LM Studio**: https://lmstudio.ai
- **Vite**: https://vitejs.dev
- **React**: https://react.dev

## Support & Contributing

For issues, questions, or suggestions:
1. Check the troubleshooting section above
2. Ensure Python/Node dependencies are up to date
3. Review backend logs for detailed error information

---

**Privacy First**: This application performs all AI inference locally. No images, prompts, or analysis results ever leave your device.

