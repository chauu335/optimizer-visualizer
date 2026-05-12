"""Feature transformation functions."""

import numpy as np
from typing import Optional


def select_rbf_centers(X_train: np.ndarray,
                       n_centers: int = 80,
                       seed: int = 6) -> np.ndarray:
    """
    Select RBF centers randomly from training data.
    
    Parameters:
        X_train: Training feature matrix of shape (n_samples, n_features)
        n_centers: Number of centers to select
        seed: Random seed for reproducibility
        
    Returns:
        Centers matrix of shape (n_centers, n_features)
    """
    X_train = np.asarray(X_train, dtype=float)
    if X_train.ndim != 2:
        raise ValueError("X_train must be a 2D array.")

    n_samples = X_train.shape[0]
    n_centers = max(1, min(n_centers, n_samples))

    rng = np.random.default_rng(seed)
    center_idx = rng.choice(n_samples, size=n_centers, replace=False)
    return X_train[center_idx]


def rbf_transform(X: np.ndarray,
                  centers: np.ndarray,
                  gamma: float = 0.1) -> np.ndarray:
    """
    Apply RBF (Radial Basis Function) kernel transformation.
    
    Parameters:
        X: Feature matrix of shape (n_samples, n_features)
        centers: RBF centers of shape (n_centers, n_features)
        gamma: RBF bandwidth parameter (gamma > 0)
        
    Returns:
        Transformed features of shape (n_samples, n_centers)
        where output[i, j] = exp(-gamma * ||X[i] - centers[j]||^2)
    """
    X = np.asarray(X, dtype=float)
    centers = np.asarray(centers, dtype=float)

    if X.ndim != 2 or centers.ndim != 2:
        raise ValueError("X and centers must both be 2D arrays.")
    if X.shape[1] != centers.shape[1]:
        raise ValueError("X and centers must have the same number of features.")
    if gamma <= 0:
        raise ValueError("gamma must be > 0.")

    diff = X[:, None, :] - centers[None, :, :]  # (n_samples, n_centers, n_features)
    sq_dist = np.sum(diff ** 2, axis=2)  # (n_samples, n_centers)
    return np.exp(-gamma * sq_dist)


def polynomial_transform(X: np.ndarray,
                         degree: int = 2,
                         include_bias: bool = False,
                         interaction_only: bool = False) -> np.ndarray:
    """
    Apply polynomial kernel transformation.
    
    Generates polynomial features up to specified degree, optionally including only interaction terms.
    
    Parameters:
        X: Feature matrix of shape (n_samples, n_features)
        degree: Polynomial degree (1-4)
        include_bias: Whether to include a bias (constant 1) column
        interaction_only: If True, include only interaction terms (skip pure powers)
        
    Returns:
        Transformed features including original features and polynomial combinations
        
    Example:
        If X has 2 features [x1, x2] and degree=2, interaction_only=False:
        Output: [x1, x2, x1^2, x1*x2, x2^2]
        
        If interaction_only=True:
        Output: [x1, x2, x1*x2]
    """
    X = np.asarray(X, dtype=float)
    if X.ndim != 2:
        raise ValueError("X must be a 2D array.")
    if degree < 1:
        raise ValueError("degree must be >= 1.")
    if degree > 4:
        raise ValueError("polynomial_transform supports degrees 1-4.")

    n_samples, n_features = X.shape
    parts = []

    # Add bias if requested
    if include_bias:
        parts.append(np.ones((n_samples, 1), dtype=float))

    # Add original features (degree 1)
    parts.append(X)

    # Generate polynomial features for degrees 2 to `degree`
    for d in range(2, degree + 1):
        if d == 2:
            if interaction_only:
                # Only interactions: x1*x2, x1*x3, x2*x3, ...
                for i in range(n_features):
                    for j in range(i + 1, n_features):
                        parts.append((X[:, i] * X[:, j]).reshape(-1, 1))
            else:
                # All combinations including pure powers: x1^2, x1*x2, x2^2, ...
                for i in range(n_features):
                    for j in range(i, n_features):
                        parts.append((X[:, i] * X[:, j]).reshape(-1, 1))
        
        elif d == 3:
            if interaction_only:
                # Only 3-way interactions without pure powers
                for i in range(n_features):
                    for j in range(i + 1, n_features):
                        for k in range(j + 1, n_features):
                            parts.append((X[:, i] * X[:, j] * X[:, k]).reshape(-1, 1))
            else:
                # All 3-way combinations
                for i in range(n_features):
                    for j in range(i, n_features):
                        for k in range(j, n_features):
                            parts.append((X[:, i] * X[:, j] * X[:, k]).reshape(-1, 1))
        
        elif d == 4:
            if interaction_only:
                # Only 4-way interactions without pure powers
                for i in range(n_features):
                    for j in range(i + 1, n_features):
                        for k in range(j + 1, n_features):
                            for l in range(k + 1, n_features):
                                parts.append((X[:, i] * X[:, j] * X[:, k] * X[:, l]).reshape(-1, 1))
            else:
                # All 4-way combinations
                for i in range(n_features):
                    for j in range(i, n_features):
                        for k in range(j, n_features):
                            for l in range(k, n_features):
                                parts.append((X[:, i] * X[:, j] * X[:, k] * X[:, l]).reshape(-1, 1))

    return np.hstack(parts)
