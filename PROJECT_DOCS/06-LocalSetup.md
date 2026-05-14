# Local Setup & Development Guide

## Prerequisites

- **Node.js 18+** (for React frontend)
- **Python 3.8+** (for data generation)
- **npm** (comes with Node.js)

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/chauu335/optimizer-visualizer.git
cd optimizer-visualizer
```

### Step 2: Frontend Setup

```bash
# Install npm dependencies
npm install

# Verify installation
npm list react recharts typescript
```

**What this installs:**

- React 19, React DOM
- Recharts (charting library)
- TypeScript (type checking)
- Tailwind CSS (styling)
- D3.js (advanced graphics)

### Step 3: Backend Setup (Optional, if regenerating data)

```bash
# Create a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep -E "numpy|scikit-learn"
```

**What this installs:**

- NumPy (numerics)
- scikit-learn (ML utilities)
- Flask (for API endpoints, if needed)
- Gunicorn (production server)

### Step 4: Run the Frontend (Development)

```bash
# Terminal 1: Start React dev server
PORT=3003 npm start

# Opens: http://localhost:3003
```

**What this does:**

- Starts a development server with hot reload
- Watches `src/` for file changes
- Serves pre-computed `public/data/results.json`

### Step 5: Generate New Data (Optional)

If you want to regenerate the `results.json` file:

```bash
# Terminal 2: Run Python data generation
python3 python/main.py

# Output: public/data/results.json (regenerated)
```

**What this does:**

- Generates 12 experiments (4 optimizers × 3 kernels)
- Trains for 100 epochs each
- Exports results to `public/data/results.json`

**Expected Time:** ~2-5 minutes (depends on machine)

---

## Project Structure for Development

```
optimizer-visualizer/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          ← Main logic
│   │   ├── LearningCurveChart.tsx ← Animation
│   │   ├── FilterControls.tsx     ← Filters
│   │   └── PlaybackControls.tsx   ← Playback
│   ├── App.tsx                    ← Root
│   └── index.css                  ← Global styles
├── public/
│   ├── data/
│   │   └── results.json           ← Load this
│   └── index.html
├── python/
│   ├── main.py                    ← Run this to regenerate
│   ├── models/
│   ├── utils/
│   └── data/
├── package.json                   ← Frontend deps
├── tsconfig.json                  ← TypeScript config
├── requirements.txt               ← Python deps
└── .nvmrc                         ← Node.js version

```

---

## Common Development Tasks

### Task 1: Modify a Chart Component

**File:** `src/components/LearningCurveChart.tsx`

**Example:** Change the line color from blue to red:

```typescript
// Find this:
<Line
  dataKey="val_accuracy"
  stroke="#3b82f6"  // ← Blue
/>

// Change to:
<Line
  dataKey="val_accuracy"
  stroke="#ef4444"  // ← Red
/>

// Hit save → hot reload → changes appear instantly
```

### Task 2: Adjust Animation Speed

**File:** `src/components/Dashboard.tsx`

**Example:** Change interval from 50ms to 100ms:

```typescript
// Find this:
const interval = setInterval(() => {
  // ...
}, 50 / speed); // ← Change 50 to 100

// Now animation plays at half speed by default
```

### Task 3: Regenerate Data

**File:** `python/main.py`

**Example:** Change from 100 epochs to 200 epochs:

```python
# Find this:
MAX_EPOCHS = 100  # ← Change to 200

# Run:
python3 python/main.py

# Frontend will load new results.json automatically
```

### Task 4: Add a New Optimizer

1. Create `Optimizer2XYZ` class in `python/optimizers.py`
2. Instantiate it in `python/main.py`'s optimizer loop
3. Re-run `python3 python/main.py`
4. Frontend automatically includes new results

### Task 5: Rebuild for Production

```bash
npm run build

# Creates: build/ folder (optimized React bundle)
# Size: ~170KB gzipped
```

---

## Debugging Tips

### Issue: Changes not appearing?

**Solution:**

- Check console for errors: `npm start` output
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (Ctrl+C, then `npm start`)

### Issue: Charts showing no data?

**Solution:**

- Verify `public/data/results.json` exists
- Check browser's Network tab (is it loading the JSON?)
- Check browser console for errors

### Issue: Animation stuttering?

**Solution:**

- Check if multiple intervals are running (browser dev tools → Performance)
- Verify `currentEpoch` is not in the useEffect dependency array

### Issue: Python errors when regenerating?

**Solution:**

- Verify all Python packages installed: `pip list`
- Check Python version: `python3 --version` (need 3.8+)
- Read the error message carefully (usually clear about what's missing)

---

## Environment Variables & Configuration

### Frontend (.env, optional)

```bash
# In root directory, create .env file:
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SPEED_OPTIONS=0.5,1,2
```

### Backend (python/config.py, optional)

```python
MAX_EPOCHS = 100
BATCH_SIZE = 32
LEARNING_RATE = 0.01
KERNEL_TYPES = ['linear', 'rbf', 'polynomial']
OPTIMIZERS = ['sgd', 'adam', 'rmsprop', 'adagrad']
```

---

## Building for Production

### Option 1: Local Build + Server

```bash
# Build React
npm run build

# Serve locally (test before deployment)
npm run serve

# Opens on http://localhost:5000
```

### Option 2: Docker Build (for Railway)

```bash
# Build image
docker build -t optimizer-viz .

# Run container
docker run -p 3000:3000 optimizer-viz

# Opens on http://localhost:3000
```

### Option 3: Deploy to Railway

```bash
# Push to GitHub
git push origin main

# Railway auto-detects and deploys
# (see 07-DeploymentGuide.md for details)
```

---

## Performance Tips

1. **Reduce animation lag:** Decrease interval check frequency (make `50 / speed` smaller)
2. **Faster builds:** Use `npm ci` instead of `npm install` (cleaner installs)
3. **Smaller bundle:** Remove unused dependencies (audit with `npm ls`)
4. **Caching:** Serve results.json with aggressive cache headers

---

## Testing (Optional)

### Unit Tests (with Jest)

```bash
npm test
```

### E2E Tests (with Cypress, if installed)

```bash
npm run cypress
```

These are not currently set up, but the framework is there.

---

## Troubleshooting Checklist

- [ ] Node.js installed? (`node --version` → v18+)
- [ ] Python installed? (`python3 --version` → 3.8+)
- [ ] Dependencies installed? (`npm list react`, `pip list numpy`)
- [ ] Dev server running? (`npm start` on port 3003)
- [ ] JSON file present? (`ls public/data/results.json`)
- [ ] Console errors? (Check browser F12 → Console tab)
- [ ] Data loaded? (Network tab → results.json size > 0)

---

**Next:** Open `07-DeploymentGuide.md` to learn about production deployment.
