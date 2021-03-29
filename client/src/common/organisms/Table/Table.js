import React, { useMemo } from 'react';
import MUIDataTable from 'mui-datatables';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MuiThemeProvider, useTheme } from '@material-ui/core/styles';
import getTableStyle from './style';
import getTableOptions from './options';

// TODO: store state in specific contexts
const Table = ({ data, columns, controls, footer }) => {
  const theme = useTheme();
  const extendedTheme = useMemo(() => getTableStyle(theme), [theme]);
  const options = useMemo(() => getTableOptions(controls, footer), [
    controls,
    footer,
  ]);

  return (
    <TableWrapperForProvidingStyles>
      <MuiThemeProvider theme={extendedTheme}>
        <MUIDataTable data={data} columns={columns} options={options} />
      </MuiThemeProvider>
    </TableWrapperForProvidingStyles>
  );
};

export default Table;

const TableWrapperForProvidingStyles = styled.div`
  .right-aligned {
    text-align: right;
  }

  th.right-aligned {
    & > span {
      justify-content: flex-end;
    }
  }
`;

Table.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  controls: PropTypes.any,
  footer: PropTypes.array,
};
