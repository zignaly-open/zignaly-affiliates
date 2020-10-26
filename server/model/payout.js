import mongoose from 'mongoose';

const { Schema } = mongoose;

const PayoutSchema = new Schema({
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
  amount: Number,
  status: String,
  requestedAt: Date,
  paidAt: Date,
});

const Payout = mongoose.model('Payout', PayoutSchema);

export default Payout;

export const PAYOUT_STATUSES = {
  NOT_ENOUGH: 'NOT_ENOUGH',
  CAN_CHECKOUT: 'CAN_CHECKOUT',
  REQUESTED: 'REQUESTED',
  PAID: 'PAID',
};
