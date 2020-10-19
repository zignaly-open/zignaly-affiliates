import styled from 'styled-components';

const Muted = styled.span`
  opacity: 0.6;
  line-height: 1.3;
  ${props => props.block && 'display: block;'}
  ${props => props.small && 'font-size: 0.8rem;'}
  ${props => props.marginBottom && `margin-bottom: ${props.marginBottom}px`}
  ${props => props.marginTop && `margin-top: ${props.marginTop}px`}
`;

export default Muted;
