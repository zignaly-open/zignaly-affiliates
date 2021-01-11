import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { Controller, useForm } from 'react-hook-form';
import Button from '../../../common/Button';
import Input from '../../../common/molecules/Input';
import {
  BTC_TXID_REGEX,
  ERC20_TXID_REGEX,
  PAYPAL_TXID_REGEX,
  setFormErrors,
} from '../../../util/form';
import { appContext } from '../../../context/app';
import Loader from '../../../common/Loader';
import { paymentContext } from '../../../context/payments';
import Select from '../../../common/molecules/Select';
import { methodName } from '../../../common/atoms/Money';
import PaymentMethodCopyButton from "./PaymentMethodCopyButton";

const EnterTransactionId = ({
  shown,
  affiliate: { paymentCredentials },
  cancelAction,
  requestId,
}) => {
  const {
    handleSubmit,
    register,
    errors,
    setError,
    control,
    watch,
  } = useForm();
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
            ERC20_TXID_REGEX.test(value) || 'Invalid ERC-20 transaction hash'
          );
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
      <form onSubmit={handleSubmit(submit)}>
        <DialogTitle>Submit Payment</DialogTitle>
        <DialogContent>

          <DialogContentText>
            Affiliate payment credentials:
          </DialogContentText>

          {Object.entries(paymentCredentials)
            .filter(([, value]) => value)
            .map(([method, value], i) => (
                <p key={method}>
                  <PaymentMethodCopyButton
                    showCode={true}
                    method={method}
                    value={value}
                  />
                </p>
            ))}

          <DialogContentText>
            Please enter the transactionId for the payment method you have used
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
                    error={errors.code}
                    title="Discount Code"
                  />
                }
                name="method"
                title="Method"
                control={control}
                defaultValue={options[0].value}
              />

              <Input
                type="text"
                name="transactionId"
                isRequired
                title="Transaction ID"
                placeholder="Transaction ID"
                error={errors.transactionId}
                useRef={register({
                  required: 'This field is required',
                  validate: validateTransactionId,
                })}
              />

              <Input
                type="textarea"
                name="note"
                title="Note"
                placeholder="Not required"
                useRef={register()}
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
      </form>
    </Dialog>
  );
};

EnterTransactionId.propTypes = {
  shown: PropTypes.bool,
  cancelAction: PropTypes.func,
  requestId: PropTypes.string,
  affiliate: PropTypes.object,
};

export default EnterTransactionId;
