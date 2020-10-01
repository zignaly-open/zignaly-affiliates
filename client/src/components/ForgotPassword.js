import React, { useCallback, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import Content from '../common/Content';
import Input from '../common/Input';
import Button from '../common/Button';
import { appContext } from '../context/app';
import { EMAIL_REGEX } from '../util/form';
import Message from '../common/Message';

const ForgotPassword = () => {
  const { api } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { handleSubmit, register, errors, setError } = useForm({
    defaultValues: {
      email: 'strrife+q@gmail.com ',
    },
  });

  const onSubmit = useCallback(
    async values => {
      setLoading(true);
      try {
        await api.post('user/request-reset', values);
        setResetDone(true);
      } catch {
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
