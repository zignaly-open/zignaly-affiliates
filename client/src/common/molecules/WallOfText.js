import PropTypes from 'prop-types';
import React from 'react';
import Title from "../atoms/Title";
import styled from "styled-components";

const WallOfText = ({
  title, text, id
}) => (
  <Description id={id}>
    <Title>{title}</Title>
    {/* eslint-disable-next-line react/no-array-index-key */}
    {text.split('\n').filter(x => x).map((p, i) => <p key={i}>{p}</p>)}
  </Description>
);

WallOfText.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

const Description = styled.div``;

export default WallOfText;
