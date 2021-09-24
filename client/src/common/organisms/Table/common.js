import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Digits from '../../atoms/Digits';
import Money from '../../atoms/Money';
import Code from '../../atoms/Code';
import Muted from '../../atoms/Muted';

export const digitOptions = {
  setCellProps: () => ({ className: 'right-aligned' }),
  setCellHeaderProps: () => ({ className: 'right-aligned' }),
  customBodyRender: v => <Digits value={v} />,
};

export const digitOrDashOptions = {
  setCellProps: () => ({ className: 'right-aligned' }),
  setCellHeaderProps: () => ({ className: 'right-aligned' }),
  customBodyRender: v => (v ? <Digits value={v} /> : <Muted>&mdash;</Muted>),
};

export const codeOptions = {
  customBodyRender: v => (v ? <Code>{v}</Code> : <Muted>&mdash;</Muted>),
};

export const moneyOptions = {
  setCellProps: () => ({ className: 'right-aligned' }),
  setCellHeaderProps: () => ({ className: 'right-aligned' }),
  customBodyRender: v => <Money value={v} />,
};

export const COLUMN_DAY = {
  label: 'Day',
  options: {
    customBodyRender: v => moment(v).format('MMM Do YYYY'),
  },
};

export const COLUMN_DATE = {
  label: 'Date',
  options: {
    customBodyRender: v =>
      v ? moment(v).format('MMM Do YYYY hh:mm a') : <>&mdash;</>,
  },
};

export const COLUMN_EMAIL = {
  label: 'E-mail',
  options: {
    customBodyRender: v => <a href={`mailto:${v}`}>{v}</a>,
  },
};

export const COLUMN_MERCHANT = {
  label: 'Merchant',
  name: 'merchant',
  options: {
    customBodyRender: v => <Link to={`/merchant/${v._id}`}>{v.name}</Link>,
  },
};

export const column = name => ({
  label: name,
  name,
});

export const COLUMN_PAYOUT_CAMPAIGN = {
  label: 'Campaign',
  name: 'campaign',
  options: {
    customBodyRender: v => <Link to={`/campaigns/${v._id}`}>{v.name}</Link>,
  },
};

export const COLUMN_SUBTRACK = {
  label: 'Subtrack',
  options: {
    customBodyRender: v => v || <Muted>No subtrack</Muted>,
  },
};

export const COLUMN_CAMPAIGN = 'Campaign';

export const COLUMN_AFFILIATE = 'Affiliate';

export const COLUMN_AFFILIATE_EMAIL = 'Aff Email';

export const COLUMN_AFFILIATE_ID = 'Aff Id';

export const COLUMN_CODE = {
  label: 'Code',
  name: 'code',
  options: codeOptions,
};

export const COLUMN_CLICKS = {
  label: 'Unique Clicks',
  name: 'clicks',
  options: digitOrDashOptions,
};

export const COLUMN_SIGNUPS = {
  label: 'Signups',
  name: 'signups',
  options: digitOrDashOptions,
};

export const COLUMN_CONNECTS = {
  label: 'Connects',
  name: 'connects',
  options: digitOrDashOptions,
};

export const COLUMN_PAYMENTS = {
  label: 'Conversions',
  name: 'conversions',
  options: digitOrDashOptions,
};

export const COLUMN_EARNINGS = {
  label: 'Earnings',
  name: 'earnings',
  type: 'money',
  options: moneyOptions,
};

export const COLUMN_AMOUNT = {
  label: 'Amount',
  name: 'amount',
  type: 'money',
  options: moneyOptions,
};

export const COLUMN_REVENUE = {
  label: 'Revenue',
  name: 'revenue',
  type: 'money',
  options: moneyOptions,
};

export const NotEnough = styled.span`
  color: ${props => props.theme.colors.red};
`;

export const Pending = styled.span`
  color: ${props => props.theme.colors.golden};
`;

export const Paid = styled.span`
  color: ${props => props.theme.colors.emerald};
`;

export const Requested = styled.span`
  color: ${props => props.theme.colors.green};
`;
