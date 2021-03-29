import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import * as clipboard from 'clipboard-polyfill/text';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '../atoms/Button';

const CopyButton = ({
  alertText = 'Copied',
  label = 'Copy',
  hideButton = false,
  buttonProperties = { secondary: true },
  wrapperProperties = {},
  copyText,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const copy = useCallback(
    async e => {
      e.preventDefault();
      e.stopPropagation();
      await clipboard.writeText(copyText);
      setOpen(true);
    },
    [copyText, setOpen],
  );
  return (
    <span
      data-tootik="Click to copy to clipboard"
      onClick={copy}
      role="button"
      tabIndex="-1"
      onKeyPress={copy}
      {...wrapperProperties}
    >
      {children}
      {!hideButton && <Button {...buttonProperties}>{label}</Button>}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          {alertText}
        </Alert>
      </Snackbar>
    </span>
  );
};

export default CopyButton;

CopyButton.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  buttonProperties: PropTypes.object,
  wrapperProperties: PropTypes.object,
  hideButton: PropTypes.bool,
  copyText: PropTypes.string.isRequired,
  alertText: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
