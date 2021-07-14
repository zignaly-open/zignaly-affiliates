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
  // In Cents
  amount: Number,
  transactionId: String,
  note: String,
  status: String,
  method: String,
  requestedAt: Date,
  paidAt: Date,
});

const Payout = mongoose.model('Payout', PayoutSchema);

export default Payout;

export const PAYOUT_STATUSES = {
  NOT_ENOUGH: 'NOT_ENOUGH',
  CAN_CHECKOUT: 'CAN_CHECKOUT',
  ENOUGH_BUT_NO_PAYOUT: 'ENOUGH_BUT_NO_PAYOUT',
  REQUESTED: 'REQUESTED',
  PAID: 'PAID',
};
