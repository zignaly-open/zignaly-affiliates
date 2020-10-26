import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import PropTypes from 'prop-types';
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Button from "../../../common/Button";
import {useForm} from "react-hook-form";
import Input from "../../../common/molecules/Input";

const EnterTransactionId = ({
                              shown,
                              cancelAction,
                              okAction,
                            }) => {
  const { handleSubmit, register, errors, setError, setValue } = useForm();
  const submit = () => {};
  return (
    <Dialog
      open={shown}
      onClose={cancelAction}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <form>
      <DialogTitle>Transaction Id</DialogTitle>

      <DialogContent>
        <DialogContentText>Please enter the transactionId for the payment method you have used</DialogContentText>
        <br />
        <Input title="Bitcoin txid" name={"bitcoin"} type="text" ref={register()} />
        <Input title="Paypal transaction id" name={"paypal"} type="text" ref={register()} />
        <Input title="USDT transaction id" name={"usdt"} type="text" ref={register()} />
      </DialogContent>
      <DialogActions
        style={{
          flexWrap: 'wrap',
        }}
      >
        <Button marginTop={8} onClick={handleSubmit(submit)} primary compact autoFocus>
          Submit
        </Button>
        <Button marginTop={8} onClick={cancelAction} color="primary" compact>
          Cancel
        </Button>
      </DialogActions>
      </form>
    </Dialog>
  );
};

EnterTransactionId.propTypes = {
  shown: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  cancelText: PropTypes.string,
  cancelAction: PropTypes.func,
  okText: PropTypes.string,
  okAction: PropTypes.func,
};

export default EnterTransactionId;
