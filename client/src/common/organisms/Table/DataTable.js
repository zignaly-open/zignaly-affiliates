import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Table from '.';
import Digits from '../../atoms/Digits';
import Money from '../../atoms/Money';

const DataTable = ({
  data,
  controls,
  header,
  groupByControl = null,
  aggregatedHeaderColumns,
  rowFilter,
  dataMapper,
}) => {
  const table = useMemo(() => {
    if (!data) return null;
    let tableData = data.table.filter(rowFilter).map(dataMapper);
    if (aggregatedHeaderColumns) {
      tableData = Object.values(
        tableData.reduce((memo, cur) => {
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
    }

    const footer = aggregatedHeaderColumns &&
      tableData.length > 0 && [
        ...new Array(header.length - 1).fill(null),
        'Total:',
        ...tableData
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

    return {
      columns: [...header, ...(aggregatedHeaderColumns || [])],
      data: tableData,
      footer: (aggregatedHeaderColumns && footer) || null,
    };
  }, [data, header, aggregatedHeaderColumns, dataMapper, rowFilter]);

  return (
    <Table
      {...table}
      controls={
        <>
          <FilterWrap>{controls}</FilterWrap>
          {groupByControl}
        </>
      }
    />
  );
};

export default DataTable;

DataTable.propTypes = {
  data: PropTypes.object,
  controls: PropTypes.element,
  groupByControl: PropTypes.element,
  header: PropTypes.array,
  aggregatedHeaderColumns: PropTypes.array,
  rowFilter: PropTypes.func,
  dataMapper: PropTypes.func,
};

const FilterWrap = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 15px 0;

  &:first-child {
    padding-bottom: 0;
  }

  &:last-child {
    padding-top: 5px;
    padding-bottom: 10px;
  }

  & > * {
    margin-bottom: 10px !important;
  }

  input {
    max-width: 150px !important;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    & > div,
    & > div > div,
    label,
    input {
      text-align: left;
      width: 100%;
      max-width: 100% !important;
    }

    label {
      margin-right: 0;
    }
  }
`;

const RightAlign = styled.div`
  text-align: right;
  font-size: ${14 / 16}rem;
  font-weight: 600;
`;
