export default function getTableStyle(theme) {
  return {
    overrides: {
      MUIDataTableHeadRow: {
        root: {
          verticalAlign: 'top',
        },
      },
      MUIDataTableToolbar: {
        left: {
          display: 'none',
        },
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.31,
          letterSpacing: '0.61px',
        },
      },
      MUIDataTableHeadCell: {
        sortActive: {
          color: '#000',
          opacity: 1,
        },
        data: {
          opacity: '0.6',
        },
        root: {
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          lineHeight: 1.45,
          letterSpacing: '0.42px',
          padding: '12px',
        },
      },
      MUIDataTableBodyCell: {
        stackedParent: {
          padding: 0,
        },
        stackedCommon: {
          fontSize: '0.875rem',
          fontWeight: 600,
          minWidth: '80px',
          padding: '12px',
          whiteSpace: 'nowrap',
          [theme.breakpoints.down('sm')]: {
            height: 'auto',
            textAlign: 'left',
            whiteSpace: 'normal',
            padding: '5px',
            fontSize: '0.875rem',
          },
        },
      },
      MUIDataTablePagination: {
        root: {
          [theme.breakpoints.down('sm')]: {
            '&:last-child': {
              paddingLeft: 0,
            },
          },
        },
        toolbar: {
          [theme.breakpoints.down('sm')]: {
            paddingLeft: 0,
          },
        },
      },
    },
  };
}
