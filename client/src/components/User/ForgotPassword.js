import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Content from '../../common/Content';
import Input from '../../common/molecules/Input';
import Button from '../../common/Button';
import { appContext } from '../../context/app';
import { EMAIL_REGEX, setFormErrors } from '../../util/form';
import Message from '../../common/atoms/Message';
import Captcha, { resetCaptchas } from '../../common/Captcha';

const ForgotPassword = () => {
  const { api } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { handleSubmit, register, errors, setError, setValue } = useForm();
  useEffect(() => {
    register({ name: 'captcha' }, { required: 'You must pass the challenge' });
  });

  const onSubmit = useCallback(
    async values => {
      setLoading(true);
      try {
        await api.post('user/request-reset', values);
        setResetDone(true);
      } catch (error) {
        resetCaptchas();
        setFormErrors(error, setError);
        setError('email', {
          type: 'manual',
          message: 'Email not registered',
        });
      }
      setLoading(false);
    },
    [api, setError],
  );

  return (
    <Content title="Reset password" hideHr>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          disabled={resetDone}
          type="email"
          name="email"
          placeholder="Your email address"
          title="Email"
          error={errors.email}
          useRef={register({
            required: 'Required',
            pattern: {
              value: EMAIL_REGEX,
              message: 'Invalid email address',
            },
          })}
        />

        <Captcha
          error={errors.captcha}
          onChange={token => setValue('captcha', token)}
        />

        {resetDone ? (
          <Message success>Check your email for the instructions</Message>
        ) : (
          <Button
            primary
            type="submit"
            disabled={resetDone}
            isLoading={loading}
          >
            {loading ? 'Doing magic...' : 'Reset'}
          </Button>
        )}
      </form>
    </Content>
  );
};

export default ForgotPassword;
