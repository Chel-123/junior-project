import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  UserRole, 
  DatabaseState, 
  AppointmentStatus, 
  BillStatus 
} from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to file-based local database
const DB_PATH = path.join(process.cwd(), 'src', 'db', 'db.json');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initial/Seed Data
const SEED_DATA: DatabaseState = {
  users: [
    {
      id: 'usr-1',
      email: 'admin@hospital.com',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-2',
      email: 'doctor@hospital.com',
      name: 'Dr. Gregory House',
      role: UserRole.DOCTOR,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-3',
      email: 'receptionist@hospital.com',
      name: 'Jane Smith',
      role: UserRole.RECEPTIONIST,
      createdAt: new Date().toISOString()
    }
  ],
  departments: [
    {
      id: 'dept-1',
      name: 'Cardiology',
      description: 'Specialized care for heart, blood vessels, and cardiovascular systems.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'dept-2',
      name: 'Pediatrics',
      description: 'Comprehensive medical care for infants, children, and adolescents.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'dept-3',
      name: 'General Medicine',
      description: 'Primary care, physical assessments, and non-surgical treatment of adult diseases.',
      createdAt: new Date().toISOString()
    }
  ],
  doctors: [
    {
      id: 'doc-1',
      userId: 'usr-2',
      name: 'Dr. Gregory House',
      email: 'house@hospital.com',
      phone: '+1 (555) 123-4567',
      departmentId: 'dept-3',
      specialization: 'Diagnostic Medicine / Nephrology',
      schedule: 'Mon, Tue, Thu 09:00 - 15:00',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doc-2',
      name: 'Dr. Sarah Connor',
      email: 'connor@hospital.com',
      phone: '+1 (555) 234-5678',
      departmentId: 'dept-1',
      specialization: 'Interventional Cardiology',
      schedule: 'Wed, Fri 08:00 - 16:00',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doc-3',
      name: 'Dr. Jane Foster',
      email: 'foster@hospital.com',
      phone: '+1 (555) 345-6789',
      departmentId: 'dept-2',
      specialization: 'Pediatric Endocrinology',
      schedule: 'Mon, Wed 10:00 - 18:00',
      createdAt: new Date().toISOString()
    }
  ],
  patients: [
    {
      id: 'pat-1',
      name: 'John Doe',
      email: 'johndoe@email.com',
      phone: '+1 (555) 987-6543',
      dob: '1985-05-15',
      gender: 'Male',
      bloodGroup: 'O+',
      address: '123 Main St, Springfield',
      medicalHistory: 'Hypertension diagnosed in 2021. Allergy to Penicillin.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pat-2',
      name: 'Mary Jane',
      email: 'maryjane@email.com',
      phone: '+1 (555) 876-5432',
      dob: '1992-09-20',
      gender: 'Female',
      bloodGroup: 'A-',
      address: '456 Elm St, Metropolia',
      medicalHistory: 'Asthma since childhood. No drug allergies.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pat-3',
      name: 'Bruce Wayne',
      email: 'bruce@waynecorp.com',
      phone: '+1 (555) 007-1939',
      dob: '1979-02-19',
      gender: 'Male',
      bloodGroup: 'AB+',
      address: 'Wayne Manor, Gotham City',
      medicalHistory: 'Multiple orthopedic surgeries. Undergoes high stress levels.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pat-4',
      name: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      phone: '+1 (555) 111-2222',
      dob: '1982-06-18',
      gender: 'Male',
      bloodGroup: 'O-',
      address: '344 Clinton St, Metropolis',
      medicalHistory: 'Exceptional physical fitness. No history of disease.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pat-5',
      name: 'Diana Prince',
      email: 'diana@themysis.org',
      phone: '+1 (555) 333-4444',
      dob: '1988-11-10',
      gender: 'Female',
      bloodGroup: 'B+',
      address: 'Gateway City Museum',
      medicalHistory: 'No chronic diseases. Highly active lifestyle.',
      createdAt: new Date().toISOString()
    }
  ],
  appointments: [
    {
      id: 'apt-1',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      date: new Date().toISOString().split('T')[0],
      time: '10:30',
      reason: 'Regular cardiovascular assessment for blood pressure monitoring.',
      status: AppointmentStatus.CONFIRMED,
      notes: 'Patient feels occasional dizziness.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-2',
      patientId: 'pat-2',
      doctorId: 'doc-3',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      reason: 'Follow-up on pediatric breathing patterns.',
      status: AppointmentStatus.PENDING,
      notes: 'Parents requested Dr. Foster.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-3',
      patientId: 'pat-3',
      doctorId: 'doc-2',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
      time: '09:00',
      reason: 'Cardiac stress test.',
      status: AppointmentStatus.COMPLETED,
      notes: 'Completed successfully. Resting heart rate normal.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-4',
      patientId: 'pat-4',
      doctorId: 'doc-1',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      time: '11:15',
      reason: 'Executive wellness exam.',
      status: AppointmentStatus.CONFIRMED,
      notes: 'Routine blood tests ordered.',
      createdAt: new Date().toISOString()
    }
  ],
  medicalRecords: [
    {
      id: 'rec-1',
      patientId: 'pat-3',
      doctorId: 'doc-2',
      appointmentId: 'apt-3',
      symptoms: 'Mild muscular strain around rib cage, exhaustion.',
      diagnosis: 'Acute fatigue and physical overexertion.',
      treatment: 'Mandatory 48-hour bed rest, high hydration.',
      prescription: 'Ibuprofen 400mg twice daily for discomfort.',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }
  ],
  bills: [
    {
      id: 'bill-1',
      patientId: 'pat-3',
      appointmentId: 'apt-3',
      totalAmount: 350.00,
      paidAmount: 350.00,
      status: BillStatus.PAID,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'bill-2',
      patientId: 'pat-1',
      appointmentId: 'apt-1',
      totalAmount: 120.00,
      paidAmount: 0.00,
      status: BillStatus.UNPAID,
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], // 2 weeks
      createdAt: new Date().toISOString()
    }
  ],
  payments: [
    {
      id: 'pay-1',
      billId: 'bill-1',
      amount: 350.00,
      paymentMethod: 'Card',
      paymentDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      transactionId: 'TXN-9823412039',
      createdAt: new Date().toISOString()
    }
  ]
};

