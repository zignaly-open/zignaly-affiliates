import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Select from './Select';

const TableSelect = ({ value, onChange, options, label }) => {
  // if you want to use MUI, you either stand on your knees and disable the strict mode
  // or take it like a man and live with the errors
  // https://stackoverflow.com/questions/61220424/material-ui-drawer-finddomnode-is-deprecated-in-strictmode
  return (
    <TableHeaderFilterLabel>
      <span>{label}:</span>
      <Select
        value={value}
        useStyle={false}
        onChange={onChange}
        options={options}
      />
    </TableHeaderFilterLabel>
  );
};

const TableHeaderFilterLabel = styled.div`
  display: inline-block;

  @media (max-width: ${props => props.theme.breakpoints.fablet}) {
    display: block;
    text-align: center;
    margin: 6px 0 7px;
  }

  .MuiInput-root {
    font-size: ${14 / 16}rem;
  }

  & > span {
    color: ${props => props.theme.colors.dark};
    font-size: ${14 / 16}rem;
    font-weight: 400;
    margin-right: 10px;
  }
`;

export default TableSelect;

TableSelect.propTypes = {
  value: PropTypes.any,
  label: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};
