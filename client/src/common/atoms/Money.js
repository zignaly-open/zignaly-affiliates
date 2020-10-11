import React from 'react';
import PropTypes from 'prop-types';
import Digits from './Digits';

const Money = ({ value }) => <Digits style={{ fontWeight: 500 }} value={value} prefix="$" />;

Money.propTypes = {
  value: PropTypes.number,
};

export default Money;
