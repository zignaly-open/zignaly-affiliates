import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import Button from '../../../common/atoms/Button';
import { appContext } from '../../../context/app';
import { paymentContext } from '../../../context/payments';
import { ErrorText } from '../../../common/molecules/Input';

const CreateMerchantPayoutButton = ({ campaign, affiliate }) => {
  const { api } = useContext(appContext);
  const { reloadPayments } = useContext(paymentContext);
  const [{ loading, error }, requestPayout] = useAsyncFn(
    () =>
      api
        .post(`payments/merchant-payout/${campaign._id}/${affiliate._id}`)
        .then(reloadPayments),
    [api, campaign, affiliate],
  );

  return error ? (
    <ErrorText>Something went wrong</ErrorText>
  ) : (
    <Button disabled={loading} compact link onClick={requestPayout}>
      {loading ? 'Loading...' : 'Create payout'}
    </Button>
  );
};

CreateMerchantPayoutButton.propTypes = {
  campaign: PropTypes.object,
  affiliate: PropTypes.object,
};

export default CreateMerchantPayoutButton;
