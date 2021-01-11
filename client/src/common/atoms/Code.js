import styled, { css } from 'styled-components';

const Code = styled.span`
  color: ${props => props.theme.colors.red};
  background-color: ${props => props.theme.colors.redTransparent};
  font-family: 'IBM Plex Mono', monospace;
  lint-height: 1.37;
  text-align: center;
  ${props => props.big && css`font-size: 1.1rem;`};
  word-break: break-word;
  a,
  a:visited,
  a:hover {
    color: ${props => props.theme.colors.red} !important;
    text-decoration: none;
  }
`;

export default Code;
