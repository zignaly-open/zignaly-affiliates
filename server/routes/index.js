import userRoutes from './user';

export default app => {
  app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/ping', (req, res) => res.json({ message: 'pong' }));
};
