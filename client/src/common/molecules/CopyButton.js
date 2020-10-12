import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '../Button';

const CopyButton = ({ alertText, label, copyText }) => {
  const [open, setOpen] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(copyText);
    setOpen(true);
  }, [copyText, setOpen]);
  return (
    <>
      <Button secondary onClick={copy}>
        {label}
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          {alertText}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CopyButton;

CopyButton.propTypes = {
  alertText: PropTypes.string,
  copyText: PropTypes.string,
  label: PropTypes.string,
};
