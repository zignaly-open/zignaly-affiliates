import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Captcha from './Captcha';
import Button from '../atoms/Button';

export default {
  title: 'Molecules/Captcha',
  component: Captcha,
  argTypes: {
    onChange: { control: 'function' },
    apiCode: {
      control: 'string',
      description: 'Normally comes from process.env.REACT_APP_RECAPTCHA_KEY',
    },
    error: { control: 'object' },
  },
};

const Template = arguments_ => (
  <Captcha
    {...{ apiCode: '6LcJfdIZAAAAAB7djO6KlXUotW8v9ISF8O2CpSnp', ...arguments_ }}
  />
);
export const Primary = Template.bind({});

Primary.args = {};

const FormCaptchaTemplate = () => {
  const { handleSubmit, register, errors, setValue } = useForm();
  useEffect(() => {
    register({ name: 'captcha' }, { required: 'You must pass the challenge' });
  });

  return (
    <form
      onSubmit={handleSubmit(values =>
        // eslint-disable-next-line no-alert
        alert(`Submit ${JSON.stringify(values)}`),
      )}
    >
      <Captcha
        error={errors.captcha}
        onChange={token => setValue('captcha', token)}
        {...{ apiCode: '6LcJfdIZAAAAAB7djO6KlXUotW8v9ISF8O2CpSnp' }}
      />
      <Button primary type="submit">
        Submit
      </Button>
    </form>
  );
};

export const FormCaptcha = FormCaptchaTemplate.bind({});

FormCaptcha.args = {};
