import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import useAsync from 'react-use/lib/useAsync';
import useConstant from 'use-constant';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import Balance from '../../common/molecules/Balance';
import Loader from '../../common/Loader';
import TableSelect from '../../common/molecules/Select/TableSelect';
import Select from '../../common/molecules/Select';
import Input from '../../common/molecules/Input';
import DataTable from '../../common/organisms/Table/DataTable';
import {
  COLUMN_CAMPAIGN,
  COLUMN_CLICKS,
  COLUMN_CODE,
  COLUMN_CONVERSIONS,
  COLUMN_DAY,
  COLUMN_EARNINGS,
  COLUMN_SIGNUPS,
  COLUMN_SUBTRACK,
  COLUMN_ZIGNALY_ID,
} from '../../common/organisms/Table/common';
import Fail from '../../common/Fail';

const AffiliateDashboard = () => {
  const { api } = useContext(appContext);
  const [timeFrame, setTimeFrame] = useState(timeFrameOptions[1].value);
  const [groupBy, setGroupBy] = useState(groupBys.GROUP_BY_CAMPAIGN_DAY);
  const [filters, setFilters] = useState({ subtrack: '' });
  const aggregatedHeaderColumns = useConstant(() => [
    COLUMN_CLICKS,
    COLUMN_SIGNUPS,
    COLUMN_CONVERSIONS,
    COLUMN_EARNINGS,
  ]);

  const { loading, error, value: data } = useAsync(
    () =>
      api.get(
        'dashboard',
        timeFrame
          ? {
              startDate: moment().subtract(timeFrame, 'days').toJSON(),
            }
          : {},
      ),
    [api, timeFrame],
  );

  const header = useMemo(() => {
    switch (groupBy) {
      case groupBys.GROUP_BY_CAMPAIGN_DAY:
        return [
          COLUMN_DAY,
          COLUMN_CAMPAIGN,
          COLUMN_ZIGNALY_ID,
          COLUMN_CODE,
          COLUMN_SUBTRACK,
        ];
      case groupBys.GROUP_BY_CAMPAIGN:
        return [
          COLUMN_CAMPAIGN,
          COLUMN_ZIGNALY_ID,
          COLUMN_CODE,
          COLUMN_SUBTRACK,
        ];
      case groupBys.GROUP_BY_CODE:
        return [COLUMN_CODE];
      case groupBys.GROUP_BY_DAY:
        return [COLUMN_DAY];
      case groupBys.GROUP_BY_SUBTRACK:
        return [COLUMN_SUBTRACK];
      default:
        return [];
    }
  }, [groupBy]);

  const rowFilter = useCallback(
    ({ campaign }) =>
      !filters.subtrack ||
      (campaign.subtrack &&
        campaign.subtrack
          .toLocaleLowerCase()
          .includes(filters.subtrack.toLocaleLowerCase())),
    [filters],
  );

  const dataMapper = useCallback(
    ({ campaign, day, earnings, conversions }) => {
      const result = [];
      for (const column of header) {
        if (column === COLUMN_DAY) result.push(day);
        else if (column === COLUMN_ZIGNALY_ID) result.push(campaign.zignalyId);
        else if (column === COLUMN_SUBTRACK) result.push(campaign.subtrack);
        else if (column === COLUMN_CAMPAIGN) result.push(campaign.name);
        else if (column === COLUMN_CODE) result.push(campaign.code);
      }
      return [
        ...result,
        conversions.click,
        conversions.signup,
        conversions.conversion,
        earnings,
      ];
    },
    [header],
  );

  return (
    <Content title="Dashboard">
      {loading && <Loader size="3x" />}
      {error && <Fail />}
      {data && (
        <>
          <BalanceWrapper>
            <Balance big label="Total Earned" value={data.totalPaid} />
            <Balance big label="Total Pending" value={data.totalPending} />
          </BalanceWrapper>

          <DataTable
            data={data}
            header={header}
            rowFilter={rowFilter}
            dataMapper={dataMapper}
            groupByControl={
              <TableSelect
                label="Group by"
                value={groupBy}
                onChange={setGroupBy}
                options={groupByOptions}
              />
            }
            controls={
              <>
                <Select
                  label="Period"
                  value={timeFrame}
                  onChange={setTimeFrame}
                  options={timeFrameOptions}
                />
                <Input
                  value={filters.subtrack}
                  placeholder="Subtrack"
                  inline
                  type="text"
                  onChange={e =>
                    setFilters(f => ({ ...f, subtrack: e.target.value }))
                  }
                />
              </>
            }
            aggregatedHeaderColumns={aggregatedHeaderColumns}
          />
        </>
      )}
    </Content>
  );
};

export default AffiliateDashboard;

const BalanceWrapper = styled.div`
  margin-bottom: 30px;
`;

const groupBys = {
  GROUP_BY_CAMPAIGN_DAY: 'GROUP_BY_CAMPAIGN_DAY',
  GROUP_BY_CAMPAIGN: 'GROUP_BY_CAMPAIGN',
  GROUP_BY_DAY: 'GROUP_BY_DAY',
  GROUP_BY_SUBTRACK: 'GROUP_BY_SUBTRACK',
  GROUP_BY_CODE: 'GROUP_BY_CODE',
};

const groupByOptions = [
  { label: 'Day + Campaign', value: groupBys.GROUP_BY_CAMPAIGN_DAY },
  { label: 'Day', value: groupBys.GROUP_BY_DAY },
  { label: 'Campaign', value: groupBys.GROUP_BY_CAMPAIGN },
  { label: 'Subtrack', value: groupBys.GROUP_BY_SUBTRACK },
  { label: 'Code', value: groupBys.GROUP_BY_CODE },
];

const timeFrameOptions = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 6 months', value: 182 },
  { label: 'All time', value: 0 },
];
