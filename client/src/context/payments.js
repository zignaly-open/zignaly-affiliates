import { createContext } from 'react';

export const paymentContext = createContext({});

export const { Provider: PaymentProvider } = paymentContext;
