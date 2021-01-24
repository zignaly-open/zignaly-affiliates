import React from 'react';

import ImagePreview from './ImagePreview';

export default {
  title: 'Atoms/ImagePreview',
  component: ImagePreview,
  argTypes: {
    src: { control: 'url', description: 'Image src' },
    width: { control: 'string' },
    height: { control: 'string' },
    onDelete: { control: 'function' },
  },
};

const Template = arguments_ => <ImagePreview {...arguments_} />;

export const Primary = Template.bind({});

Primary.args = {
  src:
    'https://i.pinimg.com/236x/74/a9/20/74a9202f83e6bee830e1a963c7021534.jpg',
  width: '100px',
  height: '100px',
  onDelete: () => {
    alert(
      "You have a heart of stone if you dared to delete Yui. Fortunately, I won't let that happen.",
    );
  },
};
