import styled from 'styled-components';

const ContentWrapper = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(64, 34, 95, 0.2);
  padding: 24px 24px 27px;
  margin-bottom: 20px;
`;

export default ContentWrapper;
