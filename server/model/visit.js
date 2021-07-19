import mongoose from 'mongoose';

const { Schema } = mongoose;

const VisitSchema = new Schema({
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
  visit: {
    id: String,
    subtrack: String,
    date: Date,
  },
});

VisitSchema.index({ merchant: 1 }, {});
VisitSchema.index({ affiliate: 1 }, {});

const Visit = mongoose.model('Visit', VisitSchema);

export default Visit;
