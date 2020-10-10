import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import Balance from '../../common/molecules/Balance';
import Loader from '../../common/Loader';
import Table from '../../common/organisms/Table';
import Digits from '../../common/atoms/Digits';
import Money from '../../common/atoms/Money';
import TableSelect from '../../common/molecules/Select/TableSelect';
import Muted from '../../common/atoms/Muted';
import Select from '../../common/molecules/Select';
import Input from '../../common/molecules/Input';

const AffiliateDashboard = () => {
  const { api } = useContext(appContext);
  const [timeFrame, setTimeFrame] = useState(timeFrameOptions[1].value);
  const [groupBy, setGroupBy] = useState(groupBys.GROUP_BY_CAMPAIGN_DAY);
  const [subtrack, setSubtrack] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    api
      .get(
        'dashboard',
        timeFrame
          ? {
              startDate: moment().subtract(timeFrame, 'days').toJSON(),
            }
          : {},
      )
      .then(setData)
      .catch(() => alert('Could not load the data'));
  }, [api, timeFrame]);

  const table = useMemo(() => {
    if (!data) return null;

    let header = [];
    switch (groupBy) {
      case groupBys.GROUP_BY_CAMPAIGN_DAY:
        header = [
          COLUMN_DAY,
          COLUMN_CAMPAIGN,
          COLUMN_ZIGNALY_ID,
          COLUMN_CODE,
          COLUMN_SUBTRACK,
        ];
        break;
      case groupBys.GROUP_BY_CAMPAIGN:
        header = [
          COLUMN_CAMPAIGN,
          COLUMN_ZIGNALY_ID,
          COLUMN_CODE,
          COLUMN_SUBTRACK,
        ];
        break;
      case groupBys.GROUP_BY_CODE:
        header = [COLUMN_CODE];
        break;
      case groupBys.GROUP_BY_DAY:
        header = [COLUMN_DAY];
        break;
      case groupBys.GROUP_BY_SUBTRACK:
        header = [COLUMN_SUBTRACK];
        break;
      default:
        break;
    }

    const aggregatedHeaderColumns = [
      COLUMN_CLICKS,
      COLUMN_SIGNUPS,
      COLUMN_CONVERSIONS,
      COLUMN_EARNINGS,
    ];

    const rowsAggregated = Object.values(
      data.table
        .filter(
          ({ campaign }) =>
            !subtrack ||
            (campaign.subtrack &&
              campaign.subtrack
                .toLocaleLowerCase()
                .includes(subtrack.toLocaleLowerCase())),
        )
        .map(({ campaign, day, earnings, conversions }) => {
          const result = [];
          for (const column of header) {
            if (column === COLUMN_DAY) result.push(day);
            else if (column === COLUMN_ZIGNALY_ID)
              result.push(campaign.zignalyId);
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
        })
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
            {aggregatedHeaderColumns[i] === COLUMN_EARNINGS ? (
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
      footer,
    };
  }, [data, groupBy, subtrack]);

  return (
    <Content title="Dashboard">
      {data ? (
        <>
          <BalanceWrapper>
            <Balance big label="Total Revenue" value={data.totalRevenue} />
            <Balance big label="Total Paid" value={data.totalPaid} />
            <Balance big label="Total Pending" value={data.totalPending} />
          </BalanceWrapper>
          <Table
            {...table}
            controls={
              <Grid container>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  style={{ textAlign: 'left', margin: '15px 0 10px' }}
                >
                  <Select
                    label="Period"
                    value={timeFrame}
                    onChange={setTimeFrame}
                    options={timeFrameOptions}
                  />
                  <Input
                    value={subtrack}
                    placeholder="Subtrack"
                    inline
                    type="text"
                    onChange={e => setSubtrack(e.target.value)}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  style={{ textAlign: 'left' }}
                >
                  <TableSelect
                    label="Group by"
                    value={groupBy}
                    onChange={setGroupBy}
                    options={groupByOptions}
                  />
                </Grid>
              </Grid>
            }
          />
        </>
      ) : (
        <Loader size="3x" />
      )}
    </Content>
  );
};

export default AffiliateDashboard;

const BalanceWrapper = styled.div`
  margin-bottom: 30px;
`;

const RightAlign = styled.div`
  text-align: right;
  font-size: ${14 / 16}rem;
  font-weight: 600;
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

const digitOptions = {
  setCellProps: () => ({ className: 'right-aligned' }),
  setCellHeaderProps: () => ({ className: 'right-aligned' }),
  customBodyRender: v => <Digits value={v} />,
};

const moneyOptions = {
  setCellProps: () => ({ className: 'right-aligned' }),
  setCellHeaderProps: () => ({ className: 'right-aligned' }),
  customBodyRender: v => <Money value={v} />,
};

const COLUMN_DAY = {
  label: 'Day',
  options: {
    customBodyRender: v => moment(v).format('MMM Do YYYY'),
  },
};

const COLUMN_SUBTRACK = {
  label: 'Day',
  options: {
    customBodyRender: v => v || <Muted>No subtrack</Muted>,
  },
};

const COLUMN_CAMPAIGN = 'Campaign';
const COLUMN_ZIGNALY_ID = 'Zignaly Id';
const COLUMN_CODE = 'Code';
const COLUMN_CLICKS = {
  label: 'Clicks',
  name: 'clicks',
  options: digitOptions,
};
const COLUMN_SIGNUPS = {
  label: 'Signups',
  name: 'signups',
  options: digitOptions,
};
const COLUMN_CONVERSIONS = {
  label: 'Conversions',
  name: 'conversions',
  options: digitOptions,
};
const COLUMN_EARNINGS = {
  label: 'Earnings',
  name: 'earnings',
  options: moneyOptions,
};