import client from '@sendgrid/mail';
import {
  ENVIRONMENT,
  PROJECT_HOME_URL,
  SENDGRID_API_KEY, SENDGRID_CC_FOR_USER_EMAILS,
  SENDGRID_FROM_EMAIL,
} from '../config';
import { logError } from './logger';

export const INTERVAL_BETWEEN_USERS_SENDING_EMAILS = 10 * 60000;

client.setApiKey(SENDGRID_API_KEY);

const send = payload => {
  if (ENVIRONMENT !== 'test') {
    return client.send(payload);
  }
  return Promise.resolve();
};

export const sendPasswordReset = async ({ email, resetToken }) => {
  const link = `${PROJECT_HOME_URL}reset/${resetToken}`;
  try {
    // TODO: sendgrid templates
    await send({
      to: email,
      from: SENDGRID_FROM_EMAIL,
      subject: 'Reset your password',
      html: `
        <h1>Reset your password</h1>
        <p>You are receiving this email because a request was made to reset the password for your Zignaly account (<a href='mailto:${email}' target='_blank' rel='noopener'>${email}</a>).</p>
        <p>If you did not ask to reset your password, then you can ignore this email and your password will not be changed.</p>
        <p><strong>The link below will remain active for 15 minutes and expires when visited, so please be prepared to set your password when you use it.</strong></p>
        <p><a href='${link}'>${link}</a></p>
        <p></p>
        <p>The Zignaly Team</p>
        <p><img src='https://zignaly.com/images/logo-w.png' alt='Zignaly' width='114' height='27' /></p>
    `,
    });
  } catch (error) {
    logError(error.response.body);
  }
};

const escape = str => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');;

export const sendEmailFromAnotherUser = async ({ email, text, emailFrom }) => {
  try {
    // TODO: sendgrid templates
    await send({
      to: email,
      bcc: SENDGRID_CC_FOR_USER_EMAILS,
      from: SENDGRID_FROM_EMAIL,
      subject: 'Email from an affiliate',
      html: `
        <h1>Email from an affiliate</h1>
        <p><a href="mailto:${emailFrom}">${emailFrom}</a> has sent you an email. Below is their message:</p>
        <p/>
        <p>${escape(text).split('\n').filter(x => x.trim()).join('</p><p>')}</p>
        <p/>
        <p/>
        <p>The Zignaly Team</p>
        <p><img src='https://zignaly.com/images/logo-w.png' alt='Zignaly' width='114' height='27' /></p>
    `,
    });
  } catch (error) {
    logError(error.response.body);
  }
};

export default send;
