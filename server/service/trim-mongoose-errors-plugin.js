import mongoose from 'mongoose';

function cutExtraInfoFromErrors(error, document, next) {
  /* eslint-disable no-param-reassign */
  if (error.name === 'ValidationError' && error.errors) {
    error.errors = Object.entries(error.errors).reduce(
      (memo, [k, v]) => ({ ...memo, [k]: v.message }),
      {},
    );
  }
  next(error);
}

function trimMongooseErrors(schema) {
  schema.post('save', cutExtraInfoFromErrors);
  schema.post('update', cutExtraInfoFromErrors);
  schema.post('findOneAndUpdate', cutExtraInfoFromErrors);
  schema.post('insertMany', cutExtraInfoFromErrors);

  return schema;
}

mongoose.plugin(trimMongooseErrors);
