import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Digits = ({ value, prefix, suffix }) => (
  <NumberWrapper>
    {prefix || ''}
    {Number(value).toLocaleString()}
    {suffix || ''}
  </NumberWrapper>
);

const NumberWrapper = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  text-align: right;
`;

Digits.propTypes = {
  value: PropTypes.number,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
};

export default Digits;
