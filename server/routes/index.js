import userRoutes from './user';
import dashboardRoutes from './dashboard';
import uploadRoutes from './upload';
import campaignRoutes from './campaign';
import paymentRoutes from './payments';
import redirectRoutes from './redirect';
import codeRoutes from './codes';
import adminRoutes from './admin';
import { isAdmin, isAuthenticated } from '../middleware/auth';

export default app => {
  app.use('/api/v1/campaign', isAuthenticated(), campaignRoutes);
  app.use('/api/v1/payments', isAuthenticated(), paymentRoutes);
  app.use('/api/v1/code', codeRoutes);
  app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/upload', uploadRoutes);
  app.use('/api/v1/admin', isAuthenticated(), isAdmin(), adminRoutes);
  app.use('/r', redirectRoutes);
  app.use('/api/v1/ping', (req, res) => res.json({ message: 'pong' }));
};
