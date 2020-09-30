import React from 'react';
import { useForm } from "react-hook-form";
import Content from "../common/Content";
import Input from "../common/Input";
import {Link} from "react-router-dom";
import Button from "../common/Button";

const Login = () => {
  const { handleSubmit, register, errors, watch } = useForm({
    defaultValues: {
      mailingList: true
    }
  });
  const onSubmit = values => console.log(values);
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
            required: "Required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          })}
        />

        <Input
          type="password"
          name="password"
          placeholder="Super strong password"
          title="Password"
          error={errors.password}
          useRef={register({
            required: "Required",
            pattern: {
              value: /^(?=.*[a-z])(?=.*[^a-z]).{8,}$/i,
              message: "Your password should contain letters and special characters or digits & 8 characters min"
            }
          })}
        />

        <Button primary type="submit">Submit</Button>
      </form>
    </Content>
  );
};

export default Login;