// Database helper functions
function readDb(): DatabaseState {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
      return SEED_DATA;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading DB, using initial data:', error);
    return SEED_DATA;
  }
}

function writeDb(data: DatabaseState) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// REST APIs
// 1. Auth Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const db = readDb();
  // Simple matching for university FYP demo credentials
  if (email === 'admin@hospital.com' && password === 'admin123') {
    const adminUser = db.users.find(u => u.role === UserRole.ADMIN);
    return res.json({ user: adminUser, token: 'mock-jwt-admin-token' });
  }

  if (email === 'doctor@hospital.com' && password === 'admin123') {
    const docUser = db.users.find(u => u.role === UserRole.DOCTOR);
    return res.json({ user: docUser, token: 'mock-jwt-doctor-token' });
  }

  if (email === 'receptionist@hospital.com' && password === 'admin123') {
    const recepUser = db.users.find(u => u.role === UserRole.RECEPTIONIST);
    return res.json({ user: recepUser, token: 'mock-jwt-receptionist-token' });
  }

  return res.status(401).json({ message: 'Invalid credentials. Try admin@hospital.com with admin123' });
});

// 2. Patient Management
app.get('/api/patients', (req, res) => {
  const db = readDb();
  res.json(db.patients);
});

app.post('/api/patients', (req, res) => {
  const db = readDb();
  const newPatient = {
    ...req.body,
    id: `pat-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.patients.push(newPatient);
  writeDb(db);
  res.status(201).json(newPatient);
});

app.put('/api/patients/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const idx = db.patients.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Patient not found' });

  db.patients[idx] = { ...db.patients[idx], ...req.body };
  writeDb(db);
  res.json(db.patients[idx]);
});

app.delete('/api/patients/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.patients = db.patients.filter(p => p.id !== id);
  db.appointments = db.appointments.filter(a => a.patientId !== id);
  db.medicalRecords = db.medicalRecords.filter(m => m.patientId !== id);
  db.bills = db.bills.filter(b => b.patientId !== id);
  writeDb(db);
  res.json({ message: 'Patient deleted successfully' });
});

// 3. Doctor Management
app.get('/api/doctors', (req, res) => {
  const db = readDb();
  const response = db.doctors.map(d => {
    const dept = db.departments.find(dept => dept.id === d.departmentId);
    return { ...d, departmentName: dept ? dept.name : 'Unknown' };
  });
  res.json(response);
});

app.post('/api/doctors', (req, res) => {
  const db = readDb();
  const newDoctor = {
    ...req.body,
    id: `doc-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.doctors.push(newDoctor);
  writeDb(db);
  res.status(201).json(newDoctor);
});

app.put('/api/doctors/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const idx = db.doctors.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Doctor not found' });

  db.doctors[idx] = { ...db.doctors[idx], ...req.body };
  writeDb(db);
  res.json(db.doctors[idx]);
});

