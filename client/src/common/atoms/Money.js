import React from 'react';
import PropTypes from 'prop-types';
import Digits from './Digits';

const Money = ({ value }) => (
  <Digits
    style={{ fontWeight: 500 }}
    value={Number(value).toFixed(2)}
    prefix="$"
  />
);

Money.propTypes = {
  value: PropTypes.number,
};

export const methodName = method => ({ paypal: 'PayPal', usdt: 'USDT', bitcoin: 'BTC' }[method] || method);

export const formatSupportedMethods = merchant => {
  const methods = Object.entries(merchant.paymentMethodSupport)
    .filter(([_, v]) => v) // eslint-disable-line no-unused-vars
    .map(([k]) => methodName(k));
  return [methods.slice(1).join(', '), methods[0]].filter(x => x).join(' or ');
};

export default Money;
