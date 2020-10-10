import React from 'react';
import styled from 'styled-components';
import Select from '.';

const TableSelect = ({ value, onChange, options, label }) => (
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

const TableHeaderFilterLabel = styled.div`
  display: inline-block;

  @media (max-width: ${props => props.theme.breakpoints.fablet}) {
    & > span {
      display: block;
    }
  }

  & > span {
    color: ${props => props.theme.colors.dark};
    font-size: ${14 / 16}rem;
    font-weight: 400;
    margin-right: 10px;
  }

  .MuiInput-root {
    background-color: transparent;
    font-size: ${14 / 16}rem;
    border: none !important;
    div[role='button'] {
      font-size: 0.875rem;
      padding: 6px 20spx 6px 4px;
      border-width: 0 !important;
    }
    border-radius: 4px;
    margin-right: 0;
  }
`;

export default TableSelect;

TableSelect.propTypes = Select.propTypes;
