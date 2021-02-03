import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../common/atoms/Button';
import EnterTransactionId from './EnterTransactionId';
import { NotEnough } from '../../../common/organisms/Table/common';

const PayButton = ({ requestId, amount, affiliate }) => {
  const [shown, setShown] = useState(false);
  const hasPaymentMethods =
    Object.keys(affiliate.paymentCredentials).length > 0;

  return hasPaymentMethods ? (
    <>
      <EnterTransactionId
        requestId={requestId}
        amount={amount}
        affiliate={affiliate}
        cancelAction={() => setShown(false)}
        shown={shown}
      />

      <Button minWidth={80} onClick={() => setShown(true)} compact>
        Pay
      </Button>
    </>
  ) : (
    <NotEnough>Affiliate has no payment credentials</NotEnough>
  );
};

PayButton.propTypes = {
  requestId: PropTypes.string,
  affiliate: PropTypes.object,
  amount: PropTypes.number,
};

export default PayButton;
