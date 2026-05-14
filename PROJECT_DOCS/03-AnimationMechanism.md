# Animation Mechanism: The Core Technical Challenge

## The Problem

How do you animate a learning curve that grows from left to right as training epochs progress, while allowing users to control speed and pause?

## The Solution: Data Slicing + Disabled Chart Animation

### Step 1: Epoch-Based Data Slicing

Instead of animating the chart itself, we **filter the data** shown to the chart:

```typescript
// In LearningCurveChart.tsx
const data = currentEpoch ? allData.slice(0, currentEpoch) : allData;

// allData = [
//   {epoch: 1, val_accuracy: 0.45},
//   {epoch: 2, val_accuracy: 0.52},
//   ...
//   {epoch: 100, val_accuracy: 0.89}
// ]

// When currentEpoch = 45, chart only sees first 45 data points
// Visual effect: line appears to "grow" from left to right
```

### Step 2: Disable Recharts Animation

If Recharts animates the transition between datasets, it conflicts with our data slicing:

```typescript
<Line
  isAnimationActive={false}    // <-- Disabled
  animationDuration={undefined} // <-- No tweening
  dataKey="val_accuracy"
  stroke="#3b82f6"
/>
```

**Why this matters:**

- If enabled: Recharts would smooth/tween the line over 300ms, creating flicker
- If disabled: Line updates instantly to match the new dataset (smooth "growth")

### Step 3: Interval-Based Epoch Increment

In Dashboard.tsx, a timer loop increments `currentEpoch` every 50ms:

```typescript
useEffect(() => {
  if (!isPlaying) return;

  const interval = setInterval(() => {
    setCurrentEpoch((prev) => (prev < maxEpochs ? prev + 1 : maxEpochs));
  }, 50 / speed); // Dividing by speed: higher speed = shorter interval

  return () => clearInterval(interval);
}, [isPlaying, maxEpochs, speed]);
// NOT currentEpoch (if included, would cause interval to reset)
```

**Speed Multiplier:**

- `speed = 0.5` → interval = 100ms (slow)
- `speed = 1.0` → interval = 50ms (normal)
- `speed = 2.0` → interval = 25ms (fast)

## Why NOT Use Recharts Animation?

### Approach 1: Show Full Data + Move a ReferenceLine (FAILED)

```typescript
// Show all 100 epochs, but animate a vertical line marker
const data = allData; // All 100 points visible
<ReferenceLine x={currentEpoch} /> // Vertical marker moves
```

**Result:** Line appears static, only the marker moves. Not what we want.

### Approach 2: Full Data + Full Line Animation (FAILED)

```typescript
const data = allData;
<Line
  isAnimationActive={true}
  animationDuration={300}
/>
```

**Result:** Line is always fully drawn. Animation only triggers when data changes, but data doesn't change. Useless.

## The Animation Timeline

When user clicks **Play** at speed **1x**:

```
Time = 0ms:   currentEpoch = 1,  data.slice(0, 1)   → 1 point visible
Time = 50ms:  currentEpoch = 2,  data.slice(0, 2)   → 2 points visible
Time = 100ms: currentEpoch = 3,  data.slice(0, 3)   → 3 points visible
...
Time = 5000ms: currentEpoch = 100, data.slice(0, 100) → All 100 points (complete curve)
```

Result: User sees the curve **grow** from left to right over 5 seconds.

## The Bug We Fixed

**Original Issue:** Animation stopped working after adding new features (info tab, ranking table, reskin).

**Root Cause:** Dependency array in useEffect was wrong:

```typescript
// WRONG (caused interval to reset on every epoch change)
useEffect(() => {
  // ...interval code...
}, [isPlaying, maxEpochs, speed, currentEpoch]); // ❌ Too many deps

// CORRECT (only reset interval when playback settings change)
useEffect(() => {
  // ...interval code...
}, [isPlaying, maxEpochs, speed]); // ✓ Correct
```

**Fix:** Removed `currentEpoch` from the dependency array so the interval doesn't reset when the epoch changes.

## Why This Works

1. **Decouples Display from Logic:** The chart doesn't know about animation; it just renders what data it receives
2. **User Control:** Speed and pause buttons directly affect the interval, giving smooth control
3. **Performance:** No tweening/easing = low CPU overhead
4. **Simplicity:** ~10 lines of code vs. complex Recharts animation APIs

## Example: What the User Sees

**At Epoch 30 (0.5x speed, after 3000ms):**

```
Learning Curve: Adam + RBF Kernel
┌─────────────────────────────────┐
│                           ╱╱╱   │ ← Curve grows here
│              ╱╱╱╱╱       ╱      │
│       ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱        │ ← 30 epochs visible
│ ╱╱╱╱╱╱                          │
└─────────────────────────────────┘
Best Val Acc: 0.78
Epoch: 30 / 100
```

---

**Next:** Open `04-BackendArchitecture.md` to understand how the data was generated.
