import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import styled from 'styled-components';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Controller, useForm } from 'react-hook-form';
import Button from '../../../common/atoms/Button';
import Input from '../../../common/molecules/Input';
import {
  BTC_TXID_REGEX,
  TETHER_TXID_REGEX,
  PAYPAL_TXID_REGEX,
  setFormErrors,
  TRX_TXID_REGEX,
} from '../../../util/form';
import { appContext } from '../../../contexts/app';
import Loader from '../../../common/atoms/Loader';
import { paymentContext } from '../../../contexts/payments';
import Select from '../../../common/molecules/Select';
import Money, { methodName } from '../../../common/atoms/Money';
import PaymentMethodCopyButton from './PaymentMethodCopyButton';

const EnterTransactionId = ({
  shown,
  affiliate: { paymentCredentials },
  cancelAction,
  amount,
  requestId,
}) => {
  const { handleSubmit, register, errors, setError, control, watch } = useForm({
    mode: 'onBlur',
  });

  const { reloadPayments } = useContext(paymentContext);
  const { api } = useContext(appContext);
  const [submitting, setSubmitting] = useState(false);

  const options = useMemo(
    () =>
      Object.entries(paymentCredentials)
        .filter(([, value]) => value)
        .map(([method]) => ({ value: method, label: methodName(method) })),
    [paymentCredentials],
  );

  const submit = async formValues => {
    setSubmitting(true);
    try {
      await api.post(`payments/payout/${requestId}`, formValues);
      reloadPayments();
    } catch (error) {
      setFormErrors(error, setError);
      setSubmitting(false);
    }
  };

  const selectedMethod = watch('method');
  const validateTransactionId = useCallback(
    value => {
      switch (selectedMethod) {
        case 'bitcoin':
          return (
            BTC_TXID_REGEX.test(value) || 'Invalid bitcoin transaction hash'
          );
        case 'usdt':
          return (
            TETHER_TXID_REGEX.test(value) || 'Invalid ERC20 transaction hash'
          );
        case 'trxusdt':
          return TRX_TXID_REGEX.test(value) || 'Invalid TRC20 transaction hash';
        case 'paypal':
          return (
            PAYPAL_TXID_REGEX.test(value) || 'Invalid PayPal transaction id'
          );
        default:
          return true;
      }
    },
    [selectedMethod],
  );

  return (
    <Dialog
      open={shown}
      onClose={cancelAction}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <StyledForm onSubmit={handleSubmit(submit)}>
        <DialogTitle>
          Submit Payment - <Money value={amount} />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Affiliate payment credentials:</DialogContentText>

          {Object.entries(paymentCredentials)
            .filter(([, value]) => value)
            .map(([method, value]) => (
              <p key={method}>
                <PaymentMethodCopyButton
                  showCode
                  method={method}
                  value={value}
                />
              </p>
            ))}

          <DialogContentText>
            Please pay directly via your PayPal or Crypto Wallet, depending on
            Affiliate payment method preferences. Once the payment is made,
            please paste the transaction ID below.
          </DialogContentText>

          <br />

          {submitting ? (
            <Loader />
          ) : (
            <>
              <Controller
                as={
                  <Select
                    style={{ marginBottom: '24px' }}
                    options={options}
                    error={errors.method}
                    title="Method"
                  />
                }
                name="method"
                title="Method"
                control={control}
                defaultValue={options[0]?.value}
              />

              <Input
                type="text"
                name="transactionId"
                isRequired
                title="Transaction ID"
                placeholder="Transaction ID"
                error={errors.transactionId}
                ref={register({
                  required: 'This field is required',
                  validate: validateTransactionId,
                })}
              />

              <Input
                type="textarea"
                name="note"
                title="Note"
                placeholder="Not required"
                ref={register()}
              />
            </>
          )}
        </DialogContent>

        <DialogActions
          style={{
            flexWrap: 'wrap',
          }}
        >
          <Button
            loading={submitting}
            marginTop={8}
            onClick={handleSubmit(submit)}
            primary
            compact
            autoFocus
            type="submit"
          >
            Submit
          </Button>
          <Button
            disabled={submitting}
            marginTop={8}
            onClick={cancelAction}
            color="primary"
            compact
          >
            Cancel
          </Button>
        </DialogActions>
      </StyledForm>
    </Dialog>
  );
};

const StyledForm = styled.form`
  label {
    max-width: 400px;
  }
`;

EnterTransactionId.propTypes = {
  shown: PropTypes.bool,
  cancelAction: PropTypes.func,
  amount: PropTypes.number,
  requestId: PropTypes.string,
  affiliate: PropTypes.object,
};

export default EnterTransactionId;
