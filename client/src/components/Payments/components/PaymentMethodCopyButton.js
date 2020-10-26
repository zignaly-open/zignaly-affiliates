import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {methodName} from "../../../common/atoms/Money";
import CopyButton from "../../../common/molecules/CopyButton";
import FileCopy from "@material-ui/icons/FileCopy";
import Code from "../../../common/atoms/Code";

const copyIconButtonStyle = {
  height: '1rem',
  position: 'relative',
  top: '3px'
};

const PaymentMethodCopyButton = ({ method, value }) => {
  return (
    <div key={method}>
      {methodName(method)}: <Code>{value}</Code>
      <CopyButton buttonProperties={{ secondary: true, link: true, }}
                  label={<FileCopy style={copyIconButtonStyle} />} copyText={value} />
    </div>
  );
};

PaymentMethodCopyButton.propTypes = {
  method: PropTypes.string,
  value: PropTypes.string,
};

export default PaymentMethodCopyButton;

const Bold = styled.span``
