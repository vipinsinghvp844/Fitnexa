'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import { ToastProvider, Toaster } from '@/components/admin/toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </Provider>
  );
}
