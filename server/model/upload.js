import mongoose from 'mongoose';

const { Schema } = mongoose;

const UploadSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  mimetype: String,
  url: String,
  size: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

const Upload = mongoose.model('Upload', UploadSchema);

export default Upload;
