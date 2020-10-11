import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Error from '@material-ui/icons/Error';

const Fail = ({ text, icon }) => {
  return (
    <FailWrapper>
      {icon || <Error />}
      <div>{text || <>Something went wrong :(<br /> Please try later</>}</div>
    </FailWrapper>
  );
};

export default Fail;

const FailWrapper = styled.div`
  padding: 25px 10px;
  svg {
    width: 200px;
    height: 200px;
    path {
      fill: ${props => props.theme.colors.red};
    }
  }
  div, a, a:visited {
   color: ${props => props.theme.colors.red};
   font-size: 2rem;
   line-height: 1.5;
  }
  text-align: center;
`;

Fail.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.string,
};
