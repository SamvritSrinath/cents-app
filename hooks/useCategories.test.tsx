/**
 * @module useCategories.test
 * Tests category query hook with mocked Supabase.
 */

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { supabase } from '../lib/supabase';
import { useCategories } from './useCategories';

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockGetUser = supabase.auth.getUser as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

const mockOrder = jest.fn();
let mockOr: jest.Mock;

function wrapper(client: QueryClient) {
  return function W({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrder.mockResolvedValue({
      data: [
        {
          id: 'd1',
          name: 'Default Cat',
          icon: '🥬',
          color: '#22c55e',
          is_default: true,
          user_id: null,
        },
      ],
      error: null,
    });
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
    mockOr = jest.fn().mockReturnValue({ order: mockOrder });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: mockOr,
      }),
    });
  });

  it('fetches default and user categories from Supabase', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useCategories(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Default Cat');
    expect(mockFrom).toHaveBeenCalledWith('categories');
    expect(mockOr).toHaveBeenCalledWith('is_default.eq.true,user_id.eq.user-1');
  });

  it('throws when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useCategories(), {
      wrapper: wrapper(client),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toMatch(/Not authenticated/i);
  });
});
