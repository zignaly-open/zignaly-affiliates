import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CancelIcon from '@material-ui/icons/Cancel';

const ImagePreview = ({ src, onDelete, width = '150px', height = '150px' }) => {
  return (
    <ImagePreviewWrapper width={width} height={height}>
      {onDelete && (
        <SvgWrap onClick={onDelete}>
          <CancelIcon />
        </SvgWrap>
      )}
      <a href={src} target="_blank" rel="noopener noreferrer">
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
    width: ${props => props.width};
    height: ${props => props.height};
    object-fit: cover;
    max-width: 100%;
  }

  svg {
    right: -11px;
    top: -11px;
    position: absolute;
    transition: all 0.2s;
    &:hover {
      transform: scale(1.2);
    }
    cursor: pointer;
    background: ${props => props.theme.colors.white};
    border-radius: 50%;
    path {
      fill: ${props => props.theme.colors.purple};
    }
  }

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
  src: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  onDelete: PropTypes.func,
};

export default ImagePreview;
