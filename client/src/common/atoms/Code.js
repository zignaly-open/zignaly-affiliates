import styled from 'styled-components';

const Code = styled.span`
  color: ${props => props.theme.colors.red};
  background-color: ${props => props.theme.colors.redTransparent};
  font-family: 'IBM Plex Mono', monospace;
`;

export default Code;
