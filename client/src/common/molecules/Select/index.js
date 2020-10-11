import React, { useCallback } from 'react';
import styled from 'styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import MUSelect from '@material-ui/core/Select';
import PropTypes from 'prop-types';

const Select = ({ value, onChange, label, options, error }) => {
  // if you want to use MUI, you either stand on your knees and disable the strict mode
  // or take it like a man and live with the errors
  // https://stackoverflow.com/questions/61220424/material-ui-drawer-finddomnode-is-deprecated-in-strictmode
  const setValue = useCallback(e => onChange(e.target.value), [onChange]);
  return (
    <SelectWrapper hasError={!!error}>
      <MUSelect
        variant="standard"
        {...(onChange ? {onChange: setValue, value} : {})}
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
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

const SelectWrapper = styled.div`
  display: inline-block;
  .MuiInput-root {
    &:before,
    &:after {
      display: none !important;
    }
    background-color: ${props => props.theme.colors.white};
    border: ${props => props.theme.colors[props.hasError ? 'red' : 'blackTrans2']} 1px solid !important;
    div[role='button'] {
      font-size: 0.875rem;
      padding: 6px 25px 6px 12px;
      border-width: 0 !important;
    }
    border-radius: 4px;
    margin-right: 10px;
  }
`;
