import React from 'react';
import styled from 'styled-components';
import ReCAPTCHA from 'react-google-recaptcha';
import PropTypes from 'prop-types';
import { ErrorText } from './molecules/Input';

const Captcha = ({ onChange, error }) => (
  <CaptchaWrapper>
    <ReCAPTCHA
      size="normal"
      sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
      onChange={onChange}
    />
    {error && error.message && <ErrorText>{error.message}</ErrorText>}
  </CaptchaWrapper>
);

export const resetCaptchas = () => window.grecaptcha.reset();

export default Captcha;

const CaptchaWrapper = styled.div`
  margin: 15px 0 20px;
`;

Captcha.propTypes = {
  onChange: PropTypes.func,
  error: PropTypes.object,
};
