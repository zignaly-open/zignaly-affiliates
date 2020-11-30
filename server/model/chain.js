import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChainSchema = new Schema({
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
  visit: {
    id: String,
    subtrack: String,
    date: Date,
  },
});

const Chain = mongoose.model('Chain', ChainSchema);

export default Chain;
