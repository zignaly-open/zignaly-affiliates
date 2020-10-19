import React, { useCallback } from 'react';
import styled from 'styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import MUSelect from '@material-ui/core/Select';
import PropTypes from 'prop-types';
import { InputTitle } from '../Input';

const Select = ({
  value,
  onChange,
  tooltip,
  label,
  title,
  oneLine,
  isRequired,
  muiOptions = {},
  options,
  error,
}) => {
  // if you want to use MUI, you either stand on your knees and disable the strict mode
  // or take it like a man and live with the errors
  // https://stackoverflow.com/questions/61220424/material-ui-drawer-finddomnode-is-deprecated-in-strictmode
  const setValue = useCallback(e => onChange(e.target.value), [onChange]);
  return (
    <SelectWrapper hasError={!!error} data-tootik={tooltip}>
      {title && (
        <InputTitle block={!oneLine} isRequired={isRequired}>
          {title}
        </InputTitle>
      )}
      <MUSelect
        variant="standard"
        {...(onChange ? { onChange: setValue, value } : {})}
        {...muiOptions}
        label={label}
      >
        {options.map(({ label: optionLabel, value: optionValue }) => (
          <MenuItem value={optionValue} key={optionValue}>
            {optionLabel}
          </MenuItem>
        ))}
      </MUSelect>
    </SelectWrapper>
  );
};

export default Select;

Select.propTypes = {
  value: PropTypes.any,
  error: PropTypes.object,
  muiOptions: PropTypes.object,
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  oneLine: PropTypes.bool,
  isRequired: PropTypes.bool,
  tooltip: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

const SelectWrapper = styled.div`
  display: inline-block;
  & > div {
    &:before,
    &:after {
      display: none !important;
    }
    background-color: ${props => props.theme.colors.white};
    border: ${props =>
        props.theme.colors[props.hasError ? 'red' : 'blackTrans2']}
      1px solid !important;
    div[role='button'] {
      font-size: 0.875rem;
      padding: 6px 25px 6px 12px;
      border-width: 0 !important;
    }
    border-radius: 4px;
    margin-right: 10px;
  }
`;
