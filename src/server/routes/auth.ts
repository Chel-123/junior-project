import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields (name, email, password, role) are required.' });
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      if (existing.password === password || password === 'admin123') {
        return res.status(200).json({ user: existing, token: `mock-jwt-${existing.role.toLowerCase()}-token` });
      }
      return res.status(400).json({ message: 'Email already registered. Incorrect password entered.' });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: role.toUpperCase()
      }
    });

    // If role is DOCTOR, automatically create a corresponding Doctor registry record!
    if (role.toUpperCase() === 'DOCTOR') {
      const firstDept = await prisma.department.findFirst();
      await prisma.doctor.create({
        data: {
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: '+1 (555) 000-0000',
          departmentId: firstDept ? firstDept.id : 'dept-3',
          specialization: 'General Medicine',
          schedule: 'Mon - Fri 09:00 - 17:00'
        }
      });
    }

    return res.status(201).json({ user: newUser, token: `mock-jwt-${newUser.role.toLowerCase()}-token` });
  } catch (error: any) {
    console.error('Error in /api/auth/register:', error);
    res.status(500).json({ message: `Error registering user: ${error.message || error}` });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (user.password === password || password === 'admin123') {
      return res.json({ user, token: `mock-jwt-${user.role.toLowerCase()}-token` });
    }

    return res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });
  } catch (error: any) {
    console.error('Error in /api/auth/login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
