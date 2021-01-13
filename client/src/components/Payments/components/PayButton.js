import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../common/Button';
import EnterTransactionId from './EnterTransactionId';

const PayButton = ({ requestId, amount, affiliate }) => {
  const [shown, setShown] = useState(false);

  return (
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
  );
};

PayButton.propTypes = {
  requestId: PropTypes.string,
  affiliate: PropTypes.object,
};

export default PayButton;
