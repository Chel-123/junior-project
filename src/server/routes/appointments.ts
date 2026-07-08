import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

// GET /api/appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { patient: true, doctor: true },
      orderBy: { createdAt: 'desc' }
    });
    const response = appointments.map(a => ({
      ...a,
      patientName: a.patient ? a.patient.name : 'Unknown Patient',
      doctorName: a.doctor ? a.doctor.name : 'Unknown Doctor'
    }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason, status, notes } = req.body;
    const newApt = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date,
        time,
        reason,
        status: status || 'PENDING',
        notes: notes || ''
      },
      include: { patient: true, doctor: true }
    });
    res.status(201).json({
      ...newApt,
      patientName: newApt.patient ? newApt.patient.name : 'Unknown Patient',
      doctorName: newApt.doctor ? newApt.doctor.name : 'Unknown Doctor'
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Error booking appointment' });
  }
});

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, date, time, reason } = req.body;
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status, notes, date, time, reason },
      include: { patient: true, doctor: true }
    });
    res.json({
      ...updated,
      patientName: updated.patient ? updated.patient.name : 'Unknown Patient',
      doctorName: updated.doctor ? updated.doctor.name : 'Unknown Doctor'
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

export default router;
