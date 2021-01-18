import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import Button from '../../../common/Button';
import { appContext } from '../../../context/app';
import { paymentContext } from '../../../context/payments';
import { ErrorText } from '../../../common/molecules/Input';
import Confirm from '../../../common/molecules/Confirm';

const DisputeChainButton = ({ chain }) => {
  const { api } = useContext(appContext);
  const { reloadPayments } = useContext(paymentContext);
  const [shown, setShown] = useState(false);
  const [{ loading, error }, dispute] = useAsyncFn(
    () =>
      api
        .post(`payments/chain/dispute/${chain}`, { text: '' })
        .then(reloadPayments),
    [],
  );

  return error ? (
    <ErrorText>Something went wrong</ErrorText>
  ) : (
    <>
      <Confirm
        shown={!!shown}
        title="Disapprove Chain"
        description="If you think this conversion is not valid, you can disapprove it. Note that re-approving it require support intervention"
        cancelAction={() => setShown(false)}
        okAction={dispute}
      />

      <Button
        disabled={loading}
        compact
        small
        link
        onClick={() => setShown(true)}
      >
        {loading ? 'Loading...' : 'Disapprove?'}
      </Button>
    </>
  );
};

DisputeChainButton.propTypes = {
  chain: PropTypes.string,
};

export default DisputeChainButton;
