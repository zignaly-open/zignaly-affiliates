import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import useAsync from 'react-use/lib/useAsync';
import useConstant from 'use-constant';
import Content from '../../common/molecules/Content';
import { appContext } from '../../contexts/app';
import Balance from '../../common/molecules/Balance';
import Loader from '../../common/atoms/Loader';
import TableSelect from '../../common/molecules/Select/TableSelect';
import Select from '../../common/molecules/Select';
import Input from '../../common/molecules/Input';
import DataTable from '../../common/organisms/Table/DataTable';
import {
  COLUMN_AFFILIATE,
  COLUMN_CAMPAIGN,
  COLUMN_CODE,
  COLUMN_CLICKS,
  COLUMN_SIGNUPS,
  COLUMN_PAYMENTS,
  COLUMN_CONNECTS,
  COLUMN_DAY,
  COLUMN_REVENUE,
  COLUMN_AFFILIATE_ID,
  COLUMN_AFFILIATE_EMAIL,
} from '../../common/organisms/Table/common';
import Fail from '../../common/molecules/Fail';

const MerchantDashboard = () => {
  const { api, user } = useContext(appContext);
  const [timeFrame, setTimeFrame] = useState(timeFrameOptions[1].value);
  const [groupBy, setGroupBy] = useState(
    groupBys.GROUP_BY_CAMPAIGN_DAY_AFFILIATE,
  );
  const [filters, setFilters] = useState({ campaign: 0 });
  const aggregatedHeaderColumns = useConstant(() => [
    COLUMN_CLICKS,
    COLUMN_SIGNUPS,
    COLUMN_CONNECTS,
    COLUMN_PAYMENTS,
    COLUMN_REVENUE,
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

  const campaignOptions = useMemo(
    () =>
      data && [
        { label: 'All campaigns', value: 0 },
        ...[
          ...new Set(data.table.map(({ campaign: { name } }) => name)),
        ].map(x => ({ label: x, value: x })),
      ],
    [data],
  );

  const shouldShowEmail = !!user?.isAdmin;

  const header = useMemo(() => {
    switch (groupBy) {
      case groupBys.GROUP_BY_AFFILIATE:
        return [COLUMN_AFFILIATE];
      case groupBys.GROUP_BY_DAY:
        return [COLUMN_DAY];
      case groupBys.GROUP_BY_CAMPAIGN:
        return [COLUMN_CAMPAIGN, COLUMN_CODE];
      case groupBys.GROUP_BY_CAMPAIGN_DAY_AFFILIATE:
        return [
          COLUMN_DAY,
          COLUMN_CAMPAIGN,
          COLUMN_CODE,
          COLUMN_AFFILIATE,
        ].concat(
          shouldShowEmail ? [COLUMN_AFFILIATE_ID, COLUMN_AFFILIATE_EMAIL] : [],
        );
      case groupBys.GROUP_BY_CAMPAIGN_DAY:
        return [COLUMN_DAY, COLUMN_CAMPAIGN, COLUMN_CODE];
      case groupBys.GROUP_BY_CAMPAIGN_AFFILIATE:
        return [COLUMN_CAMPAIGN, COLUMN_CODE, COLUMN_AFFILIATE].concat(
          shouldShowEmail ? [COLUMN_AFFILIATE_ID, COLUMN_AFFILIATE_EMAIL] : [],
        );
      case groupBys.GROUP_BY_DAY_AFFILIATE:
        return [COLUMN_DAY, COLUMN_AFFILIATE];
      default:
        return [];
    }
  }, [groupBy, shouldShowEmail]);

  const rowFilter = useCallback(
    ({ campaign, affiliate: { name: affiliate }, code }) => {
      const filterAffiliate = filters.affiliate?.toLocaleLowerCase();
      const filterCode = filters.code?.toLocaleLowerCase();
      return (
        (!filters.campaign || campaign.name === filters.campaign) &&
        (!filterAffiliate ||
          affiliate?.toLocaleLowerCase().includes(filterAffiliate)) &&
        (!filterCode || code?.toLocaleLowerCase().includes(filterCode))
      );
    },
    [filters],
  );

  const dataMapper = useCallback(
    ({ campaign, day, revenue, conversions, affiliate, code }) => {
      const result = [];
      for (const column of header) {
        if (column === COLUMN_DAY) result.push(day);
        else if (column === COLUMN_CAMPAIGN) result.push(campaign.name);
        else if (column === COLUMN_CODE) result.push(code);
        else if (column === COLUMN_AFFILIATE) result.push(affiliate.name);
        else if (column === COLUMN_AFFILIATE_EMAIL)
          result.push(affiliate.email);
        else if (column === COLUMN_AFFILIATE_ID) result.push(affiliate._id);
      }
      return [
        ...result,
        conversions.click,
        conversions.signup,
        conversions.connect,
        conversions.payment,
        revenue,
      ];
    },
    [header],
  );

  return (
    <Content title="Dashboard">
      {loading && <Loader size="3x" />}
      {error && <Fail />}
      {data && !loading && (
        <>
          <BalanceWrapper>
            <Balance big label="Total Revenue" value={data.totalRevenue} />
            <Balance big label="Total Paid" value={data.totalPaid} />
            <Balance big label="Total Pending" value={data.totalPending} />
          </BalanceWrapper>
          <DataTable
            data={data}
            header={header}
            rowFilter={rowFilter}
            dataMapper={dataMapper}
            controls={
              <>
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
              </>
            }
            groupByControl={
              <TableSelect
                label="Group by"
                value={groupBy}
                onChange={setGroupBy}
                options={groupByOptions}
              />
            }
            aggregatedHeaderColumns={aggregatedHeaderColumns}
          />
        </>
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
  GROUP_BY_CAMPAIGN_DAY: 'GROUP_BY_CAMPAIGN_DAY',
  GROUP_BY_DAY_AFFILIATE: 'GROUP_BY_DAY_AFFILIATE',
  GROUP_BY_CAMPAIGN_AFFILIATE: 'GROUP_BY_CAMPAIGN_AFFILIATE',
  GROUP_BY_DAY: 'GROUP_BY_DAY',
  GROUP_BY_CAMPAIGN: 'GROUP_BY_CAMPAIGN',
  GROUP_BY_AFFILIATE: 'GROUP_BY_AFFILIATE',
};

const groupByOptions = [
  {
    label: 'Day + Campaign + Affiliate',
    value: groupBys.GROUP_BY_CAMPAIGN_DAY_AFFILIATE,
  },
  { label: 'Day + Campaign', value: groupBys.GROUP_BY_CAMPAIGN_DAY },
  { label: 'Day + Affiliate', value: groupBys.GROUP_BY_DAY_AFFILIATE },
  {
    label: 'Campaign + Affiliate',
    value: groupBys.GROUP_BY_CAMPAIGN_AFFILIATE,
  },
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
