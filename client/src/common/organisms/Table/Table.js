import React, { useContext, useMemo } from 'react';
import MUIDataTable from 'mui-datatables';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MuiThemeProvider, useTheme } from '@material-ui/core/styles';
import getTableStyle from './style';
import getTableOptions from './options';
import { appContext } from '../../../contexts/app';

// TODO: store state in specific contexts
const Table = ({ data, columns, controls, footer }) => {
  const theme = useTheme();
  const { user } = useContext(appContext);
  const extendedTheme = useMemo(() => getTableStyle(theme), [theme]);
  const options = useMemo(
    () => getTableOptions(controls, footer, { download: !!user?.isAdmin }),
    [controls, footer, user?.isAdmin],
  );

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

  button[data-testid='Download CSV-iconButton'] {
    position: absolute;
    right: 0;
  }
`;

Table.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  controls: PropTypes.any,
  footer: PropTypes.array,
};
