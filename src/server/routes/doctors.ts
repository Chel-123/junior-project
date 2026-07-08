import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

// GET /api/doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' }
    });
    const response = doctors.map(d => ({
      ...d,
      departmentName: d.department ? d.department.name : 'Unknown'
    }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// POST /api/doctors
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, departmentId, specialization, schedule, userId } = req.body;
    const newDoctor = await prisma.doctor.create({
      data: {
        name,
        email,
        phone,
        departmentId,
        specialization,
        schedule,
        userId: userId || null
      },
      include: { department: true }
    });
    res.status(201).json({
      ...newDoctor,
      departmentName: newDoctor.department ? newDoctor.department.name : 'Unknown'
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor' });
  }
});

// PUT /api/doctors/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, departmentId, specialization, schedule } = req.body;
    const updated = await prisma.doctor.update({
      where: { id },
      data: { name, email, phone, departmentId, specialization, schedule },
      include: { department: true }
    });
    res.json({
      ...updated,
      departmentName: updated.department ? updated.department.name : 'Unknown'
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Error updating doctor' });
  }
});

// DELETE /api/doctors/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.doctor.delete({ where: { id } });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Error deleting doctor' });
  }
});

export default router;
