import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa o DOM após cada teste para evitar fugas de memória ou poluição de estado
afterEach(() => {
  cleanup();
});
