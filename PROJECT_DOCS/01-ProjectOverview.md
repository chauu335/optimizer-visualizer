# Optimizer Visualization Dashboard - Project Documentation

## Project Overview

**What:** An interactive full-stack web application that compares machine learning optimizers (SGD, Adam, RMSprop, Adagrad) across different kernel types with real-time animated learning curves.

**Why:** To visualize how different optimization algorithms and kernels affect model training performance, convergence behavior, and computational efficiency.

**Who:** Built for STAT 413 Final Project as a course requirement, but also serves as a portfolio piece demonstrating full-stack development.

**Where:**

- Local: http://localhost:3003
- Deployed: Railway (pending successful deployment)
- Repo: https://github.com/chauu335/optimizer-visualizer

## Key Statistics

- **12 Combinations Tested:** 4 optimizers × 3 kernels
- **100 Epochs of Training:** Per combination
- **5 Key Metrics Tracked:** Validation accuracy, training time, convergence, final metrics, epoch-by-epoch progression
- **Interactive Playback:** Real-time animation at adjustable speeds (0.5x, 1x, 2x)
- **5000+ Lines of Code:** Frontend + Backend combined

## Tech Stack at a Glance

| Layer                | Technology           | Purpose                                |
| -------------------- | -------------------- | -------------------------------------- |
| **Frontend**         | React 19, TypeScript | UI and interactivity                   |
| **Charting**         | Recharts             | Real-time learning curve visualization |
| **Styling**          | Tailwind CSS         | Responsive design                      |
| **State Management** | React hooks          | Animation timing, filters              |
| **Backend**          | Python 3, NumPy      | Optimization experiments               |
| **Data Format**      | JSON                 | Results storage and transfer           |
| **Hosting**          | Railway              | Full-stack deployment                  |

## File Structure

```
optimizer-visualizer/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main app orchestration
│   │   ├── LearningCurveChart.tsx # Animated curve visualization
│   │   ├── FilterControls.tsx     # Optimizer/kernel filters
│   │   ├── PlaybackControls.tsx   # Animation controls
│   │   └── resultsRanking.tsx     # Performance rankings table
│   ├── App.tsx                    # Root component
│   └── index.css                  # Global styles
├── python/
│   ├── main.py                    # Data generation orchestrator
│   ├── models/
│   │   ├── base.py                # Model interface
│   │   ├── svm.py                 # SVM implementation
│   │   └── optimizers.py          # Optimizer implementations
│   ├── utils/
│   │   ├── trainer.py             # Training loop
│   │   ├── transforms.py          # Kernel transformations
│   │   └── generate_data.py       # Synthetic dataset creation
│   └── data/
├── public/
│   ├── data/
│   │   └── results.json           # Pre-computed results
├── scripts/
│   └── start.js                   # Production server
├── Dockerfile                      # Container definition
├── railway.toml                    # Deployment config
├── package.json                    # Node dependencies
└── requirements.txt                # Python dependencies
```

## How to Use This Documentation

1. **Start here:** Read **01-ProjectOverview.md** (this file) for context
2. **Understand the UI:** Read **02-FrontendArchitecture.md** to know what users see
3. **The magic:** Read **03-AnimationMechanism.md** to understand how curves animate
4. **The data:** Read **04-BackendArchitecture.md** to understand how results are generated
5. **Key features:** Read **05-KeyFeatures.md** for feature descriptions
6. **Getting it running:** Read **06-LocalSetup.md** for hands-on steps
7. **Deployment:** Read **07-DeploymentGuide.md** for production insights
8. **Interview prep:** Read **08-InterviewPrep.md** for common questions

---

**Next:** Open `02-FrontendArchitecture.md` to understand the UI layer.
