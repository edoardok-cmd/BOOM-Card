import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from '../Skeleton';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Skeleton', () => {
  it('renders without crashing', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Skeleton />);
    expect(skeleton).toHaveClass('skeleton');
    expect(skeleton).toHaveClass('skeleton--pulse');
  });

  it('accepts and applies custom className', () => {
    const customClass = 'custom-skeleton-class';
    render(<Skeleton className={customClass} />);
    expect(skeleton).toHaveClass('skeleton');
    expect(skeleton).toHaveClass(customClass);
  });

  it('renders with custom width', () => {
    render(<Skeleton width={200} />);
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('renders with custom height', () => {
    render(<Skeleton height={50} />);
    expect(skeleton).toHaveStyle({ height: '50px' });
  });

  it('renders with percentage width', () => {
    render(<Skeleton width="75%" />);
    expect(skeleton).toHaveStyle({ width: '75%' });
  });

  it('renders with percentage height', () => {
    render(<Skeleton width="100%" height="25%" />);
    expect(skeleton).toHaveStyle({ height: '25%' });
  });

  it('renders as circle variant', () => {
    render(<Skeleton variant="circle" width={40} height={40} />);
    expect(skeleton).toHaveClass('skeleton--circle');
    expect(skeleton).toHaveStyle({ 
      width: '40px',
      height: '40px'
    });
  });

  it('renders as text variant', () => {
    render(<Skeleton variant="text" />);
    expect(skeleton).toHaveClass('skeleton--text');
  });

  it('renders as rectangular variant by default', () => {
    render(<Skeleton variant="rectangular" />);
    expect(skeleton).toHaveClass('skeleton--rectangular');
  });

  it('renders with wave animation', () => {
    render(<Skeleton animation="wave" />);
    expect(skeleton).toHaveClass('skeleton--wave');
    expect(skeleton).not.toHaveClass('skeleton--pulse');
  });

  it('renders with pulse animation by default', () => {
    render(<Skeleton animation="pulse" />);
    expect(skeleton).toHaveClass('skeleton--pulse');
  });

  it('renders with no animation', () => {
    render(<Skeleton animation={false} />);
    expect(skeleton).not.toHaveClass('skeleton--pulse');
    expect(skeleton).not.toHaveClass('skeleton--wave');
  });

  it('renders multiple skeletons with count prop', () => {
    render(<Skeleton count={3} />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('applies custom styles', () => {
    const customStyles = {
      backgroundColor: '#f0f0f0',
      borderRadius: '8px'
    };
    render(<Skeleton style={customStyles} />);
    expect(skeleton).toHaveStyle(customStyles);
  });

  it('renders with custom border radius', () => {
    render(<Skeleton borderRadius={16} />);
    expect(skeleton).toHaveStyle({ borderRadius: '16px' });
  });

  it('renders inline', () => {
    render(<Skeleton inline />);
    expect(skeleton).toHaveClass('skeleton--inline');
  });

  it('renders as block by default', () => {
    render(<Skeleton />);
    expect(skeleton).not.toHaveClass('skeleton--inline');
  });

  it('accepts custom aria-label', () => {
    const ariaLabel = 'Loading content';
    render(<Skeleton aria-label={ariaLabel} />);
    expect(skeleton).toHaveAttribute('aria-label', ariaLabel);
  });

  it('has default aria-label', () => {
    render(<Skeleton />);
    expect(skeleton).toHaveAttribute('aria-label', 'Loading...');
  });

  it('has aria-busy attribute', () => {
    render(<Skeleton />);
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('renders children when loading is false', () => {
    const content = 'Loaded content';
    render(
      <Skeleton loading={false}>
        <div>{content}</div>
      </Skeleton>
    );
    expect(screen.getByText(content)).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
  });

  it('renders skeleton when loading is true', () => {
    render(
      <Skeleton loading={true}>
        <div>{content}</div>
      </Skeleton>
    );
    expect(screen.queryByText(content)).not.toBeInTheDocument();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders skeleton by default when children exist', () => {
    render(
      <Skeleton>
        <div>{content}</div>
      </Skeleton>
    );
    expect(screen.queryByText(content)).not.toBeInTheDocument();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Skeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders with custom test id', () => {
    const customTestId = 'custom-skeleton-test-id';
    render(<Skeleton data-testid={customTestId} />);
    expect(skeleton).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('skeleton');
  });

  it('renders with duration prop', () => {
    render(<Skeleton duration={2} />);
    expect(skeleton).toHaveStyle({ '--skeleton-duration': '2s' });
  });

  it('renders with color prop', () => {
    render(<Skeleton color="#cccccc" />);
    expect(skeleton).toHaveStyle({ '--skeleton-color': '#cccccc' });
  });

  it('renders with highlightColor prop', () => {
    render(<Skeleton highlightColor="#ffffff" />);
    expect(skeleton).toHaveStyle({ '--skeleton-highlight-color': '#ffffff' });
  });

  it('renders multiple skeletons with spacing', () => {
    render(<Skeleton count={3} spacing={10} />);
    const container = screen.getByTestId('skeleton-container');
    expect(container).toHaveStyle({ gap: '10px' });
  });

  it('renders with custom container props when count > 1', () => {
    render(
      <Skeleton 
        count={3} 
        containerClassName="custom-container"
        containerTestId="custom-container-test-id"
      />
    );
    expect(container).toHaveClass('custom-container');
  });

  it('maintains aspect ratio for circle variant', () => {
    render(<Skeleton variant="circle" width={100} />);
    expect(skeleton).toHaveStyle({ 
      width: '100px',
      height: '100px'
    });
  });

  it('applies responsive width', () => {
    render(<Skeleton responsive />);
    expect(skeleton).toHaveClass('skeleton--responsive');
  });

  it('handles complex nested content', () => {
    render(
      <Skeleton loading={false}>
        <div>
          <h1>Title</h1>
          <p>Description</p>
        </div>
      </Skeleton>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders with delay prop', () => {
    jest.useFakeTimers();
    render(<Skeleton delay={500} />);
    
    // Initially should not render
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    
    // After delay should render
    jest.advanceTimersByTime(500);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('cleans up delay timer on unmount', () => {
    jest.useFakeTimers();
    const { unmount } = render(<Skeleton delay={500} />);
    
    unmount();
    
    // Should not throw or cause issues
    jest.advanceTimersByTime(1000);
    
    jest.useRealTimers();
  });
});
