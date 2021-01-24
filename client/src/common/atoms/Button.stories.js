import React from 'react';
import Button from './Button';

export default {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    children: {control: 'element'},
    onClick: {control: 'function'},
    marginTop: {control: 'number'},
    fullWidthOnMobile: {control: 'boolean'},
    isLoading: {control: 'boolean'},
    primary: {control: 'boolean'},
    link: {control: 'boolean'},
    withIcon: {control: 'boolean'},
    compact: {control: 'boolean'},
    danger: {control: 'boolean'},
    success: {control: 'boolean'},
    minWidth: {control: 'number'},
    small: {control: 'boolean'},
  },
};

const Template = arguments_ => <Button {...arguments_} />;

export const Primary = Template.bind({});

Primary.args = {
  children: 'Click me',
  onClick: () => alert('Clicked')
};

const SurroundedTemplate = arguments_ => {
  return (
    <>
      You are surrounded
      {' '}
      <Button {...arguments_} />
      {' '}
      You are surrounded
    </>
  )
}

export const Link = SurroundedTemplate.bind({});

Link.args = {
  children: 'Click me',
  onClick: () => alert('Clicked'),
  link: true
};
