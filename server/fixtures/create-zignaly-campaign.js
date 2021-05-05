import mongoose from 'mongoose';
import User from '../model/user';
import Campaign, { SERVICE_TYPES } from '../model/campaign';
import '../model/upload';
import { MONGO_URL } from '../config';
// Connect to database
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;

(async () => {
  const existingSystemCampaign = !!(await Campaign.findOne({ isSystem: true }));
  const adminUser = await User.findOne({ email: 'strrife+merchant@gmail.com' });
  if (!existingSystemCampaign) {
    adminUser.isAdmin = true;
    await adminUser.save();
    await new Campaign({
      isSystem: true,
      shortDescription: 'Zignaly campaign',
      rewardDurationMonths: 1,
      rewardThreshold: 100,
      rewardValue: 10,
      landingPage: '/',
      name: 'Zignaly campaign',
      serviceType: SERVICE_TYPES.MONTHLY_FEE,
      merchant: adminUser,
      investedThreshold: 100,
    }).save();
  }
  process.exit(0);
})();
