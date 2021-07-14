import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChainSchema = new Schema({
  externalUserId: String,
  externalServiceId: String,
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  affiliate: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  // all amounts are in CENTS
  totalPaid: Number,
  affiliateReward: Number,
  // depending on campaign type, it is either the amoutn of months or $ that went into the affiliateReward calculation
  affiliateRewardBase: Number,
  visit: {
    id: String,
    subtrack: String,
    date: Date,
  },
  dispute: {
    type: Schema.Types.ObjectId,
    ref: 'Dispute',
  },
});

ChainSchema.index({ merchant: 1 }, {});
ChainSchema.index({ affiliate: 1 }, {});

const Chain = mongoose.model('Chain', ChainSchema);

export default Chain;
