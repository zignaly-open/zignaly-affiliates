import userRoutes from './user';

export default app => {
  app.use('/user', userRoutes);
  app.use('/ping', (req, res) => res.json({ message: 'pong' }));
};
