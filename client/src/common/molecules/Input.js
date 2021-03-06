import React from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const Input = React.forwardRef(
  (
    {
      error,
      inline,
      hidden,
      title,
      description,
      putTitleAfter,
      isRequired,
      ...rest
    },
    useReference,
  ) => {
    const { type } = rest;
    const isTitleAfter =
      typeof putTitleAfter !== 'undefined'
        ? putTitleAfter
        : ['radio', 'checkbox'].includes(type);
    return (
      <InputWrapper
        isInline={inline}
        isHidden={hidden}
        className={classNames({
          'has-error': !!error,
        })}
      >
        {!!title && !isTitleAfter && (
          <InputTitle isRequired={isRequired} block>
            {title}
          </InputTitle>
        )}
        {!!description && <InputDescription>{description}</InputDescription>}
        {type === 'textarea' ? (
          <textarea
            {...rest}
            {...(useReference ? { ref: useReference } : {})}
          />
        ) : (
          <input {...rest} {...(useReference ? { ref: useReference } : {})} />
        )}

        {/* Hack for the checkbox */}
        {type === 'checkbox' && <CheckIcon style={{ display: 'none' }} />}
        {type === 'radio' && (
          <FiberManualRecordIcon style={{ display: 'none' }} />
        )}
        {!!title && isTitleAfter && <InputTitle>{title}</InputTitle>}
        {error && error.message && <ErrorText>{error.message}</ErrorText>}
      </InputWrapper>
    );
  },
);

export default Input;

const InputWrapper = styled.label`
  display: ${props =>
    props.isHidden ? 'none' : props.isInline ? 'inline-block' : 'block'};
  margin-right: ${props => (props.isInline ? '15px' : '0')};
  position: relative;
  margin-bottom: 24px;
  input[type='text'],
  textarea,
  input[type='password'],
  input[type='number'],
  input[type='email'] {
    ${props => (props.isInline ? '' : 'width: 100%')};
    max-width: 400px;
    @media (max-width: 410px) {
      box-sizing: border-box;
    }
    border-radius: 4px;
    border: solid 1px ${props => props.theme.colors.blackTrans2};
    padding: 6px 12px;
    background-color: ${props => props.theme.colors.white};
    font-size: 0.875rem;
    line-height: 1.43;
    letter-spacing: 0.53px;

    &:focus {
      border-color: transparent;
      box-shadow: 0 0 0 2px ${props => props.theme.colors.violet};
      caret-color: ${props => props.theme.colors.violet};
      outline: none !important;
    }

    &:disabled {
      border: solid 1px rgba(25, 25, 39, 0.2);
      background-color: ${props => props.theme.colors.disabled};
      cursor: not-allowed;
    }
  }

  input[type='checkbox'],
  input[type='radio'] {
    margin: 0 7px 0 0;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border: solid 1px ${props => props.theme.colors.blackTrans2};
    background-color: ${props => props.theme.colors.white};
    display: inline-block;
    vertical-align: middle;
    outline: none !important;
    margin-top: -1px;
    &:checked {
      & + svg {
        display: inline !important;
        position: absolute;
        left: 0;
        path {
          fill: ${props => props.theme.colors.white};
        }
      }
      background-color: ${props => props.theme.colors.violet};
    }
  }

  input[type='checkbox'] {
    border-radius: 4px;
    &:checked {
      & + svg {
        width: 16px;
      }
    }
  }

  input[type='radio'] {
    border-radius: 50%;
    &:checked {
      & + svg {
        width: 14px;
        height: 14px;
        margin-left: 2px;
        margin-top: 4.49px;
        * {
          fill: ${props => props.theme.colors.white};
        }
      }
      background-color: ${props => props.theme.colors.violet};
    }
  }

  &.has-error {
    input,
    textarea {
      border-color: ${props => props.theme.colors.red} !important;
      box-shadow: none !important;
    }
  }
`;

export const InputTitle = styled.span`
  font-size: 1rem;
  line-height: 1.31;
  letter-spacing: 0.61px;
  margin-bottom: ${props =>
    typeof props.marginBottom !== 'undefined' ? props.marginBottom : 11}px;

  ${props => (props.block ? 'display: block;' : '')}
  ${props =>
    props.isRequired
      ? `
    &:after {
      content: "*";
      display: inline-block;
      margin-left: 4px;
      color: ${props.theme.colors.red};
    }
  `
      : ''}
  
  b {
    font-weight: 600;
  }

  small {
    display: block;
    font-size: 0.9rem;
    opacity: 0.5;
    margin-top: 4px;
  }
`;

export const Separator = styled.div`
  width: 100%;
  max-width: 400px;
  border-bottom: 1px solid ${props => props.theme.colors.blackTrans};
  margin: 11px 0 22px;
`;

const InputDescription = styled.div`
  font-size: 0.8rem;
  margin-top: -5px;
  line-height: 1.31;
  letter-spacing: 0.61px;
  margin-bottom: 11px;
  display: block;
  color: ${props => props.theme.colors.semiDark};
  b {
    font-weight: 600;
  }
`;

export const ErrorText = styled.div`
  color: ${props => props.theme.colors.red};
  margin-top: 8px;
  font-size: 0.75rem;
`;

Input.propTypes = {
  error: PropTypes.object,
  useRef: PropTypes.any,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  inline: PropTypes.bool,
  hidden: PropTypes.bool,
  isRequired: PropTypes.bool,
  putTitleAfter: PropTypes.bool,
};
