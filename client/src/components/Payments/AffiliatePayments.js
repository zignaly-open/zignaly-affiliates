import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import moment from 'moment';
import Content from '../../common/Content';
import { appContext } from '../../context/app';
import Balance from '../../common/molecules/Balance';
import Loader from '../../common/Loader';
import Select from '../../common/molecules/Select';
import DataTable from '../../common/organisms/Table/DataTable';
import {
  COLUMN_DATE,
  COLUMN_MERCHANT,
  COLUMN_PAYOUT_CAMPAIGN,
  moneyOptions,
  COLUMN_AMOUNT,
} from '../../common/organisms/Table/common';
import Fail from '../../common/Fail';
import Tabs from '../../common/molecules/Tabs';
import Money from '../../common/atoms/Money';
import { PaymentProvider } from '../../context/payments';
import ShowTransactionDetails from './components/ShowTransactionDetails';
import { PAYOUT_STATUSES, CONVERSION_STATUSES } from './statuses';
import { SUPPORT_EMAIL } from '../../util/constants';

const FILTER_PAYOUTS = 'payouts';
const FILTER_CONVERSIONS = 'conversions';

const tabs = [
  { value: FILTER_PAYOUTS, label: 'Payouts' },
  { value: FILTER_CONVERSIONS, label: 'User Conversions' },
];

const AffiliatePayments = () => {
  const { api } = useContext(appContext);
  const [tab, setTab] = useState(FILTER_PAYOUTS);
  const [payoutType, setPayoutType] = useState(0);
  const [conversionType, setConversionType] = useState(0);

  const { loading, error, value: data, retry } = useAsyncRetry(
    () => api.get('payments'),
    [api],
  );

  const payoutHeader = useMemo(
    () => [
      COLUMN_DATE,
      COLUMN_MERCHANT,
      COLUMN_PAYOUT_CAMPAIGN,
      COLUMN_PAYOUT_AMOUNT,
      COLUMN_PAYOUT_STATUS,
    ],
    [],
  );

  const conversionHeader = useMemo(
    () => [
      COLUMN_DATE,
      COLUMN_MERCHANT,
      COLUMN_PAYOUT_CAMPAIGN,
      COLUMN_AMOUNT,
      COLUMN_CONVERSION_STATUS,
    ],
    [],
  );

  const payoutFilter = useCallback(
    ({ status }) => !payoutType || status === payoutType,
    [payoutType],
  );

  const conversionFilter = useCallback(
    ({ status }) => !conversionType || status === conversionType,
    [conversionType],
  );

  const payoutMapper = useCallback(
    ({
      campaign,
      merchant,
      requestedAt,
      note,
      paidAt,
      transactionId,
      amount,
      status,
    }) => {
      return [
        paidAt || requestedAt,
        merchant,
        campaign,
        { threshold: campaign.rewardThreshold, amount },
        { status, campaignId: campaign._id, note, paidAt, transactionId },
      ];
    },
    [],
  );

  const conversionMapper = useCallback(
    ({ visit: { date }, merchant, dispute, campaign, affiliateReward }) => {
      return [date, merchant, campaign, affiliateReward, dispute];
    },
    [],
  );

  return (
    <Content title="Payments" hideHr>
      {loading && <Loader size="3x" />}
      {error && <Fail />}
      {data && !loading && (
        <PaymentProvider value={{ reloadPayments: retry }}>
          <Tabs setTab={setTab} selectedTab={tab} tabs={tabs} />
          <BalanceWrapper>
            <Balance big label="Total Earned" value={data.totalEarned} />
            <Balance big label="Total Pending" value={data.totalPending} />
          </BalanceWrapper>

          {tab === FILTER_PAYOUTS ? (
            <DataTable
              data={{ table: data.payouts }}
              header={payoutHeader}
              rowFilter={payoutFilter}
              dataMapper={payoutMapper}
              controls={
                <div style={{ marginTop: '10px' }}>
                  <Select
                    label="Type"
                    value={payoutType}
                    onChange={setPayoutType}
                    options={PAYOUT_TYPE_OPTIONS}
                  />
                </div>
              }
            />
          ) : (
            <DataTable
              data={{ table: data.conversions }}
              header={conversionHeader}
              rowFilter={conversionFilter}
              dataMapper={conversionMapper}
              controls={
                <div style={{ marginTop: '10px' }}>
                  <Select
                    label="Type"
                    value={conversionType}
                    onChange={setConversionType}
                    options={CONVERSION_TYPE_OPTIONS}
                  />
                </div>
              }
            />
          )}
        </PaymentProvider>
      )}
    </Content>
  );
};

export default AffiliatePayments;

const BalanceWrapper = styled.div`
  margin-bottom: 30px;
`;

export const COLUMN_PAYOUT_STATUS = {
  label: 'Status',
  name: 'status',
  options: {
    // eslint-disable-next-line react/prop-types
    customBodyRender: ({ status, note, paidAt, transactionId }) => {
      return {
        NOT_ENOUGH: <NotEnough>Min not reached</NotEnough>,
        // CAN_CHECKOUT: <RequestPayout campaignId={campaignId} />,
        CAN_CHECKOUT: <Requested>Pending</Requested>,
        REJECTED: <NotEnough>Rejected</NotEnough>,
        REQUESTED: <Requested>Requested</Requested>,
        PAID: <ShowTransactionDetails {...{ note, paidAt, transactionId }} />,
      }[status];
    },
  },
};

export const COLUMN_CONVERSION_STATUS = {
  label: 'Status',
  name: 'status',
  options: {
    customBodyRender: dispute => {
      if (!dispute) {
        return <Paid>Approved</Paid>;
      }
      return (
        <NotEnough
          data-tootik={`Disapproved on ${moment(dispute.date).format(
            'MMM Do YYYY',
          )}`}
          data-tootik-conf="left"
        >
          Disapproved
          <br />
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Contact support
          </a>
        </NotEnough>
      );
    },
  },
};

export const COLUMN_PAYOUT_AMOUNT = {
  label: 'Amount',
  name: 'amount',
  type: 'money',
  options: {
    ...moneyOptions,
    // eslint-disable-next-line react/prop-types
    customBodyRender: ({ threshold, amount }) => (
      <>
        <Money value={amount} />
        {threshold && (
          <ThresholdStyle>
            Min <Money small value={threshold} />
          </ThresholdStyle>
        )}
      </>
    ),
  },
};

const ThresholdStyle = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
`;

const PAYOUT_TYPE_OPTIONS = [
  { value: 0, label: 'All types' },
  { value: PAYOUT_STATUSES.NOT_ENOUGH, label: 'Min not reached' },
  { value: PAYOUT_STATUSES.REQUESTED, label: 'Requested' },
  { value: PAYOUT_STATUSES.PAID, label: 'Paid' },
];

const CONVERSION_TYPE_OPTIONS = [
  { value: 0, label: 'All types' },
  { value: CONVERSION_STATUSES.PENDING, label: 'Pending' },
  { value: CONVERSION_STATUSES.REJECTED, label: 'Disapproved' },
  { value: CONVERSION_STATUSES.COMPLETE, label: 'Approved' },
];

const NotEnough = styled.span`
  color: ${props => props.theme.colors.red};
`;

const Requested = styled.span`
  color: ${props => props.theme.colors.green};
`;

const Paid = styled.span`
  color: ${props => props.theme.colors.emerald};
`;
