import React, { useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import 'reset-css';
import 'tootik/css/tootik.min.css';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { AppProvider } from './context/app';
import { GlobalStyle } from './theme';

const RootProvider = ({ theme, children }) => {
  const themeValue = useMemo(
    () =>
      createMuiTheme({
        ...theme,
      }),
    [theme],
  );
  return (
    <ThemeProvider theme={themeValue}>
      <MuiThemeProvider theme={themeValue}>
        <AppProvider>
          <>
            <GlobalStyle />
            {children}
          </>
        </AppProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
};
export default RootProvider;
