import React, { useCallback } from 'react';
import styled from 'styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import MUSelect from '@material-ui/core/Select';
import PropTypes from 'prop-types';

const SelectWrapper = styled.div`
  display: inline-block;
  .MuiInput-root {
    &:before,
    &:after {
      display: none !important;
    }
  }
`;

const SelectStyleWrapper = styled(SelectWrapper)`
  .MuiInput-root {
    background-color: ${props => props.theme.colors.white};
    border: ${props => props.theme.colors.blackTrans2} 1px solid !important;
    div[role='button'] {
      font-size: 0.875rem;
      padding: 6px 25px 6px 12px;
      border-width: 0 !important;
    }
    border-radius: 4px;
  }
`;

const Select = ({ value, onChange, label, options, useStyle = true }) => {
  // if you want to use MUI, you either stand on your knees and disable the strict mode
  // or take it like a man and live with the errors
  // https://stackoverflow.com/questions/61220424/material-ui-drawer-finddomnode-is-deprecated-in-strictmode
  const setValue = useCallback(e => onChange(e.target.value), [onChange]);
  const Wrapper = useStyle ? SelectStyleWrapper : SelectWrapper;
  return (
    <Wrapper>
      <MUSelect
        value={value}
        variant="standard"
        onChange={setValue}
        label={label}
      >
        {options.map(({ label: optionLabel, value: optionValue }) => (
          <MenuItem value={optionValue} key={optionValue}>
            {optionLabel}
          </MenuItem>
        ))}
      </MUSelect>
    </Wrapper>
  );
};

export default Select;

Select.propTypes = {
  value: PropTypes.any,
  label: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  useStyle: PropTypes.bool,
};
