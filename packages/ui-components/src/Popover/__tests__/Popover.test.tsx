import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from '../Popover';
import { PopoverTrigger } from '../PopoverTrigger';
import { PopoverContent } from '../PopoverContent';
import { PopoverArrow } from '../PopoverArrow';
import { PopoverClose } from '../PopoverClose';
import { vi } from 'vitest';

describe('Popover', () => {
  it('renders children correctly', () => {
    render(
      <Popover>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByText('Open Popover')).toBeInTheDocument();
    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
  });

  it('opens popover on trigger click', async () => {
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open Popover');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });
  });

  it('closes popover when clicking outside', async () => {
    
    render(
      <div>
        <div data-testid="outside">Outside Element</div>
        <Popover>
          <PopoverTrigger>
            <button>Open Popover</button>
          </PopoverTrigger>
          <PopoverContent>
            <div>Popover Content</div>
          </PopoverContent>
        </Popover>
      </div>
    );

    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    await waitFor(() => {
      expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
    });
  });

  it('closes popover with close button', async () => {
    
    render(
      <Popover>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
          <PopoverClose>
            <button aria-label="Close">×</button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    );

    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
    });
  });

  it('renders arrow when included', async () => {
    
    render(
      <Popover>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    await user.click(trigger);

    await waitFor(() => {
      const arrow = document.querySelector('[data-popper-arrow]');
      expect(arrow).toBeInTheDocument();
    });
  });

  it('handles controlled open state', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover open={false} onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <Popover open={true} onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    await waitFor(() => {
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });
  });

  it('supports different trigger events', async () => {
    
    render(
      <Popover trigger="hover">
        <PopoverTrigger>
          <button>Hover me</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText('Popover Content')).toBeInTheDocument();
    });

    await user.unhover(trigger);

    await waitFor(() => {
      expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
    });
  });

  it('supports different placements', async () => {
    
    render(
      <Popover placement="bottom">
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    await user.click(trigger);

    await waitFor(() => {
      const content = screen.getByText('Popover Content').parentElement;
      expect(content).toHaveAttribute('data-popper-placement', 'bottom');
    });
  });

  it('handles keyboard navigation', async () => {
    
    render(
      <Popover>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>
            <input type="text" placeholder="First input" />
            <input type="text" placeholder="Second input" />
            <button>Action</button>
          </div>
        </PopoverContent>
      </Popover>
    );

    trigger.focus();
    
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByPlaceholderText('First input')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('First input')).not.toBeInTheDocument();
    });
  });

  it('traps focus within popover when modal', async () => {
    
    render(
      <Popover modal>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>
            <input type="text" placeholder="First input" />
            <input type="text" placeholder="Second input" />
            <button>Action</button>
          </div>
        </PopoverContent>
      </Popover>
    );

    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('First input')).toHaveFocus();
    });

    await user.tab();
    expect(screen.getByPlaceholderText('Second input')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Action')).toHaveFocus();

    await user.tab();
    expect(screen.getByPlaceholderText('First input')).toHaveFocus();
  });

  it('handles offset configuration', async () => {
    
    render(
      <Popover offset={[10, 20]}>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    await user.click(trigger);

    await waitFor(() => {
      const style = window.getComputedStyle(content!);
      expect(style.transform).toContain('translate');
    });
  });

  it('prevents scroll when modal', async () => {
    
    render(
      <Popover modal>
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    await user.click(trigger);

    await waitFor(() => {
      expect(document.body).toHaveStyle({ overflow: 'hidden' });
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
    });
  });

  it('handles custom className and style', async () => {
    
    render(
      <Popover>
        <PopoverTrigger className="custom-trigger" style={{ color: 'red' }}>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent className="custom-content" style={{ backgroundColor: 'blue' }}>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );

    expect(trigger).toHaveClass('custom-trigger');
    expect(trigger).toHaveStyle({ color: 'red' });

    await user.click(screen.getByText('Open Popover'));

    await waitFor(() => {
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveStyle({ backgroundColor: 'blue' });
    });
  });

  it('handles disabled state', asyn
}