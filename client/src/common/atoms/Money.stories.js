import React from 'react';

import Money from './Money';

export default {
  title: 'Atoms/Money',
  component: Money,
  argTypes: {
    value: {
      control: 'number',
      description: 'Amount in cents, just like all amounts in the app are',
    },
  },
};

const Template = arguments_ => <Money {...arguments_} />;

export const Primary = Template.bind({});

Primary.args = {
  value: 500,
};
