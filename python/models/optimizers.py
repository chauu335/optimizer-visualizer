"""Optimization algorithms for training models."""

from abc import ABC, abstractmethod
from typing import Optional
import numpy as np
from .base import Model


class Optimizer(ABC):
    """Abstract base class for optimizers."""
    
    @abstractmethod
    def step(self, model: Model, grad: Optional[np.ndarray] = None, **kwargs):
        """Perform a single optimization step."""
        raise NotImplementedError("Must be implemented by subclass.")


class KieferWolfowitz(Optimizer):
    """
    Kiefer-Wolfowitz stochastic approximation optimizer.
    Estimates gradients from function evaluations without explicit gradients.
    """
    
    def __init__(self,
                 lr_a: float = 1.0,
                 lr_c: float = 1.0,
                 delta: float = 1/3,
                 method: str = 'kw',
                 seed: int = 6):
        """
        Initialize Kiefer-Wolfowitz optimizer.
        
        Parameters:
            lr_a: Coefficient for step size sequence (a_t = lr_a / t)
            lr_c: Coefficient for perturbation size (c_t = lr_c / t^delta)
            delta: Exponent for perturbation decay
            method: 'kw' (coordinate-wise), 'sp' (two-sided), or 'rd' (random direction)
            seed: Random seed for reproducibility
        """
        self.lr_a = lr_a
        self.lr_c = lr_c
        self.delta = delta
        self.method = method.lower()
        self.t = 0
        self.rng = np.random.default_rng(seed)
        
        if self.method not in ['kw', 'sp', 'rd']:
            raise ValueError(f"method must be 'kw', 'sp', or 'rd', got '{self.method}'")
    
    def step(self, 
             model: Model, 
             grad: Optional[np.ndarray] = None, 
             X: Optional[np.ndarray] = None, 
             Y: Optional[np.ndarray] = None):
        """
        Perform optimization step using gradient estimation.
        
        Parameters:
            model: Model to optimize
            grad: Not used (gradient is estimated)
            X: Feature matrix for gradient estimation
            Y: Labels for gradient estimation
        """
        if X is None or Y is None:
            raise ValueError("KieferWolfowitz.step requires X and Y parameters.")

        self.t += 1
        a_t = self.lr_a / self.t
        c_t = self.lr_c / (self.t ** self.delta)
        
        if self.method == 'kw':
            grad_est = self._estimate_grad_kw(model, X, Y, c_t)
        elif self.method == 'sp':
            grad_est = self._estimate_grad_sp(model, X, Y, c_t)
        else:  # 'rd'
            grad_est = self._estimate_grad_rd(model, X, Y, c_t)
        
        model.W -= a_t * grad_est
    
    def _loss_with_perturbed_weights(self, model: Model, X: np.ndarray, Y: np.ndarray, perturbation: np.ndarray) -> float:
        """Temporarily perturb weights, compute loss, restore weights."""
        W_orig = model.W.copy()
        model.W = W_orig + perturbation
        loss = model.compute_loss(X, Y)
        model.W = W_orig
        return loss
    
    def _estimate_grad_kw(self, model: Model, X: np.ndarray, Y: np.ndarray, c: float) -> np.ndarray:
        """Coordinate-wise gradient estimation."""
        d = model.W.shape[0]
        grad = np.zeros_like(model.W)
        
        for i in range(d):
            e = np.zeros_like(model.W)
            e[i, 0] = 1.0
            
            loss_plus = self._loss_with_perturbed_weights(model, X, Y, c * e)
            loss_minus = self._loss_with_perturbed_weights(model, X, Y, -c * e)
            grad[i, 0] = (loss_plus - loss_minus) / (2 * c)
        
        return grad
    
    def _estimate_grad_sp(self, model: Model, X: np.ndarray, Y: np.ndarray, c: float) -> np.ndarray:
        """Simultaneous perturbation gradient estimation with random direction."""
        d = model.W.shape[0]
        v = 2 * self.rng.integers(0, 2, size=(d, model.out_dim)) - 1
        
        loss_plus = self._loss_with_perturbed_weights(model, X, Y, c * v)
        loss_minus = self._loss_with_perturbed_weights(model, X, Y, -c * v)
        
        grad = (loss_plus - loss_minus) / (2 * c) / v
        return grad
    
    def _estimate_grad_rd(self, model: Model, X: np.ndarray, Y: np.ndarray, c: float) -> np.ndarray:
        """Random direction gradient estimation."""
        d = model.W.shape[0]
        v = self.rng.standard_normal(size=(d, model.out_dim))
        v = v / np.linalg.norm(v)
        
        loss_plus = self._loss_with_perturbed_weights(model, X, Y, c * v)
        loss_minus = self._loss_with_perturbed_weights(model, X, Y, -c * v)
        
        grad = (loss_plus - loss_minus) / (2 * c) * v
        return grad


