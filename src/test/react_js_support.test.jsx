import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JsxTestBadge } from '../components/common/JsxTestBadge';

describe('React JS (.jsx) Interoperability Test Suite', () => {
  it('renders a pure React JS (.jsx) component seamlessly without TypeScript errors', () => {
    render(<JsxTestBadge label="Pure React JS Verified" />);
    expect(screen.getByText('Pure React JS Verified')).toBeInTheDocument();
  });
});
