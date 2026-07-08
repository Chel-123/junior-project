import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

// GET /api/medical-records
router.get('/', async (req, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: { patient: true, doctor: true },
      orderBy: { createdAt: 'desc' }
    });
    const response = records.map(m => ({
      ...m,
      patientName: m.patient ? m.patient.name : 'Unknown Patient',
      doctorName: m.doctor ? m.doctor.name : 'Unknown Doctor'
    }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ message: 'Error fetching medical records' });
  }
});

// POST /api/medical-records
router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, symptoms, diagnosis, treatment, prescription, date } = req.body;
    const newRec = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        symptoms,
        diagnosis,
        treatment,
        prescription,
        date: date || new Date().toISOString().split('T')[0]
      },
      include: { patient: true, doctor: true }
    });
    res.status(201).json({
      ...newRec,
      patientName: newRec.patient ? newRec.patient.name : 'Unknown Patient',
      doctorName: newRec.doctor ? newRec.doctor.name : 'Unknown Doctor'
    });
  } catch (error) {
    console.error('Error adding medical record:', error);
    res.status(500).json({ message: 'Error adding medical record' });
  }
});

export default router;
