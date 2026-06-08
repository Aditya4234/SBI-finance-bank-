'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store/store';
import { hydrateAuth } from '@/store/slices/authSlice';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    store.dispatch(hydrateAuth());
    setHydrated(true);
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {hydrated ? children : null}
      </QueryClientProvider>
    </Provider>
  );
}
