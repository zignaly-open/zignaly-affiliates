import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import PropTypes from 'prop-types';
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Button from '../Button';

const Confirm = ({
  shown,
  title,
  description,
  cancelText = 'Cancel',
  cancelAction,
  okText = 'Confirm',
  okAction,
}) => (
  <Dialog
    open={shown}
    onClose={cancelAction}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={cancelAction} color="primary">
        {cancelText}
      </Button>
      <Button onClick={okAction} color="primary" autoFocus>
        {okText}
      </Button>
    </DialogActions>
  </Dialog>
);

Confirm.propTypes = {
  shown: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  cancelText: PropTypes.string,
  cancelAction: PropTypes.func,
  okText: PropTypes.string,
  okAction: PropTypes.func,
};

export default Confirm;
