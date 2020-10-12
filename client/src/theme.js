import { createGlobalStyle } from 'styled-components';
import 'reset-css';

export const theme = {
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
  },
  ellipsis: `
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  `,
  MuiTypography: {
    body: {
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
    body2: {
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
    body1: {
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
  },
  MuiTab: {
    flexContainer: {
      background: '#f00 !important'
    },
  },
  MuiCssBaseline: {
    '@global': {
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
  },
  colors: {
    purple: '#a946f6',
    violet: '#770fc8',
    violetDarker: '#4C107F',
    violetTrans: 'rgba(119,15,200,0.1)',
    green: '#07d451',
    grey: '#fbfafc',
    black: '#000000',
    white: '#ffffff',
    emerald: '#08a441',
    dark: '#191927',
    semiDark: '#656565',
    red: '#f63f82',
    blackTrans: 'rgba(0, 0, 0, 0.05)',
    blackTrans2: 'rgba(0, 0, 0, 0.1)',
    darkBackground: '#161627',
  },
  breakpoints: {
    mobile: '420px',
    fablet: '600px',
    tablet: '750px',
    desktop: '990px',
  },
};

export const GlobalStyle = createGlobalStyle`
  body, html, * {
    font-family: 'IBM Plex Sans', sans-serif;
    color: ${props => props.theme.colors.dark}
  }
  
  body {
    background: ${props => props.theme.colors.grey};
  }
  
  a, a:visited, a:active {
    color:${props => props.theme.colors.darkBackground};
  }
  
  a:hover {
    color: ${props => props.theme.colors.violet};
  }
  
  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.17em; }
  h4 { font-size: 1.12em; }
  h5 { font-size: .83em; }
  h6 { font-size: .75em; }
  
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.21;
  }

  p {
    line-height: 1.44;
    margin-bottom: 0.8rem;
  }
`;
