"""
Synthetic data generation module.

Generate synthetic datasets for optimizer visualization.
TODO: Implement synthetic data generation here
"""

import numpy as np
from typing import Tuple


def generate_synthetic_data(n_samples: int = 500, 
                           n_features: int = 50,
                           random_state: int = 6,
                           separation: float = 0.6,
                           noise_level: float = 0.2) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate binary classification data by sampling from two Gaussian distributions.
    
    Creates a moderately separable dataset with balanced classes.
    Classes are sampled from Gaussian distributions with controlled overlap.
    Noise is added to make the problem more realistic and interesting for optimization.
    
    Parameters:
        n_samples: Total samples (split 50/50 between classes)
        n_features: Feature dimensionality
        random_state: Random seed for reproducibility
        separation: Distance between class means (lower = harder problem). Default 0.6 = moderate difficulty
        noise_level: Standard deviation of noise added to class +1 samples. Default 0.2 = realistic overlap
    
    Returns:
        X: (n_samples, n_features) feature matrix, standardized to mean=0, std=1
        y: (n_samples,) labels in {-1, 1}
        
    Example:
        >>> X, y = generate_synthetic_data(n_samples=500, n_features=50)
        >>> X.shape, y.shape
        ((500, 50), (500,))
        >>> np.unique(y)
        array([-1,  1])
    """
    rng = np.random.RandomState(random_state)
    n_per_class = n_samples // 2

    # Class -1: centered at origin
    X_neg = rng.randn(n_per_class, n_features)

    # Class +1: centered at [separation, separation, ..., separation]
    # with added noise for more realistic overlapping classes
    X_pos = rng.randn(n_per_class, n_features) + separation
    X_pos += rng.randn(n_per_class, n_features) * noise_level

    # Stack classes
    X = np.vstack((X_neg, X_pos))
    y = np.hstack((np.full(n_per_class, -1), np.full(n_per_class, 1)))

    # Standardize features (zero mean, unit variance)
    X = (X - X.mean(axis=0)) / (X.std(axis=0) + 1e-8)   # Avoid division by zero

    return X, y
    
