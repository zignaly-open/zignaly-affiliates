import mongoose from 'mongoose';

const {
  Types: { ObjectId },
} = mongoose;

// I should've just added the create date in the user model...

export const objectIdToTimestamp = objectId =>
  Number.parseInt(objectId.toString().slice(0, 8), 16) * 1000;

export const timestampToObjectId = timestamp => {
  let time = Math.round(timestamp / 1000).toString(16);
  time += new Array(24 - time.length + 1).join('0');
  return ObjectId(time);
};
