import React from 'react';

import Code from './Code';

export default {
  title: 'Atoms/Code',
  component: Code,
  argTypes: {
    children: { control: 'text' },
  },
};

const Template = arguments_ => <Code {...arguments_} />;

export const Primary = Template.bind({});

Primary.args = {
  children: 500,
};
