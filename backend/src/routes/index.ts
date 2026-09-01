import { Router } from 'express';
import healthRouter from './health.route';

const router = Router();

// Mount individual sub-routers
router.use('/health', healthRouter);

export default router;
