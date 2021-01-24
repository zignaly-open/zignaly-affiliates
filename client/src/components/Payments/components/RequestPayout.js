import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../common/atoms/Button';
import { appContext } from '../../../context/app';
import { paymentContext } from '../../../context/payments';

const RequestPayout = ({ campaignId }) => {
  const { api } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const { reloadPayments } = useContext(paymentContext);
  const request = useCallback(async () => {
    setLoading(true);
    await api.post(`payments/request/${campaignId}`);
    reloadPayments();
  }, [campaignId, api, reloadPayments]);

  if (loading) return <span>Requesting...</span>;

  return (
    <Button onClick={request} compact>
      Request Payout
    </Button>
  );
};

RequestPayout.propTypes = {
  campaignId: PropTypes.string,
};

export default RequestPayout;
