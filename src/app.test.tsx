import '@testing-library/jest-dom';

import React from 'react';
import {render, screen} from '@testing-library/react';

import {App} from './app';

test('renders', () => {
  render(<App />);
  const linkElement = screen.getByText(/PocketMon/);
  expect(linkElement).toBeInTheDocument();
});
