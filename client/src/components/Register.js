import React from 'react';
import { useForm } from "react-hook-form";
import Content from "../common/Content";
import Input from "../common/Input";
import {Link} from "react-router-dom";
import Button from "../common/Button";

const Register = () => {
  const { handleSubmit, register, errors, watch } = useForm({
    defaultValues: {
      mailingList: true
    }
  });
  const onSubmit = values => console.log(values);
  return (
    <Content title="Sign up" hideHr>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          name="name"
          placeholder="Your name"
          title="Name"
          error={errors.name}
          useRef={register({
            required: "Required"
          })}
        />

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

        <Input
          type="password"
          name="repeatPassword"
          placeholder="Repeat password"
          title="Repeat password"
          error={errors.repeatPassword}
          useRef={register({
            validate: (value) => value === watch('password') || 'Passwords do not match'
          })}
        />

        <Input
          type="checkbox"
          name="tos"
          title={<span>Accept <Link to="/tos">terms and services</Link></span>}
          error={errors.tos}
          useRef={register({
            required: "Required"
          })}
        />

        <Input
          type="checkbox"
          name="mailingList"
          title="Accept promotional materials"
          useRef={register({})}
        />


        <Button primary type="submit">Submit</Button>
      </form>
    </Content>
  );
};

export default Register;
