import assert from 'assert';
import {
  createCampaign,
  getAffiliateToken,
  getMerchantToken,
  me,
  request,
} from './_common';
import * as databaseHandler from './mongo-mock';
import {
  calculateAffiliateReward,
  getChainData,
} from '../service/chain-processor';
import { SERVICE_TYPES } from '../model/campaign';

describe('Payouts', function () {
  // can't payout
  // payout
  // flow
  it('should let affs ask for payouts', async function () {
    assert(true);
  });

  it('should not let affs ask for payouts when the condition is not met', async function () {
    assert(true);
  });

  it('should not let merchs submit payouts', async function () {
    assert(true);
  });

  it('should go through the entire flow', async function () {
    assert(true);
  });
});
