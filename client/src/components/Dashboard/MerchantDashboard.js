import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import moment from 'moment';
import useConstant from 'use-constant';
import Grid from '@material-ui/core/Grid';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import Balance from '../../common/molecules/Balance';
import Loader from '../../common/Loader';
import Digits from '../../common/atoms/Digits';
import Money from '../../common/atoms/Money';
import TableSelect from '../../common/molecules/Select/TableSelect';
import Muted from '../../common/atoms/Muted';
import Select from '../../common/molecules/Select';
import Input from '../../common/molecules/Input';
import DataTable from '../../common/organisms/Table/DataTable';
import {
  COLUMN_AFFILIATE,
  COLUMN_AMOUNT, COLUMN_CAMPAIGN,
  COLUMN_CLICKS, COLUMN_CODE,
  COLUMN_CONVERSIONS,
  COLUMN_DAY,
  COLUMN_SIGNUPS
} from "../../common/organisms/Table/common";

const MerchantDashboard = () => {
  const { api } = useContext(appContext);
  const [timeFrame, setTimeFrame] = useState(timeFrameOptions[1].value);
  const [groupBy, setGroupBy] = useState(groupBys.GROUP_BY_CAMPAIGN_DAY_AFFILIATE);
  const [filters, setFilters] = useState({ campaign: 0 });
  const [data, setData] = useState(null);
  const aggregatedHeaderColumns = useConstant(() => [
    COLUMN_CLICKS,
    COLUMN_SIGNUPS,
    COLUMN_CONVERSIONS,
    COLUMN_AMOUNT,
  ]);

  const campaignOptions = useMemo(
    () => data && [
      {label: 'All campaigns', value: 0},
      ...[...new Set(data.table.map(({campaign: {name}}) => name))].map(x => ({label: x, value: x}))
    ],[data]
  )

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

  const header = useMemo(() => {
    switch (groupBy) {
      case groupBys.GROUP_BY_AFFILIATE:
        return [
          COLUMN_AFFILIATE,
        ];
      case groupBys.GROUP_BY_DAY:
        return [
          COLUMN_DAY,
        ];
      case groupBys.GROUP_BY_CAMPAIGN:
        return [
          COLUMN_CAMPAIGN,
          COLUMN_CODE,
        ];
      case groupBys.GROUP_BY_CAMPAIGN_DAY_AFFILIATE:
        return [
          COLUMN_DAY,
          COLUMN_CAMPAIGN,
          COLUMN_CODE,
          COLUMN_AFFILIATE,
        ];
      case groupBys.GROUP_BY_CAMPAIGN_DAY:
        return [
          COLUMN_DAY,
          COLUMN_CAMPAIGN,
          COLUMN_CODE,
        ];
      case groupBys.GROUP_BY_CAMPAIGN_AFFILIATE:
        return [
          COLUMN_CAMPAIGN,
          COLUMN_CODE,
          COLUMN_AFFILIATE,
        ];
      case groupBys.GROUP_BY_DAY_AFFILIATE:
        return [
          COLUMN_DAY,
          COLUMN_AFFILIATE,
        ];
      default:
        return [];
    }
  }, [groupBy]);

  const rowFilter = useCallback(
    ({ campaign, affiliate, code }) => {
      const filterAffiliate = filters.affiliate?.toLocaleLowerCase();
      const filterCode = filters.code?.toLocaleLowerCase();
        return (
          (!filters.campaign || campaign.name === filters.campaign) &&
          (!filterAffiliate || affiliate.toLocaleLowerCase().includes(filterAffiliate)) &&
          (!filterCode || code.toLocaleLowerCase().includes(filterCode))
        );
      },
    [filters]
  );

  const dataMapper = useCallback(
    ({ campaign, day, amount, conversions, affiliate, code }) => {
      const result = [];
      for (const column of header) {
        if (column === COLUMN_DAY) result.push(day);
        else if (column === COLUMN_CAMPAIGN) result.push(campaign.name);
        else if (column === COLUMN_CODE) result.push(code);
        else if (column === COLUMN_AFFILIATE) result.push(affiliate);
      }
      return [
        ...result,
        conversions.click,
        conversions.signup,
        conversions.conversion,
        amount,
      ];
    },
    [header],
  );

  return (
    <Content title="Dashboard">
      {data ? (
        <>
          <BalanceWrapper>
            <Balance big label="Total Revenue" value={data.totalRevenue} />
            <Balance big label="Total Paid" value={data.totalPaid} />
            <Balance big label="Total Pending" value={data.totalPending} />
          </BalanceWrapper>

          <DataTable
            data={data}
            groupBy={groupBy}
            header={header}
            filters={filters}
            rowFilter={rowFilter}
            dataMapper={dataMapper}
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
                  <Select
                    label="Campaign"
                    value={filters.campaign}
                    onChange={campaign => setFilters(f => ({ ...f, campaign }))}
                    options={campaignOptions}
                  />
                  <Input
                    value={filters.affiliate}
                    placeholder="Affiliate"
                    inline
                    type="text"
                    onChange={e =>
                      setFilters(f => ({ ...f, affiliate: e.target.value }))
                    }
                  />
                  <Input
                    value={filters.code}
                    placeholder="Code"
                    inline
                    type="text"
                    onChange={e =>
                      setFilters(f => ({ ...f, code: e.target.value }))
                    }
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
            aggregatedHeaderColumns={aggregatedHeaderColumns}
          />
        </>
      ) : (
        <Loader size="3x" />
      )}
    </Content>
  );
};

export default MerchantDashboard;

const BalanceWrapper = styled.div`
  margin-bottom: 30px;
`;

const groupBys = {
  GROUP_BY_CAMPAIGN_DAY_AFFILIATE: 'GROUP_BY_CAMPAIGN_DAY_AFFILIATE',
  GROUP_BY_DAY_CAMPAIGN: 'GROUP_BY_DAY_CAMPAIGN',
  GROUP_BY_DAY_AFFILIATE: 'GROUP_BY_DAY_AFFILIATE',
  GROUP_BY_CAMPAIGN_AFFILIATE: 'GROUP_BY_CAMPAIGN_AFFILIATE',
  GROUP_BY_DAY: 'GROUP_BY_DAY',
  GROUP_BY_CAMPAIGN: 'GROUP_BY_CAMPAIGN',
  GROUP_BY_AFFILIATE: 'GROUP_BY_AFFILIATE'
};

const groupByOptions = [
  { label: 'Day + Campaign + Affiliate', value: groupBys.GROUP_BY_CAMPAIGN_DAY_AFFILIATE },
  { label: 'Day + Campaign', value: groupBys.GROUP_BY_DAY_CAMPAIGN },
  { label: 'Day + Affiliate', value: groupBys.GROUP_BY_DAY_AFFILIATE },
  { label: 'Campaign + Affiliate', value: groupBys.GROUP_BY_CAMPAIGN_AFFILIATE },
  { label: 'Day', value: groupBys.GROUP_BY_DAY },
  { label: 'Campaign', value: groupBys.GROUP_BY_CAMPAIGN },
  { label: 'Affiliate', value: groupBys.GROUP_BY_AFFILIATE },
];

const timeFrameOptions = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 6 months', value: 182 },
  { label: 'All time', value: 0 },
];
