import { Router } from 'express';
import healthRouter from './health.route';
import authRouter from './authRoutes';
import toolRouter from './toolRoutes';
import fileRouter from './fileRoutes';
import historyRouter from './historyRoutes';
import userRouter from './userRoutes';
import adminRouter from './adminRoutes';
import notificationRouter from './notificationRoutes';
import googleDriveRouter from './googleDriveRoutes';
import cloudRouter from './cloudRoutes';
import feedbackRouter from './feedbackRoutes';
import websiteRouter from './websiteRoutes';

const router = Router();

// Mount individual sub-routers
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/tools', toolRouter);
router.use('/files', fileRouter);
router.use('/history', historyRouter);
router.use('/users', userRouter);
router.use('/admin', adminRouter);
router.use('/notifications', notificationRouter);
router.use('/drive', googleDriveRouter);
router.use('/cloud', cloudRouter);
router.use('/feedback', feedbackRouter);
router.use('/websites', websiteRouter);

export default router;
