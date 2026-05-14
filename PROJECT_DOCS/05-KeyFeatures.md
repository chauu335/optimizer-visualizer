# Key Features & User Interactions

## Feature 1: Dataset Visualization (2D Scatter Plot)

**What:** Explore the raw training data interactively.

**How It Works:**
- Displays the first 2 features of all 500 samples
- Slider lets you show/hide points (50-500 range)
- **Resample button** generates a new random sample without reloading
- Color-coded by class: red (Class -1) vs. blue (Class +1)

**User Interaction:**
```
[Show: ___slider___ 250]  [↻ Resample]
        ↓
Scatter Plot: 250 random points visible
Click Resample → new 250 random points (instant)
Drag slider → update count, generate new sample
```

**Why Useful:**
- **Context:** Understand what data the optimizers were trained on
- **Intuition:** See why nonlinear kernels (RBF, Poly) matter—data isn't linearly separable
- **Exploration:** Sample different subsets without page reload
- **Interview value:** "I didn't just train a model—I visualized the data to understand it"

---

## Feature 2: Animated Learning Curves

**What:** Watch validation accuracy grow in real-time as epochs play.

**How It Works:**

- Click **Play** button
- `currentEpoch` increments every 50ms
- Charts display only data up to `currentEpoch`
- Visual effect: curve grows left to right

**User Interaction:**

```
[Play] [Pause] [Reset]  [Speed: 1x ▼]
      ↓
Epoch: 45 / 100
      ↓
Charts update with 45 data points visible
```

**Why Useful:**

- See the "trajectory" of learning, not just final accuracy
- Pause to inspect intermediate results
- Adjust speed to see fast vs. slow convergers

---

## Feature 3: Optimizer & Kernel Filtering

**What:** Show only the combinations you want to compare.

**How It Works:**

```
Optimizers: ☑ SGD   ☑ Adam   ☐ RMSprop   ☑ Adagrad
Kernels:    ☑ Linear ☑ RBF   ☐ Polynomial
             ↓
Grid shows only:
SGD+Linear, SGD+RBF, Adam+Linear, Adam+RBF, Adagrad+Linear, Adagrad+RBF
```

**Effect:** Re-renders the chart grid immediately (6 charts max per filter combo).

**Why Useful:**

- Compare similar optimizers (e.g., Adam vs. RMSprop)
- Isolate kernel effects (e.g., LinearSame optimizer)
- Reduce visual clutter

---

## Feature 4: Results Ranking Table

**What:** Sorted table of all 12 results by best validation accuracy.

**Displays:**

```
| Rank | Optimizer | Kernel | Best Val Acc | Total Time |
|------|-----------|--------|--------------|-----------|
| 1    | Adam      | RBF    | 0.89         | 2.34s     |
| 2    | Adam      | Lin    | 0.87         | 2.12s     |
| 3    | RMSprop   | RBF    | 0.86         | 2.28s     |
| ...  | ...       | ...    | ...          | ...       |
```

**Interactivity:**

- Click a row to **select** that optimizer+kernel in the chart grid
- Helps identify top performers at a glance

**Why Useful:**

- Quick answer: "Which combo is best?"
- Drive exploration: "Is #2 worth investigating?"

---

## Feature 5: Real-Time Metrics Display

**On Each Chart:**

```
┌─────────────────────────────────┐
│  Adam + RBF Kernel              │
├─────────────────────────────────┤
│     [Learning Curve]            │
│                                 │
│ Best Val Acc:     0.89          │ ← Max accuracy across all epochs
│ Convergence:      Epoch 45      │ ← When accuracy plateaued
│ Training Time:    2.34s         │ ← Total wall-clock time
└─────────────────────────────────┘
```

**Why Useful:**

- See the "story" of each combo at a glance
- Compare efficiency: fast convergence + high accuracy = winner
- Identify overfitting: if convergence is early but final accuracy low

---

## Feature 6: Playback Controls

**Buttons & Controls:**

| Control   | Function                 | Implementation        |
| --------- | ------------------------ | --------------------- |
| **Play**  | Start epoch increment    | `setIsPlaying(true)`  |
| **Pause** | Stop epoch increment     | `setIsPlaying(false)` |
| **Reset** | Jump to epoch 1          | `setCurrentEpoch(1)`  |
| **Speed** | Adjust interval duration | `50ms / speed`        |

**Speed Options:**

- **0.5x:** Slow motion (100ms per epoch)
- **1x:** Normal speed (50ms per epoch)
- **2x:** Fast forward (25ms per epoch)

**Display:**

```
Epoch: 45 / 100
```

Updates in real-time during playback.

**Why Useful:**

- Pause to analyze intermediate states
- Slow down fast convergers to see details
- Speed up slow convergers to not waste time

---

## Feature 7: Dataset Information Panel

**Displays:**

```
Dataset: Synthetic 2D Classification
- Samples: 1000
- Features: 2
- Classes: 2
- Train/Val Split: 80/20
```

**Why Useful:**

- Understand experimental context
- Know the problem size (1000 samples is small)
- Reproducibility: same dataset for all optimizers

---

## Feature 8: Responsive Layout

**Desktop (1920x1080):**

```
┌─────────────────────────────────────┐
│  Filter Controls (2 rows)           │
├─────────────────────────────────────┤
│  Playback Controls                  │
├─────────────────────────────────────┤
│  Chart 1    Chart 2    Chart 3      │
│  Chart 4    Chart 5    Chart 6      │
└─────────────────────────────────────┘
```

**Mobile (375x667):**

```
┌──────────────────┐
│ Filters (narrow) │
├──────────────────┤
│ Playback         │
├──────────────────┤
│ Chart 1 (stack)  │
│ Chart 2 (stack)  │
│ ...              │
└──────────────────┘
```

(Note: Vertical stacking could be added but not yet implemented)

---

## Feature 9: No Real-Time Computation

**Design Choice:** All results pre-computed in Python.

**Advantages:**

- Zero latency: instant chart rendering
- No server required for playback
- Static JSON file = can be cached/CDN-delivered
- Users never wait for computation

**Constraints:**

- Can't change hyperparameters at runtime
- Can't add new optimizers without re-running Python
- Fixed dataset (can't upload custom data)

---

## Interview Talking Points by Feature

### Animation

"The challenge was making the curve appear to 'grow' during playback. We solved it by slicing the data progressively (data.slice(0, currentEpoch)) rather than using Recharts' built-in animation. This gave us full control over speed and pause behavior."

### Dataset Visualization

"Before visualizing the optimizer results, I added a scatter plot to help users understand the training data. The 2D projection shows that the data isn't linearly separable, which immediately explains why RBF and polynomial kernels should outperform linear—it's a nice intuitive hook when explaining the project."

### Filtering

"Multi-select filters let users compare subsets of optimizers and kernels. This reduces visual clutter and lets users focus on relevant comparisons, like 'which adaptive optimizer is best?'"

### Metrics

"Each chart displays three key metrics: best accuracy (what's the ceiling?), convergence epoch (how fast?), and total time (computational cost?). This gives a complete picture."

### Playback

"The Play/Pause/Reset/Speed controls give users fine-grained control. They can slow down to inspect details, pause to read metrics, or speed up to see the overall trend."

### Data Pre-computation

"By pre-computing results, we avoid the need for a backend API during gameplay. The frontend is now a pure static SPA: load JSON, render charts, animate on user input. No server dependencies."

---

**Next:** Open `06-LocalSetup.md` to learn how to run this project locally.
