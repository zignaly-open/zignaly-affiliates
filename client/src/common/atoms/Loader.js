import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';

const Loader = ({ color }) => {
  return (
    <LoaderWrapper>
      <CircularProgress color={color || 'secondary'} />
    </LoaderWrapper>
  );
};

export default Loader;

const LoaderWrapper = styled.div`
  margin: 15px 0 20px;
  text-align: center;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

Loader.propTypes = {
  color: PropTypes.string,
};
