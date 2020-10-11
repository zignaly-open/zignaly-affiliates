import mongoose from 'mongoose';

const { Schema } = mongoose;

export const SERVICE_TYPES = {
  MONTHLY_FEE: 'MONTHLY_FEE',
  PROFIT_SHARING: 'PROFIT_SHARING',
};

export const REWARD_TYPES = {
  DURATION: 'DURATION',
  PERCENT: 'PERCENT',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
};

export const DISCOUNT_TYPES = {
  EXTRA_LIFE: 'EXTRA_LIFE',
  PERCENT: 'PERCENT',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
};

const validateOneOf = (oneOfWhat, name) => [
  v => !!v && oneOfWhat[v] === v,
  `${name} should be one of ${Object.keys(oneOfWhat).join(', ')}`,
];

const CampaignSchema = new Schema(
  {
    publish: Boolean,
    name: {
      type: String,
      required: 'Name is required',
    }, // TODO
    merchant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: 'A campaign should have an owner',
    },
    shortDescription: {
      type: String,
      required: 'Required',
      validate: {
        validator: n => n && n.length <= 150,
        message: 'Should not be more than 150 characters',
      },
    },
    description: {
      type: String,
      required: 'Required',
    },
    serviceType: {
      type: String,
      required: 'Required',
      validate: validateOneOf(SERVICE_TYPES, 'Service type'),
    },
    landingPage: {
      type: String,
      required: 'Required',
    },
    zignalyServiceId: {
      type: String,
      required: 'Required',
    },
    media: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Upload',
        },
      ],
      validate: [v => !!v && v.length > 0, 'No media attached'],
    },
    rewardType: {
      type: String,
      required: 'Required',
      validate: validateOneOf(REWARD_TYPES, 'Reward type'),
    },
    rewardValue: {
      type: Number,
      required: 'Required',
      validate: {
        validator: n => n >= 0,
        message: 'Reward < 0',
      },
    },

    discountCodes: [
      {
        code: {
          type: String,
          validate: {
            validator: n => n && n.length >= 4,
            message: 'Should be 4+ characters',
          },
        },
        value: {
          type: Number,
          validate: {
            validator: n => n > 0,
            message: 'Value <= 0',
          },
        },
        type: {
          type: String,
          validate: validateOneOf(DISCOUNT_TYPES, 'Discount type'),
        },
      },
    ],

    deletedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model('Campaign', CampaignSchema);
