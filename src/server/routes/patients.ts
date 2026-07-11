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

    // Automatically find and assign a random doctor from the full list of specialists (not just Dr. House)
    const doctors = await prisma.doctor.findMany();
    let assignedDoctor = doctors[0];
    if (!assignedDoctor) {
      const defaultDept = await prisma.department.findFirst() || await prisma.department.create({
        data: { id: 'dept-3', name: 'General Medicine', description: 'Primary Care' }
      });
      assignedDoctor = await prisma.doctor.create({
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
    } else if (doctors.length > 1) {
      // Pick a random doctor so that patients are distributed and attended to by different specialists
      const randomIndex = Math.floor(Math.random() * doctors.length);
      assignedDoctor = doctors[randomIndex];
    }

    // Automatically create a baseline medical record entry for the newly added patient
    await prisma.medicalRecord.create({
      data: {
        patientId: newPatient.id,
        doctorId: assignedDoctor.id,
        symptoms: 'Initial intake baseline profiling & general physical evaluation.',
        diagnosis: `Routine clinical assessment completed by ${assignedDoctor.name}. General physical condition stable. Vital signs within normal parameters. Blood group ${newPatient.bloodGroup} logged. Initial history: ${newPatient.medicalHistory || 'No previous significant illnesses reported'}.`,
        treatment: 'No active clinical treatment required. Scheduled for standard bi-annual general health screening.',
        prescription: 'N/A - General Wellness Advice given.',
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
