import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../common/Button';
import { appContext } from '../../../context/app';
import { paymentContext } from '../../../context/payments';
import EnterTransactionId from "./EnterTransactionId";

const PayButton = ({ requestId, affiliate }) => {
  const { api } = useContext(appContext);
  const [shown, setShown] = useState(true);
  const [loading, setLoading] = useState(false);
  const { reloadPayments } = useContext(paymentContext);
  const pay = useCallback(async () => {
    setLoading(true);
    await api.post(`payments/pay/${requestId}`);
    reloadPayments();
  }, [requestId, api, reloadPayments]);

  if (loading) return <span>Paying...</span>;

  return (
    <>
      <EnterTransactionId cancelAction={() => setShown(false)} shown={shown} />

      <Button minWidth={80} onClick={() => setShown(true)} compact>
        Pay
      </Button>
    </>
  );
};

PayButton.propTypes = {
  campaignId: PropTypes.string,
};

export default PayButton;
