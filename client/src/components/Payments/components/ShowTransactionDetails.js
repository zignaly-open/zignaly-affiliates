import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import moment from 'moment';
import Button from '../../../common/atoms/Button';
import Muted from '../../../common/atoms/Muted';
import Code from '../../../common/atoms/Code';
import { methodName } from '../../../common/atoms/Money';

const ShowTransactionDetails = ({ note, paidAt, method, transactionId }) => {
  const [modalShown, setModalShown] = useState(false);

  return (
    <>
      <Button link success onClick={() => setModalShown(true)}>
        Paid. View details
      </Button>
      <Dialog
        open={modalShown}
        onClose={() => setModalShown(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          <Muted>Date</Muted>: {moment(paidAt).format('MMM Do YYYY hh:mm a')}
          <br />
          <Muted>Method</Muted>: {methodName(method) || <>&mdash;</>}
          <br />
          <Muted>Note</Muted>: {note || <>&mdash;</>}
          <br />
          <Muted>Transaction id</Muted>:{' '}
          {<Code>{transactionId}</Code> || <>&mdash;</>}
        </DialogContent>

        <DialogActions>
          <Button
            marginTop={8}
            onClick={() => setModalShown(false)}
            primary
            compact
            autoFocus
            type="submit"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ShowTransactionDetails.propTypes = {
  transactionId: PropTypes.string,
  note: PropTypes.string,
  method: PropTypes.string,
  paidAt: PropTypes.string,
};

export default ShowTransactionDetails;
