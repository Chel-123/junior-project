import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { prisma, ensureSeeded } from './src/db/prisma';
import { UserRole, AppointmentStatus, BillStatus } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Auth Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check for demo credentials or DB users
    if (password === 'admin123') {
      const user = await prisma.user.findFirst({ where: { email } });
      if (user) {
        return res.json({ user, token: `mock-jwt-${user.role.toLowerCase()}-token` });
      }
    }

    const matchedUser = await prisma.user.findFirst({ where: { email } });
    if (matchedUser) {
      return res.json({ user: matchedUser, token: 'mock-jwt-token' });
    }

    return res.status(401).json({ message: 'Invalid credentials. Try admin@hospital.com with admin123' });
  } catch (error: any) {
    console.error('Error in /api/auth/login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. Patient Management
app.get('/api/patients', async (req, res) => {
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

app.post('/api/patients', async (req, res) => {
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

app.put('/api/patients/:id', async (req, res) => {
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

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.patient.delete({ where: { id } });
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Error deleting patient' });
  }
});

// 3. Doctor Management
app.get('/api/doctors', async (req, res) => {
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

app.post('/api/doctors', async (req, res) => {
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

app.put('/api/doctors/:id', async (req, res) => {
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

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.doctor.delete({ where: { id } });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Error deleting doctor' });
  }
});

// 4. Appointment Management
app.get('/api/appointments', async (req, res) => {
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

app.post('/api/appointments', async (req, res) => {
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

app.put('/api/appointments/:id', async (req, res) => {
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

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

// 5. Electronic Medical Records (EMR)
app.get('/api/medical-records', async (req, res) => {
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

app.post('/api/medical-records', async (req, res) => {
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

// 6. Departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments' });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newDept = await prisma.department.create({
      data: { name, description }
    });
    res.status(201).json(newDept);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Error creating department' });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updated = await prisma.department.update({
      where: { id },
      data: { name, description }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Error updating department' });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id } });
    res.json({ message: 'Department deleted' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Error deleting department' });
  }
});

// 7. Billing and Payments
app.get('/api/bills', async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: { patient: true },
      orderBy: { createdAt: 'desc' }
    });
    const response = bills.map(b => ({
      ...b,
      patientName: b.patient ? b.patient.name : 'Unknown Patient'
    }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const { patientId, appointmentId, totalAmount, dueDate } = req.body;
    const newBill = await prisma.bill.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        totalAmount: Number(totalAmount),
        paidAmount: 0.0,
        status: 'UNPAID',
        dueDate
      },
      include: { patient: true }
    });
    res.status(201).json({
      ...newBill,
      patientName: newBill.patient ? newBill.patient.name : 'Unknown Patient'
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ message: 'Error creating bill' });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const { billId, amount, paymentMethod } = req.body;
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const payAmount = Number(amount);
    const newPaidAmount = bill.paidAmount + payAmount;
    let newStatus = bill.status;
    if (newPaidAmount >= bill.totalAmount) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const txnId = `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const [payment, updatedBill] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          billId,
          amount: payAmount,
          paymentMethod,
          paymentDate: todayStr,
          transactionId: txnId
        }
      }),
      prisma.bill.update({
        where: { id: billId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus
        }
      })
    ]);

    res.status(201).json({ payment, bill: updatedBill });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Error recording payment' });
  }
});

app.get('/api/payments', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// 8. Dashboard Reports & Analytics Endpoint
app.get('/api/reports/dashboard', async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      payments,
      recentPatients,
      recentAppointmentsList,
      allAppointments
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.payment.findMany(),
      prisma.patient.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, doctor: true }
      }),
      prisma.appointment.findMany()
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    const recentAppointments = recentAppointmentsList.map(a => ({
      ...a,
      patientName: a.patient ? a.patient.name : 'Unknown',
      doctorName: a.doctor ? a.doctor.name : 'Unknown'
    }));

    const revenueChartData = [
      { name: 'Jan', revenue: 2400 },
      { name: 'Feb', revenue: 3100 },
      { name: 'Mar', revenue: 4500 },
      { name: 'Apr', revenue: 3800 },
      { name: 'May', revenue: 5200 },
      { name: 'Jun', revenue: totalRevenue + 1000 }
    ];

    const appointmentChartData = [
      { name: 'Confirmed', value: allAppointments.filter(a => a.status === 'CONFIRMED').length },
      { name: 'Pending', value: allAppointments.filter(a => a.status === 'PENDING').length },
      { name: 'Completed', value: allAppointments.filter(a => a.status === 'COMPLETED').length },
      { name: 'Cancelled', value: allAppointments.filter(a => a.status === 'CANCELLED').length }
    ];

    res.json({
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue
      },
      recentPatients,
      recentAppointments,
      revenueChartData,
      appointmentChartData
    });
  } catch (error) {
    console.error('Error generating dashboard reports:', error);
    res.status(500).json({ message: 'Error generating reports' });
  }
});

// Initialize Vite server for asset handling and hot reload integration
async function startServer() {
  // Ensure database has seed data on startup
  await ensureSeeded();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`HMS Server successfully booted on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