app.delete('/api/doctors/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.doctors = db.doctors.filter(d => d.id !== id);
  db.appointments = db.appointments.filter(a => a.doctorId !== id);
  writeDb(db);
  res.json({ message: 'Doctor deleted successfully' });
});

// 4. Appointment Management
app.get('/api/appointments', (req, res) => {
  const db = readDb();
  const appointmentsWithInfo = db.appointments.map(a => {
    const patient = db.patients.find(p => p.id === a.patientId);
    const doctor = db.doctors.find(d => d.id === a.doctorId);
    return {
      ...a,
      patientName: patient ? patient.name : 'Unknown Patient',
      doctorName: doctor ? doctor.name : 'Unknown Doctor'
    };
  });
  res.json(appointmentsWithInfo);
});

app.post('/api/appointments', (req, res) => {
  const db = readDb();
  const newApt = {
    ...req.body,
    id: `apt-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.appointments.push(newApt);
  writeDb(db);
  res.status(201).json(newApt);
});

app.put('/api/appointments/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Appointment not found' });

  db.appointments[idx] = { ...db.appointments[idx], ...req.body };
  writeDb(db);
  res.json(db.appointments[idx]);
});

app.delete('/api/appointments/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.appointments = db.appointments.filter(a => a.id !== id);
  writeDb(db);
  res.json({ message: 'Appointment deleted' });
});

// 5. Electronic Medical Records (EMR)
app.get('/api/medical-records', (req, res) => {
  const db = readDb();
  const recordsWithInfo = db.medicalRecords.map(m => {
    const patient = db.patients.find(p => p.id === m.patientId);
    const doctor = db.doctors.find(d => d.id === m.doctorId);
    return {
      ...m,
      patientName: patient ? patient.name : 'Unknown Patient',
      doctorName: doctor ? doctor.name : 'Unknown Doctor'
    };
  });
  res.json(recordsWithInfo);
});

app.post('/api/medical-records', (req, res) => {
  const db = readDb();
  const newRec = {
    ...req.body,
    id: `rec-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.medicalRecords.push(newRec);
  writeDb(db);
  res.status(201).json(newRec);
});

// 6. Departments
app.get('/api/departments', (req, res) => {
  const db = readDb();
  res.json(db.departments);
});

app.post('/api/departments', (req, res) => {
  const db = readDb();
  const newDept = {
    ...req.body,
    id: `dept-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.departments.push(newDept);
  writeDb(db);
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const idx = db.departments.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Department not found' });

  db.departments[idx] = { ...db.departments[idx], ...req.body };
  writeDb(db);
  res.json(db.departments[idx]);
});

app.delete('/api/departments/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.departments = db.departments.filter(d => d.id !== id);
  writeDb(db);
  res.json({ message: 'Department deleted' });
});

// 7. Billing and Payments
app.get('/api/bills', (req, res) => {
  const db = readDb();
  const billsWithInfo = db.bills.map(b => {
    const patient = db.patients.find(p => p.id === b.patientId);
    return {
      ...b,
      patientName: patient ? patient.name : 'Unknown Patient'
    };
  });
  res.json(billsWithInfo);
});

app.post('/api/bills', (req, res) => {
  const db = readDb();
  const newBill = {
    ...req.body,
    id: `bill-${Date.now()}`,
    paidAmount: 0,
    status: BillStatus.UNPAID,
    createdAt: new Date().toISOString()
  };
  db.bills.push(newBill);
  writeDb(db);
  res.status(201).json(newBill);
});

app.post('/api/payments', (req, res) => {
  const db = readDb();
  const { billId, amount, paymentMethod } = req.body;
  const bill = db.bills.find(b => b.id === billId);
  if (!bill) return res.status(404).json({ message: 'Invoice not found' });

  const payment = {
    id: `pay-${Date.now()}`,
    billId,
    amount: Number(amount),
    paymentMethod,
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    createdAt: new Date().toISOString()
  };

  db.payments.push(payment);
  
  // Update bill paid state
  bill.paidAmount = Number(bill.paidAmount) + Number(amount);
  if (bill.paidAmount >= bill.totalAmount) {
    bill.status = BillStatus.PAID;
  } else if (bill.paidAmount > 0) {
    bill.status = BillStatus.PARTIALLY_PAID;
  }

  writeDb(db);
  res.status(201).json({ payment, bill });
});

app.get('/api/payments', (req, res) => {
  const db = readDb();
  res.json(db.payments);
});

// 8. Dashboard Reports & Analytics Endpoint
app.get('/api/reports/dashboard', (req, res) => {
  const db = readDb();
  
  const totalPatients = db.patients.length;
  const totalDoctors = db.doctors.length;
  const totalAppointments = db.appointments.length;
  
  // Total paid revenue
  const totalRevenue = db.payments.reduce((acc, curr) => acc + curr.amount, 0);

  // Recent Patients (sorted by ID or simulated newest)
  const recentPatients = [...db.patients].reverse().slice(0, 5);

  // Recent Appointments (with details)
  const recentAppointments = [...db.appointments].reverse().slice(0, 5).map(a => {
    const p = db.patients.find(x => x.id === a.patientId);
    const d = db.doctors.find(x => x.id === a.doctorId);
    return {
      ...a,
      patientName: p ? p.name : 'Unknown',
      doctorName: d ? d.name : 'Unknown'
    };
  });

  // Simple monthly Revenue aggregation
  const revenueChartData = [
    { name: 'Jan', revenue: 2400 },
    { name: 'Feb', revenue: 3100 },
    { name: 'Mar', revenue: 4500 },
    { name: 'Apr', revenue: 3800 },
    { name: 'May', revenue: 5200 },
    { name: 'Jun', revenue: totalRevenue + 1000 } // Dynamic add for our current session
  ];

  // Appointment Status aggregation chart data
  const appointmentChartData = [
    { name: 'Confirmed', value: db.appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length },
    { name: 'Pending', value: db.appointments.filter(a => a.status === AppointmentStatus.PENDING).length },
    { name: 'Completed', value: db.appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length },
    { name: 'Cancelled', value: db.appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length },
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
});

// Initialize Vite server for asset handling and hot reload integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HMS Server successfully booted on http://localhost:${PORT}`);
  });
}

startServer();
