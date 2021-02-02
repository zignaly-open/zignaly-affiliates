# Zignaly Affiliate Platform

### Running it locally

- `npm install`
- `cp .env.sample .env` & modify the .env file to use your mongo and postgres instances, etc
- `npm start`

### Cronjobs
- `npm run cron` - pulls the data from the postgres db that you have hopefully had added to the .env file, deletes all existing chains and re-creates chains using the data from postgres
- `npm run cron-payout` - creates payouts for all outstanding payable balances


### Tests and code quality
- `npm test` to run the full test suite
- `npm run test-no-upload` to run all tests except for the upload one which takes a few seconds
- `npm run test-debug` same as above but with no timeouts to debug as long as your heart desires
- `npm run lint` run linter without autofix
- `npm run lint-fix` run linter with autofix


### Relation between entities

- `Chain`
    * `merchant` points to `User`
    * `affiliate` points to `User`
    * `campaign` points to `Campaign`
    * `dispute` points to `Dispute`
- `User`
    * `logoUrl` points to `Upload`
- `Campaign`
    * `merchant` points to `User`
    * `affiliates[].user` points to `User`
    * `media[]` points to `Upload`
- `Dispute`
    * `merchant` points to `User`
    * `affiliate` points to `User`
    * `campaign` points to `Campaign`
- `Payout`
    * `merchant` points to `User`
    * `affiliate` points to `User`
    * `campaign` points to `Campaign`
- `Upload`
    * `user` points to `User`
