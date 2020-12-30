import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Digits = ({ value, prefix, suffix, ...other }) => (
  <NumberWrapper {...other}>
    {prefix || ''}
    {typeof value === 'string' ? value : Number(value).toLocaleString('en-US')}
    {suffix || ''}
  </NumberWrapper>
);

const NumberWrapper = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  text-align: right;
`;

Digits.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  suffix: PropTypes.string,
  prefix: PropTypes.string,
};

export default Digits;
