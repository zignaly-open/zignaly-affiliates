import '../service/trim-mongoose-errors-plugin';
import * as databaseHandler from './mongo-mock';
import { request, getMerchantAndAffiliateAndStuff } from './_common';

describe('User', function () {
  before(databaseHandler.connect);
  afterEach(databaseHandler.clearDatabase);
  after(databaseHandler.closeDatabase);

  it('should not let regular users see admin', async function () {
    const { affiliateToken } = await getMerchantAndAffiliateAndStuff();
    await request('get', `admin/users`, affiliateToken).expect(403);
  });
});
