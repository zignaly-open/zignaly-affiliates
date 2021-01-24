export const PAYOUT_STATUSES = {
  NOT_ENOUGH: 'NOT_ENOUGH',
  ENOUGH_BUT_NO_PAYOUT: 'ENOUGH_BUT_NO_PAYOUT',
  CAN_CHECKOUT: 'CAN_CHECKOUT',
  REJECTED: 'REJECTED',
  REQUESTED: 'REQUESTED',
  PAID: 'PAID',
};

export const CONVERSION_STATUSES = {
  COMPLETE: 'COMPLETE',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
};

export const PAYOUT_TYPE_OPTIONS_MERCHANT = [
  { value: 0, label: 'All types' },
  { value: PAYOUT_STATUSES.NOT_ENOUGH, label: 'Min not reached' },
  { value: PAYOUT_STATUSES.REQUESTED, label: 'Requested' },
  { value: PAYOUT_STATUSES.PAID, label: 'Paid' },
];

export const PAYOUT_TYPE_OPTIONS_AFFILIATE = [
  ...PAYOUT_TYPE_OPTIONS_MERCHANT,
  { value: PAYOUT_STATUSES.CAN_CHECKOUT, label: 'Pending' },
];

export const CONVERSION_TYPE_OPTIONS = [
  { value: 0, label: 'All types' },
  { value: CONVERSION_STATUSES.PENDING, label: 'Pending' },
  { value: CONVERSION_STATUSES.REJECTED, label: 'Disapproved' },
  { value: CONVERSION_STATUSES.COMPLETE, label: 'Approved' },
];
