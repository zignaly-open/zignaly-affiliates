import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Table from '.';
import Digits from '../../atoms/Digits';
import Money from '../../atoms/Money';

const DataTable = ({
  data,
  groupBy,
  controls,
  header,
  aggregatedHeaderColumns,
  rowFilter,
  filters,
  dataMapper,
}) => {
  const table = useMemo(() => {
    if (!data) return null;

    const rowsAggregated = Object.values(
      data.table
        .filter(rowFilter)
        .map(dataMapper)
        .reduce((memo, cur) => {
          /* eslint-disable no-param-reassign */
          const key = cur
            .slice(0, header.length)
            .map(x => `${x}`)
            .join('-----');
          if (!memo[key]) {
            memo[key] = cur;
          } else {
            for (let i = header.length; i < cur.length; i++) {
              memo[key][i] += cur[i];
            }
          }
          /* eslint-enable no-param-reassign */
          return memo;
        }, {}),
    );

    const footer = rowsAggregated.length > 0 && [
      ...new Array(header.length - 1).fill(null),
      'Total:',
      ...rowsAggregated
        .reduce((memo, cur) => {
          const metrics = cur.slice(header.length);
          return memo ? memo.map((x, i) => x + metrics[i]) : metrics;
        }, null)
        .map((x, i) => (
          <RightAlign>
            {aggregatedHeaderColumns[i].type === 'money' ? (
              <Money value={x} />
            ) : (
              <Digits value={x} />
            )}
          </RightAlign>
        )),
    ];

    header = [...header, ...aggregatedHeaderColumns];

    return {
      columns: header,
      data: rowsAggregated,
      footer: footer || null,
    };
  }, [data, groupBy, filters, header]);

  return <Table {...table} controls={controls} />;
};

export default DataTable;

DataTable.propTypes = {
  data: PropTypes.object,
  groupBy: PropTypes.string,
  controls: PropTypes.element,
  header: PropTypes.array,
  aggregatedHeaderColumns: PropTypes.array,
  rowFilter: PropTypes.func,
  filters: PropTypes.object,
  dataMapper: PropTypes.func,
};

const RightAlign = styled.div`
  text-align: right;
  font-size: ${14 / 16}rem;
  font-weight: 600;
`;
