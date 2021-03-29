import mongoose from 'mongoose';

const { Schema } = mongoose;

export const SERVICE_TYPES = {
  MONTHLY_FEE: 'MONTHLY_FEE',
  PROFIT_SHARING: 'PROFIT_SHARING',
};

export const DISCOUNT_TYPES = {
  EXTRA_LIFE: 'EXTRA_LIFE',
  PERCENT: 'PERCENT',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
};

export const FIELDS_THAT_ARE_NOT_EDITABLE_AFTER_AFFILIATE_APPEARS = [
  'rewardValue',
  'rewardDurationMonths',
  'rewardThreshold',
  'serviceType',
  'zignalyServiceIds',
];

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
    },
    merchant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: 'A campaign should have an owner',
    },
    affiliates: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        discountCodes: [
          {
            subtrack: {
              type: String,
              required: 'Required',
            },
            date: {
              type: Date,
              default: Date.now,
            },
            code: {
              type: String,
              required: 'Required',
            },
          },
        ],
        isArchived: Boolean,
        shortLink: String,
        // and whatever info we need goes here
        // should work for now
        select: false,
      },
    ],
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
    },
    serviceType: {
      type: String,
      required: 'Required',
      validate: validateOneOf(SERVICE_TYPES, 'Reward type'),
    },
    landingPage: {
      type: String,
      required: 'Required',
    },
    termsAndConditions: {
      type: String,
      required: 'Required',
    },
    zignalyServiceIds: {
      type: [String],
      required: 'Required',
      validate: {
        validator: n => n && n.length > 0,
        message: 'There should be at least one service id',
      },
    },
    media: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Upload',
        },
      ],
    },
    // may be either a percent if serviceType === SERVICE_TYPE_PROFIT_SHARING or a number of cents
    rewardValue: {
      type: Number,
      required: 'Required',
      validate: {
        validator: n => n > 0,
        message: 'Reward <= 0',
      },
    },
    rewardThreshold: {
      type: Number,
      required: 'Required',
      validate: {
        validator: n => n >= 0,
        message: 'Threshold < 0',
      },
    },
    rewardDurationMonths: {
      type: Number,
    },

    discountCodes: {
      type: [
        {
          code: {
            type: String,
            required: 'Code is required',
            validate: {
              validator: n => n && n.length >= 4,
              message: 'Should be 4+ characters',
            },
          },
          value: {
            type: Number,
            required: 'Discount value is required',
            validate: {
              validator: n => n > 0,
              message: 'Value <= 0',
            },
          },
          type: {
            type: String,
            required: 'Discount type is required',
            validate: validateOneOf(DISCOUNT_TYPES, 'Discount type'),
          },
        },
      ],
      validate: {
        validator(codes) {
          return new Set(codes.map(x => x.code)).size === codes.length;
        },
        message: `You have duplicate discount codes`,
      },
    },

    deletedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model('Campaign', CampaignSchema);
