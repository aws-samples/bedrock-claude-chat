import React from 'react';
import '../src/i18n';
import { GlobalProvider } from '@ladle/react';
import '../src/index.css';
export const Provider: GlobalProvider = ({ children }) => {
  return <>{children}</>;
};
