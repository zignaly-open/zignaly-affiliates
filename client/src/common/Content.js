import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Grid from "@material-ui/core/Grid";

const Content = ({ title, description, children, hideHr, actions }) => (
  <ContentWrapper>
    <Grid container>
      <Grid item xs={12} sm={7}>
        {!!title && <ContentTitle>{title}</ContentTitle>}
        {!!description && <ContentDescription>{description}</ContentDescription>}
      </Grid>
      <Grid item xs={12} sm={5}>
        {!!actions && <Actions>{actions}</Actions>}
      </Grid>
    </Grid>


    {!!(title || description) && !hideHr && <Hr />}
    {children}
  </ContentWrapper>
);

export default Content;

const ContentWrapper = styled.div`
  padding: 16px 32px;
  max-width: 960px;
  margin: 0 auto;
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 16px 10px;
  }
`;

const Actions = styled.div`
 text-align: right;
   @media (max-width: ${props => props.theme.breakpoints.fablet}) {
    text-align: left;
  }
`;

const ContentTitle = styled.h1`
  margin-bottom: 8px;
  font-weight: bold;
  letter-spacing: 1.25px;
`;

const ContentDescription = styled.p`
  font-size: 1.1rem;
  font-weight: 300;

  opacity: 0.7;
  line-height: 1.44;
  letter-spacing: 0.68px;
`;

const Hr = styled.div`
  border-bottom: 1px solid ${props => props.theme.colors.blackTrans};
  margin: 10px 0 25px;
`;

Content.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  hideHr: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
