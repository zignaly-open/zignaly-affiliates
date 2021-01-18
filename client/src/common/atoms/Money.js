import React from 'react';
import PropTypes from 'prop-types';
import Digits from './Digits';

const Money = ({ value, cents = true }) => (
  <Digits
    style={{ fontWeight: 500 }}
    value={Number(Math.abs(value) / (cents ? 100 : 1)).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}
    prefix={<>{value < 0 ? <>&ndash;</> : ''}$</>}
  />
);

Money.propTypes = {
  value: PropTypes.number,
  cents: PropTypes.bool,
};

export const methodName = method =>
  ({ paypal: 'PayPal', usdt: 'USDT', bitcoin: 'BTC' }[method] || method);

export const formatSupportedMethods = merchant => {
  const methods = Object.entries(merchant.paymentMethodSupport)
    .filter(([_, v]) => v) // eslint-disable-line no-unused-vars
    .map(([k]) => methodName(k));
  return [methods.slice(1).join(', '), methods[0]].filter(x => x).join(' or ');
};

export default Money;
