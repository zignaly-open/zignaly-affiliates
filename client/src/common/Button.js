import styled from 'styled-components';

const Button = styled.button`
  min-width: ${props => (props.link ? '0' : props.minWidth || 160)}px;
  height: ${props => (props.link ? '0' : props.compact ? 40 : 48)}px;
  object-fit: contain;
  font-size: ${props => (props.link ? 'inherit' : '1rem')};
  font-weight: 600;
  line-height: 1.31;
  letter-spacing: 0.61px;
  text-align: center;
  border: ${props => (props.primary ? 0 : 2)}px solid
    ${props => props.theme.colors[props.danger ? 'red' : 'violet']};

  color: ${props =>
    props.primary
      ? props.theme.colors.white
      : props.theme.colors[props.danger ? 'red' : 'violet']};

  svg {
    fill: ${props =>
      props.primary
        ? props.theme.colors.white
        : props.theme.colors[props.danger ? 'red' : 'violet']};
  }
  border-radius: 4px;
  background: ${props =>
    props.primary ? props.theme.colors.violet : props.theme.colors.white};
  transition: all 0.2s;
  cursor: pointer;
  outline: none !important;
  margin-right: 10px;

  ${props => props.link && 'border: none !important'};
  ${props => props.link && 'box-shadow: none !important'};
  ${props => props.link && 'padding: 0 !important'};
  ${props => props.link && 'margin: 0 !important'};

  &:hover {
    ${props =>
      props.primary
        ? `background: ${props.theme.colors.purple}`
        : 'box-shadow: 0 0 6px 1px rgba(0,0,0,0.2)'};
    ${props => props.link && 'text-decoration: underline !important;'};
  }

  &:active {
    background: ${props =>
      props.primary
        ? props.theme.colors.violetDarker
        : props.theme.colors.violetTrans};
  }

  &:focus {
    box-shadow: 0 0 0 2px ${props => props.theme.colors.green};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.blackTrans};
    border-color: ${props => props.theme.colors.blackTrans};
    box-shadow: none !important;
    color: ${props => props.theme.colors.semiDark};
    cursor: not-allowed;
  }

  ${props =>
    props.isLoading
      ? `
    animation: pulse 1s infinite;
    cursor: not-allowed;
    pointer-events: none;
  `
      : ''}

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.75;
    }
    100% {
      opacity: 1;
    }
  }
`;

export default Button;
