import client from '@sendgrid/mail';
import {
  ENVIRONMENT,
  PROJECT_HOME_URL,
  SENDGRID_API_KEY,
  SENDGRID_CC_FOR_USER_EMAILS,
  SENDGRID_FROM_EMAIL,
  SENDGRID_FROM_NAME,
} from '../config';
import { logError } from './logger';

export const INTERVAL_BETWEEN_USERS_SENDING_EMAILS = 10 * 60000;

client.setApiKey(SENDGRID_API_KEY);

const send = payload => {
  if (ENVIRONMENT !== 'test') {
    return client.send({
      from: {
        name: SENDGRID_FROM_NAME,
        email: SENDGRID_FROM_EMAIL,
      },
      ...payload,
    });
  }
  return Promise.resolve();
};

export const sendPasswordReset = async ({ email, resetToken }) => {
  const link = `${PROJECT_HOME_URL}reset/${resetToken}`;
  try {
    await send({
      to: email,
      subject: 'Reset your password',
      html: getMessageBody(
        'Reset your password',
        `
        <p>You are receiving this email because a request was made to reset the password for your Zignaly account (<a href='mailto:${email}' target='_blank' rel='noopener'>${email}</a>).</p>
        <p>If you did not ask to reset your password, then you can ignore this email and your password will not be changed.</p>
        <p><strong>The link below will remain active for 15 minutes and expires when visited, so please be prepared to set your password when you use it.</strong></p>
        <p><a href='${link}'>${link}</a></p>
    `,
      ),
    });
  } catch (error) {
    logError(error.response.body);
  }
};

export const onCampaignDeleted = async ({ email, name }, campaign) => {
  try {
    await send({
      to: email,
      subject: `Campaign deleted: ${campaign.name}`,
      html: getMessageBody(
        `Campaign deleted: ${campaign.name}`,
        `
        <p>Hey ${name}, the campaign you were an active affiliate of has been deleted by the merchant</p>
        <p>Your referral link will not work anymore. All pending conversions will still be calculated though.</p>
    `,
      ),
    });
  } catch (error) {
    logError(error.response.body);
  }
};

const getMessageBody = (title, body) => `
    <h1>${title}</h1>
    ${body}
    <p/>
    <p/>
    <p>The Zignaly Team</p>
    <p><img src='https://affiliate.zignaly.com/logo.svg' alt='Zignaly' width='136' height='35' /></p>
`;

const escape = string =>
  String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const sendEmailFromAnotherUser = async ({ email, text, emailFrom }) => {
  try {
    // TODO: sendgrid templates
    const textPares = escape(text)
      .split('\n')
      .filter(x => x.trim());
    await send({
      to: email,
      bcc: SENDGRID_CC_FOR_USER_EMAILS,
      subject: 'Email from an affiliate',
      html: getMessageBody(
        'Email from an affiliate',
        `
        <p><a href="mailto:${emailFrom}">${emailFrom}</a> has sent you an email. Below is their message:</p>
        <p/>
        <p>${textPares.join('</p><p>')}</p>
    `,
      ),
    });
  } catch (error) {
    logError(error.response.body);
  }
};

export default send;
