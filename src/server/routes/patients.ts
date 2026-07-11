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

    // Automatically find or create a default doctor to assign to this initial EMR
    let defaultDoctor = await prisma.doctor.findFirst();
    if (!defaultDoctor) {
      const defaultDept = await prisma.department.findFirst() || await prisma.department.create({
        data: { id: 'dept-1', name: 'General Medicine', description: 'Primary Care' }
      });
      defaultDoctor = await prisma.doctor.create({
        data: {
          id: 'doc-1',
          name: 'Dr. Gregory House',
          email: 'house@hospital.com',
          phone: '+237 677-123-456',
          departmentId: defaultDept.id,
          specialization: 'Diagnostic Medicine / Nephrology',
          schedule: 'Mon, Tue, Thu 09:00 - 15:00'
        }
      });
    }

    // Automatically create a baseline medical record entry for the newly added patient
    await prisma.medicalRecord.create({
      data: {
        patientId: newPatient.id,
        doctorId: defaultDoctor.id,
        symptoms: 'Initial intake baseline profiling & diagnostic scan.',
        diagnosis: `Routine entry assessment completed. General condition stable. Initial blood group noted as ${newPatient.bloodGroup}.`,
        treatment: 'N/A. Periodic bi-annual general screening advised.',
        prescription: 'N/A',
        date: new Date().toISOString().split('T')[0]
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
