import moment from 'moment';
import React from 'react';
import Digits from '../../atoms/Digits';
import Money from '../../atoms/Money';
import Code from '../../atoms/Code';
import Muted from '../../atoms/Muted';

export const digitOptions = {
  setCellProps: () => ({ className: 'right-aligned' }),
  setCellHeaderProps: () => ({ className: 'right-aligned' }),
  customBodyRender: v => <Digits value={v} />,
};

export const codeOptions = {
  customBodyRender: v => <Code>{v}</Code>,
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

export const COLUMN_SUBTRACK = {
  label: 'Subtrack',
  options: {
    customBodyRender: v => v || <Muted>No subtrack</Muted>,
  },
};

export const COLUMN_CAMPAIGN = 'Campaign';

export const COLUMN_AFFILIATE = 'Affiliate';

export const COLUMN_ZIGNALY_ID = 'Zignaly Id';

export const COLUMN_CODE = {
  label: 'Code',
  name: 'code',
  options: codeOptions,
};

export const COLUMN_CLICKS = {
  label: 'Clicks',
  name: 'clicks',
  options: digitOptions,
};

export const COLUMN_SIGNUPS = {
  label: 'Signups',
  name: 'signups',
  options: digitOptions,
};

export const COLUMN_CONVERSIONS = {
  label: 'Conversions',
  name: 'conversions',
  options: digitOptions,
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
