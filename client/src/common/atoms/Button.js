import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

const getButtonColor = props => {
  if (props.danger) return props.theme.colors.red;
  if (props.success) return props.theme.colors.emerald;
  return props.theme.colors.violet;
};

const Button = styled.button`
  min-width: ${props => (props.link ? '0' : props.minWidth || 160)}px;
  height: ${props => (props.link ? '0' : props.compact ? 40 : 48)}px;
  object-fit: contain;
  font-size: ${props => (props.link ? 'inherit' : '1rem')};
  ${props =>
    props.small &&
    css`
      font-size: 0.8rem;
    `};
  font-weight: 600;
  line-height: 1.31;
  letter-spacing: 0.61px;
  text-align: center;
  border: ${props => (props.primary ? 0 : 2)}px solid
    ${props => getButtonColor(props)};

  color: ${props =>
    props.primary ? props.theme.colors.white : getButtonColor(props)};

  svg {
    fill: ${props =>
      props.primary ? props.theme.colors.white : getButtonColor(props)};
  }
  border-radius: 4px;
  background: ${props =>
    props.primary ? getButtonColor(props) : props.theme.colors.white};
  transition: all 0.2s;
  cursor: pointer;
  outline: none !important;
  margin-right: 10px;

  ${props =>
    props.withIcon &&
    `
    svg {
      margin-right: 7px;
      margin-bottom: -${props.compact ? 5 : 6}px;
    }
  `};
  ${props => props.link && 'border: none !important'};
  ${props => props.link && 'box-shadow: none !important'};
  ${props => props.link && 'padding: 0 !important'};
  ${props => props.link && 'margin: 0 !important'};
  ${props => props.marginTop && `margin-top: ${props.marginTop}px`};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    ${props =>
      props.fullWidthOnMobile &&
      `
      display: block;
      width: 100%;
    `}
  }

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

Button.propTypes = {
  marginTop: PropTypes.number,
  fullWidthOnMobile: PropTypes.bool,
  isLoading: PropTypes.bool,
  primary: PropTypes.bool,
  link: PropTypes.bool,
  withIcon: PropTypes.bool,
  compact: PropTypes.bool,
  danger: PropTypes.bool,
  success: PropTypes.bool,
  minWidth: PropTypes.number,
  small: PropTypes.bool,
};
