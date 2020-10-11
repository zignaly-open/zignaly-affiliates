import styled from 'styled-components';

const Message = styled.div`
  margin: 15px 0;
  font-size: 1rem;
  &,
  & a,
  & a:visited {
    color: ${props =>
      (props.success && props.theme.colors.green) ||
      (props.danger && props.theme.colors.red) ||
      props.theme.colors.dark};
  }
`;

export default Message;
