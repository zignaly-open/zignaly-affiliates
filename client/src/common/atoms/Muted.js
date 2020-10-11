import styled from 'styled-components';

const Muted = styled.span`
  opacity: 0.6;
  ${props => props.block && 'display: block;'}
  ${props => props.marginBottom && `margin-bottom: ${props.marginBottom}px`}
`;

export default Muted;
