import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Title from '../atoms/Title';

const WallOfText = ({ title, text, id }) => (
  <Description id={id}>
    {!!title && <Title>{title}</Title>}

    {
      text
      .split('\n')
      .filter(x => x)
      .map((p, i) => <p key={Math.random()}>{p}</p>)
    }
  </Description>
);

WallOfText.propTypes = {
  id: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  text: PropTypes.string.isRequired,
};

const Description = styled.div``;

export default WallOfText;
