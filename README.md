# Optimizer Visualization Dashboard

An interactive **full-stack web application** for comparing machine learning optimizers (SGD, Adam, RMSprop, Adagrad) across different kernel types with real-time animated learning curves and detailed performance metrics.

## Features

- 🎬 **Real-time Animation**: Watch learning curves grow epoch-by-epoch during playback with adjustable speed controls
- 📊 **Multi-Optimizer Comparison**: Visualize 12 optimizer-kernel combinations side-by-side
- 📈 **Comprehensive Metrics**: Track validation accuracy, training time, and convergence behavior
- 🔍 **Interactive Filtering**: Filter results by optimizer and kernel type
- ⚡ **Full-Stack Architecture**: React frontend with Python numerical backend
- 🎨 **Responsive Design**: Clean, modern UI built with Tailwind CSS and Recharts

## Tech Stack

**Frontend**
- React 19 with TypeScript
- Recharts for interactive data visualization
- Tailwind CSS for styling
- D3.js for advanced graphics

**Backend**
- Python with NumPy and scikit-learn
- Flask for API endpoints
- Gunicorn for production serving

**Deployment**
- Node.js / npm for build system
- Railway for full-stack hosting

## Installation

### Prerequisites
- Node.js 16+
- Python 3.8+

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/optimizer-visualizer.git
   cd optimizer-visualizer
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Running Locally

### Development Mode

**Terminal 1 - React frontend**
```bash
cd optimizer-visualizer
PORT=3003 npm start
```
Opens at http://localhost:3003

**Terminal 2 - Python backend (optional for local testing)**
```bash
cd optimizer-visualizer
python3 python/main.py
```

## Building for Production

```bash
npm run build
npm run serve
```

Production build serves on http://localhost:5000

## Deployment to Railway

1. Push code to GitHub (private or public)
2. Go to [railway.app](https://railway.app)
3. Create new project → Deploy from GitHub repo
4. Select this repository
5. Railway auto-detects Node.js + Python and deploys both

The Procfile and updated package.json handle the rest.

## Project Structure

```
optimizer-visualizer/
├── public/
│   └── data/
│       └── results.json          # Pre-generated optimization results
├── python/
│   ├── main.py                   # Generate results (NumPy, scikit-learn)
│   ├── models/
│   └── utils/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx         # Main app orchestration
│   │   ├── LearningCurveChart.tsx # Animated visualization
│   │   └── ...
│   └── App.tsx
├── Procfile                       # Railway deployment config
├── requirements.txt               # Python dependencies
└── package.json                   # Node.js dependencies
```

## How It Works

1. **Data Generation** (`python/main.py`): Runs optimization experiments on synthetic SVM dataset
2. **Results Storage** (`public/data/results.json`): Exports training metrics for all 12 optimizer-kernel combinations
3. **Frontend Visualization** (`React`): Loads JSON, animates curves based on epoch counter
4. **Interactive Playback**: Users control animation speed and reset state

## License

MIT - See [LICENSE](LICENSE) for details

## Author

Duc Hoang Chau Ngo
