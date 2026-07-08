import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

// GET /api/patients
router.get('/', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// POST /api/patients
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, dob, gender, bloodGroup, address, medicalHistory } = req.body;
    const newPatient = await prisma.patient.create({
      data: {
        name: name || 'Unnamed Patient',
        email: email || '',
        phone: phone || '',
        dob: dob || '',
        gender: gender || 'Other',
        bloodGroup: bloodGroup || 'O+',
        address: address || '',
        medicalHistory: medicalHistory || ''
      }
    });
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Error creating patient' });
  }
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, dob, gender, bloodGroup, address, medicalHistory } = req.body;
    const updated = await prisma.patient.update({
      where: { id },
      data: { name, email, phone, dob, gender, bloodGroup, address, medicalHistory }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Error updating patient' });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.patient.delete({ where: { id } });
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Error deleting patient' });
  }
});

export default router;
