import React from 'react';
import PropTypes from 'prop-types';
import FileCopy from '@material-ui/icons/FileCopy';
import { methodName } from '../../../common/atoms/Money';
import CopyButton from '../../../common/molecules/CopyButton';
import Code from '../../../common/atoms/Code';

const copyIconButtonStyle = {
  height: '1rem',
  position: 'relative',
  top: '3px',
};

const PaymentMethodCopyButton = ({ method, value, showCode = false }) => {
  return (
    <CopyButton
      key={method}
      hideButton={!showCode}
      wrapperProperties={{ style: { display: 'inline-block' } }}
      buttonProperties={{ secondary: true, link: true }}
      label={<FileCopy style={copyIconButtonStyle} />}
      copyText={value}
    >
      {methodName(method)}
      {showCode && ': '}
      {showCode && <Code small>{value}</Code>}
    </CopyButton>
  );
};

PaymentMethodCopyButton.propTypes = {
  method: PropTypes.string,
  showCode: PropTypes.bool,
  value: PropTypes.string,
};

export default PaymentMethodCopyButton;
