# Backend Architecture: Data Generation Pipeline

## Overview

The Python backend generates all experimental results once, exports to JSON, and the frontend loads that static data. No real-time computation happens during playback.

## The Experiment

**Hypothesis:** Different optimizers and kernels have different training dynamics.

**Setup:**

- **Dataset:** Synthetic 2D classification (generated from Scikit-learn)
- **Model:** Support Vector Machine (SVM)
- **Optimizers Tested:** SGD, Adam, RMSprop, Adagrad (custom implementations)
- **Kernels Tested:** Linear, RBF (Radial Basis Function), Polynomial
- **Training:** 100 epochs, batch size 32, learning rate 0.01

**Total Combinations:** 4 optimizers × 3 kernels = 12 experiments

## File Structure

```
python/
├── main.py              # Script orchestrator
├── models/
│   ├── base.py          # Abstract Model class
│   ├── svm.py           # SVM implementation
│   └── optimizers.py    # Optimizer classes (SGD, Adam, RMSprop, Adagrad)
├── utils/
│   ├── trainer.py       # Training loop (epoch-by-epoch)
│   ├── transforms.py    # Kernel transformations (Linear, RBF, Polynomial)
│   └── generate_data.py # Synthetic dataset generation
└── data/                # (Directory for intermediate data, if needed)
```

## Execution Flow (python/main.py)

```
1. generate_synthetic_data()
   └─ Creates X_train, y_train, X_val, y_val

2. For each (optimizer, kernel) pair:
   a. Create SVM model with kernel transform
   b. Create trainer with optimizer
   c. Run training loop for 100 epochs:
      - Compute validation accuracy
      - Record training/validation metrics
      - Save epoch-by-epoch results
   d. Calculate final metrics (best accuracy, convergence, time)

3. Aggregate all 12 results

4. Export to public/data/results.json
```

## Key Classes

### 1. Model (base.py)

Abstract base class for ML models:

```python
class Model:
    def forward(self, X):
        """Compute predictions"""
        raise NotImplementedError

    def loss(self, y_true, y_pred):
        """Compute loss"""
        raise NotImplementedError
```

### 2. SVM (svm.py)

Support Vector Machine implementation:

```python
class SVMModel(Model):
    def __init__(self, kernel='linear', C=1.0):
        self.kernel = kernel  # Which kernel transform
        self.C = C            # Regularization strength
        self.weights = None
        self.bias = None

    def forward(self, X):
        # Apply kernel transform, then compute prediction
        return np.dot(self.kernel_transform(X), self.weights) + self.bias
```

**Kernel Transforms:**

- **Linear:** No transform, use raw features
- **RBF:** `exp(-gamma * ||x - center||^2)` for selected centers
- **Polynomial:** `(x · y + 1)^d`

### 3. Optimizers (optimizers.py)

Four optimizers with update rules:

```python
class Optimizer:
    def step(self, weights, gradients, learning_rate):
        raise NotImplementedError

class SGD(Optimizer):
    def step(self, w, g, lr):
        return w - lr * g

class Adam(Optimizer):
    def __init__(self, beta1=0.9, beta2=0.999):
        self.m = 0  # First moment (momentum)
        self.v = 0  # Second moment (RMSprop)

    def step(self, w, g, lr):
        self.m = 0.9 * self.m + 0.1 * g
        self.v = 0.999 * self.v + 0.001 * (g ** 2)
        m_hat = self.m / (1 - 0.9 ** t)
        v_hat = self.v / (1 - 0.999 ** t)
        return w - lr * m_hat / (np.sqrt(v_hat) + 1e-8)

# Similar patterns for RMSprop, Adagrad
```

### 4. Trainer (trainer.py)

Epoch-by-epoch training loop:

```python
class Trainer:
    def __init__(self, model, optimizer, learning_rate=0.01):
        self.model = model
        self.optimizer = optimizer
        self.lr = learning_rate

    def train_epoch(self, X_train, y_train, batch_size=32):
        total_loss = 0
        for batch in minibatches(X_train, y_train, batch_size):
            predictions = self.model.forward(batch.X)
            loss = self.model.loss(batch.y, predictions)
            gradients = compute_gradients(...)
            weights = self.optimizer.step(weights, gradients, self.lr)
        return total_loss / num_batches

    def evaluate(self, X_val, y_val):
        predictions = self.model.forward(X_val)
        accuracy = (predictions == y_val).mean()
        return accuracy
```

## Results JSON Structure

**File:** `public/data/results.json`

```json
{
  "results": [
    {
      "optimizer": "Adam",
      "kernel": "RBF",
      "training_metrics": {
        "val_accuracy_per_epoch": [0.45, 0.52, 0.58, ..., 0.89],
        "train_loss_per_epoch": [2.3, 2.1, 1.9, ..., 0.1],
        "time_per_epoch": [0.023, 0.021, 0.022, ...]
      },
      "final_metrics": {
        "val_accuracy": 0.89,
        "best_epoch": 87,
        "convergence": "Epoch 45",
        "total_time": 2.34
      }
    },
    // ... 11 more results
  ]
}
```

## Key Metrics Explained

| Metric                   | Definition                               | Purpose                             |
| ------------------------ | ---------------------------------------- | ----------------------------------- |
| `val_accuracy_per_epoch` | Accuracy on validation set at each epoch | Shows learning trajectory           |
| `best_epoch`             | Epoch where accuracy was highest         | When did learning "stop improving"? |
| `convergence`            | Estimated epoch when accuracy plateaued  | Training efficiency                 |
| `total_time`             | Wall-clock time for all 100 epochs       | Computational cost                  |

## Why Pre-compute Results?

1. **Performance:** Frontend doesn't need a backend API; just loads JSON
2. **Reliability:** Results never change; no dependency on Python runtime
3. **Simplicity:** No database or server-side state needed
4. **Reproducibility:** Results are fixed, can be version-controlled

## Data Science Insights from Results

Expected findings:

- **Adaptive optimizers (Adam, RMSprop)** converge faster than SGD
- **RBF kernel** often outperforms linear for non-linear data
- **Adagrad** may overfit (learning rate decreases over time)
- **Polynomial kernel** adds complexity; slower training

These are empirically validated by the actual numbers in results.json.

---

**Next:** Open `05-KeyFeatures.md` to understand what the user can do with this data.
