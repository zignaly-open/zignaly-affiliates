import React, { useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import PropTypes from 'prop-types';
import 'reset-css';
import 'tootik/css/tootik.min.css';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { AppProvider } from './contexts/app';
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

RootProvider.propTypes = {
  theme: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
