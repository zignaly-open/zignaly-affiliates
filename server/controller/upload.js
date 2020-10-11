import Upload from '../model/upload';

export const handleUpload = async (req, res) => {
  const { user, file } = req;
  if (file.name === 'Error') {
    res.status(400).json({ errors: { media: file.message } });
  } else {
    await new Upload({ ...file, user: user._id }).save();
    res.json(file);
  }
};
