import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Title from '../atoms/Title';

const WallOfText = ({ title, text, id }) => (
  <Description id={id}>
    <Title>{title}</Title>

    {text
      .split('\n')
      .filter(x => x)
      .map((p, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <p key={i}>{p}</p>
      ))}
  </Description>
);

WallOfText.propTypes = {
  id: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  text: PropTypes.string.isRequired,
};

const Description = styled.div``;

export default WallOfText;
