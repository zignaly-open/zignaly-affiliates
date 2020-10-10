import Digits from "../../atoms/Digits";
import Money from "../../atoms/Money";
import moment from "moment";
import Muted from "../../atoms/Muted";
import React from "react";

export const digitOptions = {
  setCellProps: () => ({ className: 'right-aligned' }),
  setCellHeaderProps: () => ({ className: 'right-aligned' }),
  customBodyRender: v => <Digits value={v} />,
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
  label: 'Day',
  options: {
    customBodyRender: v => v || <Muted>No subtrack</Muted>,
  },
};

export const COLUMN_CAMPAIGN = 'Campaign';

export const COLUMN_ZIGNALY_ID = 'Zignaly Id';

export const COLUMN_CODE = 'Code';

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