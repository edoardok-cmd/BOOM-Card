import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress } from '../Progress';
import { useProgress } from '../hooks/useProgress';

// Mock the useProgress hook
jest.mock('../hooks/useProgress');

describe('Progress', () => {
  const mockUseProgress = useProgress as jest.MockedFunction<typeof useProgress>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      mockUseProgress.mockReturnValue({
        percentage: 0,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={0} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should render with custom value', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={50} />);
      
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should render with label', () => {
      mockUseProgress.mockReturnValue({
        percentage: 75,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={75} label="Loading..." />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with percentage display', () => {
      mockUseProgress.mockReturnValue({
        percentage: 60,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={60} showPercentage />);
      
      expect(screen.getByText('60%')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={50} variant="default" />);
      
      const progressFill = container.querySelector('.progress-fill');
      expect(progressFill).toHaveClass('bg-primary-500');
    });

    it('should render success variant', () => {
      mockUseProgress.mockReturnValue({
        percentage: 100,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={100} variant="success" />);
      
      expect(progressFill).toHaveClass('bg-success-500');
    });

    it('should render warning variant', () => {
      mockUseProgress.mockReturnValue({
        percentage: 30,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={30} variant="warning" />);
      
      expect(progressFill).toHaveClass('bg-warning-500');
    });

    it('should render error variant', () => {
      mockUseProgress.mockReturnValue({
        percentage: 10,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={10} variant="error" />);
      
      expect(progressFill).toHaveClass('bg-error-500');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={50} size="sm" />);
      
      const progressContainer = container.querySelector('.progress-container');
      expect(progressContainer).toHaveClass('h-1');
    });

    it('should render medium size', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={50} size="md" />);
      
      expect(progressContainer).toHaveClass('h-2');
    });

    it('should render large size', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={50} size="lg" />);
      
      expect(progressContainer).toHaveClass('h-4');
    });
  });

  describe('Animation', () => {
    it('should handle animated prop', () => {
      const startAnimation = jest.fn();
      mockUseProgress.mockReturnValue({
        percentage: 0,
        isAnimating: true,
        startAnimation,
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={75} animated />);
      
      expect(startAnimation).toHaveBeenCalledWith(75, expect.any(Number));
    });

    it('should respect custom animation duration', () => {
      mockUseProgress.mockReturnValue({
        percentage: 0,
        isAnimating: true,
        startAnimation,
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={50} animated animationDuration={2000} />);
      
      expect(startAnimation).toHaveBeenCalledWith(50, 2000);
    });

    it('should apply animation class when animating', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: true,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={50} animated />);
      
      expect(progressFill).toHaveClass('transition-all');
    });
  });

  describe('Striped Pattern', () => {
    it('should render striped pattern when striped prop is true', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={50} striped />);
      
      expect(progressFill).toHaveClass('progress-striped');
    });

    it('should animate stripes when both striped and animatedStripes are true', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress value={50} striped animatedStripes />);
      
      expect(progressFill).toHaveClass('progress-striped-animated');
    });
  });

  describe('Indeterminate State', () => {
    it('should render indeterminate state', () => {
      mockUseProgress.mockReturnValue({
        percentage: 0,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      const { container } = render(<Progress indeterminate />);
      
      expect(progressBar).toHaveAttribute('aria-busy', 'true');
      
      expect(progressFill).toHaveClass('progress-indeterminate');
    });

    it('should ignore value prop when indeterminate', () => {
      mockUseProgress.mockReturnValue({
        percentage: 0,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={50} indeterminate />);
      
      expect(progressBar).not.toHaveAttribute('aria-valuenow');
    });
  });

  describe('Value Constraints', () => {
    it('should clamp values below 0', () => {
      mockUseProgress.mockReturnValue({
        percentage: 0,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={-10} />);
      
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should clamp values above 100', () => {
      mockUseProgress.mockReturnValue({
        percentage: 100,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={150} />);
      
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle custom min and max values', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={50} min={0} max={200} />);
      
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '200');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      mockUseProgress.mockReturnValue({
        percentage: 75,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={75} label="Upload progress" />);
      
      expect(progressBar).toHaveAttribute('aria-label', 'Upload progress');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should support custom aria-label', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: false,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={50} aria-label="Custom progress label" />);
      
      expect(progressBar).toHaveAttribute('aria-label', 'Custom progress label');
    });

    it('should indicate busy state when animating', () => {
      mockUseProgress.mockReturnValue({
        percentage: 50,
        isAnimating: true,
        startAnimation: jest.fn(),
        stopAnimation: jest.fn(),
        reset: jest.fn(),
      });

      render(<Progress value={5
}}}}