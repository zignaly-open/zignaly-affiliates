import React from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import PropTypes from 'prop-types';
import TableFooter from '@material-ui/core/TableFooter';

const FooterRow = ({ columns, footer }) => {
  return (
    <TableFooter>
      <TableRow>
        {columns.map((col, index) => {
          if (col.display === 'true') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <TableCell key={index} style={{ borderBottomWidth: 0 }}>
                {footer[index]}
              </TableCell>
            );
          }
          return null;
        })}
      </TableRow>
    </TableFooter>
  );
};

FooterRow.propTypes = {
  footer: PropTypes.array,
  columns: PropTypes.array,
};

export default function getTableOptions(controls, footer, extraOptions) {
  return {
    selectableRows: 'none',
    customToolbar: () => <>{controls}</>,
    filter: false,
    search: false,
    print: false,
    download: false,
    downloadOptions: { filename: 'zignaly.csv', separator: ',' },
    viewColumns: false,
    sort: true,
    // eslint-disable-next-line react/prop-types
    customTableBodyFooterRender: ({ columns }) =>
      footer && <FooterRow columns={columns} footer={footer} />,
    fixedHeader: true,
    elevation: 1,
    responsive: 'standard',
    ...extraOptions,
  };
}