class Adagrad(Optimizer):
    """Adaptive gradient descent optimizer. Adapts step size per parameter."""
    
    def __init__(self,
                 lr: float = 0.01,
                 epsilon: float = 1e-8):
        """
        Initialize Adagrad optimizer.
        
        Parameters:
            lr: Learning rate
            epsilon: Small constant for numerical stability
        """
        self.lr = lr
        self.epsilon = epsilon
        self.G: Optional[np.ndarray] = None  # Accumulated squared gradients
    
    def step(self, model: Model, grad: np.ndarray, **kwargs):
        """Perform optimization step with adaptive learning rates."""
        if self.G is None:
            self.G = np.zeros_like(grad)

        self.G += grad ** 2
        model.W -= self.lr * grad / (np.sqrt(self.G) + self.epsilon)


class RMSProp(Optimizer):
    """RMSProp optimizer. Exponentially moving average of squared gradients."""
    
    def __init__(self,
                 lr: float = 0.001,
                 beta: float = 0.9,
                 epsilon: float = 1e-8):
        """
        Initialize RMSProp optimizer.
        
        Parameters:
            lr: Learning rate
            beta: Decay rate for exponential moving average
            epsilon: Small constant for numerical stability
        """
        self.lr = lr
        self.beta = beta
        self.epsilon = epsilon
        self.V = None

    def step(self, model: Model, grad: np.ndarray, **kwargs):
        """Perform optimization step."""
        if self.V is None:
            self.V = np.zeros_like(model.W) 

        self.V = self.beta * self.V + (1 - self.beta) * (grad ** 2)
        model.W -= self.lr * grad / (np.sqrt(self.V + self.epsilon))


class Adam(Optimizer):
    """Adam optimizer. Combines momentum and RMSProp."""
    
    def __init__(self,
                 lr: float = 0.001,
                 beta1: float = 0.9,
                 beta2: float = 0.999,
                 epsilon: float = 1e-8):
        """
        Initialize Adam optimizer.
        
        Parameters:
            lr: Learning rate
            beta1: Decay rate for first moment (momentum)
            beta2: Decay rate for second moment (RMSProp)
            epsilon: Small constant for numerical stability
        """
        self.lr = lr
        self.beta1 = beta1
        self.beta2 = beta2
        self.epsilon = epsilon
        self.M = None  # First moment
        self.V = None  # Second moment
        self.t = 0  # Time step

    def step(self, model: Model, grad: np.ndarray, **kwargs):
        """Perform optimization step with bias correction."""
        
        if self.M is None or self.V is None:
            self.M = np.zeros_like(model.W)
            self.V = np.zeros_like(model.W)
             
        self.t += 1

        # Update biased first and second moments
        self.M = self.beta1 * self.M + (1 - self.beta1) * grad
        self.V = self.beta2 * self.V + (1 - self.beta2) * (grad ** 2)

        # Bias-corrected moment estimates
        M_hat = self.M / (1 - self.beta1 ** self.t)
        V_hat = self.V / (1 - self.beta2 ** self.t)

        # Update weights
        model.W -= self.lr * M_hat / (np.sqrt(V_hat) + self.epsilon)
