import React, { useCallback, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import Content from '../common/Content';
import Input from '../common/Input';
import Button from '../common/Button';
import { appContext } from '../context/app';
import { EMAIL_REGEX } from '../util/form';

const Login = () => {
  const { api, setToken, setUser } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, errors, setError } = useForm({
    defaultValues: {
      mailingList: true,
    },
  });

  const onSubmit = useCallback(
    async values => {
      setLoading(true);
      try {
        const { token, user } = await api.post('user/auth', values);
        setUser(user);
        setToken(token);
      } catch {
        setError('email', {});
        setError('password', {
          type: 'manual',
          message: 'Invalid username or password',
        });
        setLoading(false);
      }
    },
    [api, setError, setToken, setUser],
  );

  return (
    <Content title="Log in" hideHr>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
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

        <Input
          type="password"
          name="password"
          placeholder="Super strong password"
          title="Password"
          error={errors.password}
          useRef={register({
            required: 'Required',
          })}
        />

        <Button primary type="submit" isLoading={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </Content>
  );
};

export default Login;
