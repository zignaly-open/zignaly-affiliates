import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CancelIcon from '@material-ui/icons/Cancel';

const ImagePreview = ({ src, onDelete }) => {
  return (
    <ImagePreviewWrapper>
      <SvgWrap onClick={onDelete}>
        <CancelIcon />
      </SvgWrap>
      <a href={src} target="_blank" rel="noreferrer">
        <img src={src} alt="" />
      </a>
    </ImagePreviewWrapper>
  );
};

const ImagePreviewWrapper = styled.div`
  display: inline-block;
  margin: 0 20px 20px 0;
  position: relative;

  a,
  a img {
    width: 150px;
    height: 150px;
    object-fit: cover;
  }

  svg {
    right: -5px;
    top: -5px;
    position: absolute;
    right: -11px;
    top: -11px;
    position: absolute;
    transition: all 0.2s;
    &:hover {
      transform: scale(1.2);
    }
    cursor: pointer;
    background: #fff;
    border-radius: 50%;
    path {
      fill: ${props => props.theme.colors.purple};
    }
  }

  margin: 0 20px 20px 0;

  a {
    border: 2px solid ${props => props.theme.colors.purple};
    display: inline-block;
    padding: 3px;
    border-radius: 2px;

    transition: all 0.2s;
    &:hover {
      background: ${props => props.theme.colors.purple};
    }
  }
`;

const SvgWrap = styled.span``;

ImagePreview.propTypes = {
  src: PropTypes.string,
  onDelete: PropTypes.func,
};

export default ImagePreview;
