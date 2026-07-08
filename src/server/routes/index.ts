import { Router } from 'express';
import authRouter from './auth';
import patientsRouter from './patients';
import doctorsRouter from './doctors';
import appointmentsRouter from './appointments';
import medicalRecordsRouter from './medicalRecords';
import departmentsRouter from './departments';
import billingRouter from './billing';
import dashboardRouter from './dashboard';

const router = Router();

router.use('/auth', authRouter);
router.use('/patients', patientsRouter);
router.use('/doctors', doctorsRouter);
router.use('/appointments', appointmentsRouter);
router.use('/medical-records', medicalRecordsRouter);
router.use('/departments', departmentsRouter);
router.use('/', billingRouter);
router.use('/', dashboardRouter);

export default router;
