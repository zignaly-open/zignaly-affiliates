export default app => {
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'ok bro' });
  });
};
