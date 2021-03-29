import mongoose from 'mongoose';

const { Schema } = mongoose;

const DisputeSchema = new Schema({
  date: Date,
  externalUserId: String,
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
  text: String,
});

DisputeSchema.index(
  { campaign: 1, externalUserId: 1, affiliate: 1 },
  { unique: true },
);

const Dispute = mongoose.model('Dispute', DisputeSchema);

export default Dispute;
