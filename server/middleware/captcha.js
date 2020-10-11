import superagent from 'superagent';
import {ENVIRONMENT, RECAPTCHA_SERVER_KEY} from "../config";

const withRecaptcha = async (req, res, next) => {
  if(ENVIRONMENT === 'test') {
    next();
    return;
  }
  const { body: { success: isHuman } } = await superagent.post(`https://www.google.com/recaptcha/api/siteverify`)
    .set('accept', 'json')
    .send(`secret=${RECAPTCHA_SERVER_KEY}&response=${req.body.captcha}`)
  if(isHuman) next(); else {
    res.status(400).json({ errors: { captcha: 'Captcha invalid or expired' } })
  }
};

export default withRecaptcha;
