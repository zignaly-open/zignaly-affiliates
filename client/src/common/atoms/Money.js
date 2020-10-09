import React from 'react';
import PropTypes from 'prop-types';
import Digits from './Digits';

const Money = ({ value }) => <Digits value={value} prefix="$" />;

Money.propTypes = {
  value: PropTypes.number,
};

export default Money;
