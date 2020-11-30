import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import * as clipboard from 'clipboard-polyfill/text';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '../Button';

const CopyButton = ({
  alertText = 'Copied',
  label = 'Copy',
  buttonProperties = { secondary: true },
  copyText,
}) => {
  const [open, setOpen] = useState(false);
  const copy = useCallback(async () => {
    await clipboard.writeText(copyText);
    setOpen(true);
  }, [copyText, setOpen]);
  return (
    <>
      <Button {...buttonProperties} onClick={copy}>
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
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  buttonProperties: PropTypes.object,
  copyText: PropTypes.string.isRequired,
  alertText: PropTypes.string,
};
