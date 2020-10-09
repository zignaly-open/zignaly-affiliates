import userRoutes from './user';
import dashboardRoutes from './dashboard';

export default app => {
  app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/ping', (req, res) => res.json({ message: 'pong' }));
};
