import React from 'react';

import WallOfText from './WallOfText';

export default {
  title: 'Molecules/WallOfText',
  component: WallOfText,
  argTypes: {
    text: { control: 'string' },
    id: { control: 'string' },
    title: { control: 'node', description: 'String or React element' },
  },
};

const Template = arguments_ => <WallOfText {...arguments_} />;

export const Primary = Template.bind({});

Primary.args = {
  text:
    'Are we yet another outsourcing agency? Not quite right.\n\n' +
    'Here at XFuturum we love working with startups and we know how to work with startups (pre-Seed, Seed, Series A).',
  id: 'xft',
  title: 'Title',
};

export const NoTitle = Template.bind({});

NoTitle.args = {
  text:
    'Are we yet another outsourcing agency? Not quite right.\n\n' +
    'Here at XFuturum we love working with startups and we know how to work with startups (pre-Seed, Seed, Series A).',
};
