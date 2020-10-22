import React from 'react';
import PropTypes from 'prop-types';
import Code from '../atoms/Code';
import {
  DISCOUNT_CODE_EXTRA_LIFE,
  DISCOUNT_CODE_FIXED_AMOUNT,
  DISCOUNT_CODE_PERCENT,
} from '../../util/constants';
import Money from '../atoms/Money';
import Digits from '../atoms/Digits';

const DiscountCode = ({ code: { value, code, type } }) => {
  return (
    <>
      <Code>{code}</Code> for{' '}
      {type === DISCOUNT_CODE_EXTRA_LIFE && (
        <>
          <Digits style={{ fontWeight: 500 }} value={value} /> extra day
          {value === 1 ? '' : 's'}
        </>
      )}
      {type === DISCOUNT_CODE_PERCENT && (
        <>
          <Digits style={{ fontWeight: 500 }} suffix="%" value={value} /> off
        </>
      )}
      {type === DISCOUNT_CODE_FIXED_AMOUNT && (
        <>
          <Money value={value} /> off
        </>
      )}
    </>
  );
};

export default DiscountCode;

DiscountCode.propTypes = {
  code: PropTypes.object.isRequired,
};
