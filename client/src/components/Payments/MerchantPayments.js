import React, { useCallback, useContext, useMemo, useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Content from '../../common/molecules/Content';
import { appContext } from '../../contexts/app';
import Loader from '../../common/atoms/Loader';
import Select from '../../common/molecules/Select';
import DataTable from '../../common/organisms/Table/DataTable';
import {
  COLUMN_DATE,
  COLUMN_PAYOUT_CAMPAIGN,
  COLUMN_AMOUNT,
  NotEnough,
  Paid,
  Pending,
} from '../../common/organisms/Table/common';
import Fail from '../../common/molecules/Fail';
import Tabs from '../../common/molecules/Tabs';
import { PaymentProvider } from '../../contexts/payments';
import PaymentMethodCopyButton from './components/PaymentMethodCopyButton';
import PayButton from './components/PayButton';
import Code from '../../common/atoms/Code';
import CreateMerchantPayoutButton from './components/CreateMerchantPayoutButton';
import {
  PAYOUT_STATUSES,
  CONVERSION_TYPE_OPTIONS,
  PAYOUT_TYPE_OPTIONS_MERCHANT,
} from './statuses';
import DisputeChainButton from './components/DisputeChainButton';

const FILTER_PAYOUTS = 'payouts';
const FILTER_CONVERSIONS = 'conversions';

const tabs = [
  { value: FILTER_PAYOUTS, label: 'Payouts' },
  { value: FILTER_CONVERSIONS, label: 'User Conversions' },
];

const MerchantPayments = () => {
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
      COLUMN_PAYOUT_MY_CAMPAIGN,
      COLUMN_PAYOUT_AFFILIATE,
      COLUMN_PAYOUT_AFFILIATE_CREDENTIALS,
      COLUMN_AMOUNT,
      COLUMN_PAYOUT_MERCHANT_STATUS,
    ],
    [],
  );

  const conversionHeader = useMemo(
    () => [
      COLUMN_DATE,
      COLUMN_PAYOUT_CAMPAIGN,
      COLUMN_USER_ID,
      { ...COLUMN_AMOUNT, label: 'Revenue', name: 'revenue' },
      { ...COLUMN_AMOUNT, label: 'Affiliate Reward', name: 'reward' },
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
    ({ _id, campaign, affiliate, requestedAt, paidAt, amount, status }) => {
      return [
        paidAt || requestedAt,
        campaign,
        affiliate,
        affiliate,
        amount,
        { _id, status, affiliate, campaign, amount },
      ];
    },
    [],
  );

  const conversionMapper = useCallback(
    ({
      _id,
      visit: { date },
      campaign,
      externalUserId,
      totalPaid,
      affiliateReward,
      dispute,
    }) => {
      return [
        date,
        campaign,
        externalUserId,
        totalPaid,
        affiliateReward,
        { _id, dispute },
      ];
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
                    options={PAYOUT_TYPE_OPTIONS_MERCHANT}
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

export default MerchantPayments;

export const COLUMN_CONVERSION_STATUS = {
  label: 'Status',
  name: 'status',
  options: {
    // eslint-disable-next-line react/prop-types
    customBodyRender: ({ _id, dispute }) => {
      if (!dispute) {
        return (
          <>
            <Paid>Approved</Paid>
            <br />
            <DisputeChainButton chain={_id} />
          </>
        );
      }
      // eslint-disable-next-line react/prop-types
      const { date } = dispute;
      return (
        <NotEnough
          data-tootik={`Disapproved on ${moment(date).format('MMM Do YYYY')}`}
          data-tootik-conf="left"
        >
          Disapproved
        </NotEnough>
      );
    },
  },
};

export const COLUMN_PAYOUT_AFFILIATE = {
  label: 'Affiliate',
  name: 'affiliate',
  options: {
    // eslint-disable-next-line react/prop-types
    customBodyRender: ({ name }) => <>{name}</>,
  },
};

function getActivePaymentMethods(paymentCredentials) {
  return Object.entries(paymentCredentials).filter(([, value]) => value);
}

export const COLUMN_PAYOUT_AFFILIATE_CREDENTIALS = {
  label: 'Payment Method',
  name: 'credentials',
  options: {
    // eslint-disable-next-line react/prop-types
    customBodyRender: ({ paymentCredentials }) => {
      const methods = getActivePaymentMethods(paymentCredentials);
      return methods.length > 0 ? (
        <>
          {methods.map(([method, value], i) => (
            <React.Fragment key={method}>
              {i === 0 || ', '}
              <PaymentMethodCopyButton method={method} value={value} />
            </React.Fragment>
          ))}
        </>
      ) : (
        <>&mdash;</>
      );
    },
  },
};

export const COLUMN_PAYOUT_MY_CAMPAIGN = {
  label: 'Campaign',
  name: 'campaign',
  options: {
    customBodyRender: v => <Link to={`/my/campaigns/${v._id}`}>{v.name}</Link>,
  },
};

export const COLUMN_USER_ID = {
  label: 'Zignaly User ID',
  name: 'userId',
  options: {
    customBodyRender: v => (v ? <Code>{v}</Code> : <>&mdash;</>),
  },
};

export const COLUMN_PAYOUT_MERCHANT_STATUS = {
  label: 'Status',
  options: {
    // eslint-disable-next-line react/prop-types
    customBodyRender: ({ _id, status, affiliate, campaign, amount }) => {
      // eslint-disable-next-line react/prop-types
      const methods = getActivePaymentMethods(affiliate.paymentCredentials);
      if (status === PAYOUT_STATUSES.REQUESTED) {
        // eslint-disable-next-line react/prop-types
        return methods.length > 0 ? (
          <PayButton amount={amount} requestId={_id} affiliate={affiliate} />
        ) : (
          <NotEnough
            data-tootik-conf="left"
            data-tootik="Affiliate has no payment credentials configures"
          >
            No credentials
          </NotEnough>
        );
      }
      if (status === PAYOUT_STATUSES.ENOUGH_BUT_NO_PAYOUT) {
        return (
          <>
            <Pending
              data-tootik="The Payout hasn't been created yet. You can create it right now"
              data-tootik-conf="left"
            >
              Not requested
            </Pending>
            <br />
            <CreateMerchantPayoutButton
              affiliate={affiliate}
              campaign={campaign}
            />
          </>
        );
      }
      return <Paid>Paid</Paid>;
    },
  },
};
