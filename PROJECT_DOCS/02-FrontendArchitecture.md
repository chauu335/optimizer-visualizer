# Frontend Architecture

## Overview

The frontend is a React 19 + TypeScript single-page application (SPA) that loads pre-computed results as JSON and provides an interactive UI for exploring them.

## Component Hierarchy

```
App.tsx
└── Dashboard.tsx (Main Orchestrator)
    ├── DatasetInfo (Static info about the dataset)
    ├── resultsRanking.tsx (Table: ranking by best accuracy)
    ├── FilterControls.tsx (Dropdown filters for optimizer/kernel)
    ├── PlaybackControls.tsx (Play/Pause/Reset/Speed buttons)
    └── Results Grid (6 LearningCurveChart instances side-by-side)
        └── LearningCurveChart.tsx × 6 (Animated Recharts line charts)
```

## Key Components Explained

### 1. Dashboard.tsx

**Purpose:** Central state management and layout orchestration

**Key State:**

- `currentEpoch` (1-100): Controls which epoch data is visible
- `isPlaying` (boolean): Animation active?
- `speed` (0.5, 1, 2): How fast epochs increment
- `selectedOptimizers` & `selectedKernels`: Filter state

**Key Logic:**

```typescript
// Animation loop: increments epoch every 50ms
useEffect(() => {
  if (!isPlaying) return;
  const interval = setInterval(() => {
    setCurrentEpoch((prev) => (prev < maxEpochs ? prev + 1 : maxEpochs));
  }, 50 / speed);
  return () => clearInterval(interval);
}, [isPlaying, speed, maxEpochs]); // NOT currentEpoch (prevents reset)
```

**Layout Order:**

1. Dataset Info
2. Results Rankings Table
3. Filter Controls
4. **Playback Controls** (moved here for UX)
5. Learning Curve Charts Grid

### 2. LearningCurveChart.tsx

**Purpose:** Draw a single optimizer+kernel combination as an animated line chart

**How Animation Works:**

```typescript
// Data slicing: only show epochs up to current
const data = currentEpoch
  ? allData.slice(0, currentEpoch)
  : allData;

// Line animation OFF (visual growth comes from data slicing)
<Line
  isAnimationActive={false}  // <-- Key: let data growth drive animation
  dataKey="val_accuracy"
/>
```

**Metrics Displayed:**

- Validation Accuracy per epoch (main line)
- Best Val Accuracy (max across all epochs, shown as text)
- Training Time (total time to train all 100 epochs)
- Convergence (when accuracy plateaus, estimated)

### 3. FilterControls.tsx

**Purpose:** Multi-select dropdowns for optimizer and kernel type

**Filters:**

- **Optimizer:** SGD, Adam, RMSprop, Adagrad (checkboxes)
- **Kernel:** Linear, RBF, Polynomial (checkboxes)

**Effect:** Re-renders the 6-chart grid to show only selected combinations

### 4. PlaybackControls.tsx

**Purpose:** Animation playback UI

**Controls:**

- **Play / Pause:** Start/stop epoch increment loop
- **Reset:** Set `currentEpoch` back to 1
- **Speed:** 0.5x, 1x, 2x dropdown

**Current Epoch Display:** Shows "Epoch: 45 / 100" in real-time

## Data Flow

```
results.json (static file)
    ↓
 Dashboard loads JSON
    ↓
 State: selectedOptimizers, selectedKernels, currentEpoch, isPlaying
    ↓
 Filtered data → results grid → LearningCurveChart instances
    ↓
 PlaybackControls adjusts currentEpoch every 50ms/speed
    ↓
 Each chart slices data: allData.slice(0, currentEpoch)
    ↓
 Recharts re-renders with new data (visual growth effect)
```

## Why This Architecture?

1. **Separation of Concerns:** Dashboard manages state, components handle rendering
2. **Animation Model:** Data-driven (slicing) instead of Recharts-driven animation
   - Prevents animation conflicts
   - Makes curve "grow" visually at desired speed
3. **Stateless Charts:** LearningCurveChart is purely a function of props
   - Easy to reuse
   - Easy to test
4. **Real-time Responsiveness:** React hooks keep playback smooth

## Styling & Responsiveness

- **Tailwind CSS:** Utility classes for layout and spacing
- **Grid Layout:** 6 charts in 2 rows of 3 on desktop
- **Responsive Fallback:** Stacks vertically on small screens (if implemented)

## Performance Considerations

- **No Pre-rendering:** Charts render on-client, not server-side
- **Memoization:** Could add React.memo() to LearningCurveChart to prevent unnecessary re-renders
- **JSON Size:** ~200KB results.json (manageable for a web request)

---

**Next:** Open `03-AnimationMechanism.md` to understand the animation technique in detail.
