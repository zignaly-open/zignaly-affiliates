# Fee calculation and attribution

## Fee Calculation

Consider the following sets of payments:

Regular payments:

```
[
  {
    event_date: '2020-01-01T10:00:00.923Z',
    quantity: '2',
    amount: '80.00',
  },
  {
    event_date: '2020-01-15T10:00:00.923Z',
    quantity: '2',
    amount: '80.00',
  },
  {
    event_date: '2020-02-15T10:00:00.923Z',
    quantity: '1',
    amount: '50.00',
  },
  {
    event_date: '2020-03-03T10:00:00.923Z',
    quantity: '3',
    amount: '120.00',
  },
]
```

Profit-sharing payments:

```
[
  {
    event_date: '2020-01-01T10:00:00.923Z',
    amount: '80.00',
  },
  {
    event_date: '2020-01-15T10:00:00.923Z',
    amount: '80.00',
  },
  {
    event_date: '2020-02-15T10:00:00.923Z',
    amount: '50.00',
  },
  {
    event_date: '2020-03-03T10:00:00.923Z',
    amount: '120.00',
  },
]
```

- Campaign: monthly, $1/mo for 1 month. Expected reward for the Regular payments list: $1.

- Campaign: monthly, $1/mo for 1 month. Expected reward for the Profit-sharing payments list: $1.

- Campaign: monthly, $1/mo for 3 months. Expected reward for the Regular payments list: $3.

- Campaign: monthly, $1/mo for 2 months. Expected reward for the Profit-sharing payments list: $2.

- Campaign: monthly, $1/mo for lifetime. Expected reward for the Regular payments list: $8.

- Campaign: monthly, $1/mo for lifetime. Expected reward for the Profit-sharing payments list: $3.

- Campaign: profit-sharing, 10% for 2 months. Expected reward for the Profit-sharing payments list: $21.

- Campaign: profit-sharing, 10% for lifetime. Expected reward for the Profit-sharing payments list: $33.


## Attribution

Basic flow
- Create Merchant, Affiliate accounts
- Create Campaign, Affiliate becomes an active affiliate
- Campaign receives the Regular Payments list as payments
