import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  User, 
  Department, 
  Doctor, 
  Patient, 
  Appointment, 
  MedicalRecord, 
  Bill, 
  Payment, 
  AppointmentStatus 
} from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import PatientsView from './components/PatientsView';
import DoctorsView from './components/DoctorsView';
import AppointmentsView from './components/AppointmentsView';
import MedicalRecordsView from './components/MedicalRecordsView';
import BillingView from './components/BillingView';
import DepartmentsView from './components/DepartmentsView';
import ReportsView from './components/ReportsView';
import { 
  ShieldCheck, 
  Activity, 
  Heart, 
  Unlock, 
  LogOut, 
  UserCircle,
  UserPlus,
  Lock
} from 'lucide-react';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Core Database States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Analytical indicators for overview
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0
  });

  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [appointmentChartData, setAppointmentChartData] = useState<any[]>([]);

  // simulated auth states
  const [loginEmail, setLoginEmail] = useState('admin@hospital.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [authError, setAuthError] = useState('');

  // registration states
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>(UserRole.DOCTOR);

  // 1. Fetch entire database from API backend
  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      const [
        resPat, 
        resDoc, 
        resApt, 
        resRec, 
        resDept, 
        resBill, 
        resPay, 
        resReport
      ] = await Promise.all([
        fetch('/api/patients').then(r => r.json()),
        fetch('/api/doctors').then(r => r.json()),
        fetch('/api/appointments').then(r => r.json()),
        fetch('/api/medical-records').then(r => r.json()),
        fetch('/api/departments').then(r => r.json()),
        fetch('/api/bills').then(r => r.json()),
        fetch('/api/payments').then(r => r.json()),
        fetch('/api/reports/dashboard').then(r => r.json())
      ]);

      setPatients(resPat);
      setDoctors(resDoc);
      setAppointments(resApt);
      setRecords(resRec);
      setDepartments(resDept);
      setBills(resBill);
      setPayments(resPay);

      // Set aggregated stats
      setStats(resReport.stats);
      setRecentPatients(resReport.recentPatients);
      setRecentAppointments(resReport.recentAppointments);
      setRevenueChartData(resReport.revenueChartData);
      setAppointmentChartData(resReport.appointmentChartData);

      setAuthError('');
    } catch (err) {
      console.error('Error synchronizing dataset with Express backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  // Keep simulated persona sync'd with our sidebar toggle dropdown
  useEffect(() => {
    if (currentUser) {
      const dbUsers = [
        { id: 'usr-1', email: 'admin@hospital.com', name: 'System Administrator', role: UserRole.ADMIN, createdAt: new Date().toISOString() },
        { id: 'usr-2', email: 'doctor@hospital.com', name: 'Dr. Gregory House', role: UserRole.DOCTOR, createdAt: new Date().toISOString() },
        { id: 'usr-3', email: 'receptionist@hospital.com', name: 'Jane Smith', role: UserRole.RECEPTIONIST, createdAt: new Date().toISOString() },
        { id: 'usr-4', email: 'nurse@hospital.com', name: 'Nurse Clara Barton', role: UserRole.NURSE, createdAt: new Date().toISOString() }
      ];
      if (currentUser.role !== userRole) {
        const match = dbUsers.find(u => u.role === userRole);
        if (match) {
          setCurrentUser(match);
        }
      }
    }
  }, [userRole]);

  // 2. Authentication Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!response.ok) {
        const errData = await response.json();
        setAuthError(errData.message || 'Invalid credentials.');
        return;
      }

      const data = await response.json();
      setCurrentUser(data.user);
      setUserRole(data.user.role);
    } catch (err) {
      setAuthError('Connection failed. Server might be booting.');
    }
  };

  // 2.5. Authentication Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthError('');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: registerRole
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        setAuthError(errData.message || 'Error registering account.');
        return;
      }

      const data = await response.json();
      setCurrentUser(data.user);
      setUserRole(data.user.role);
    } catch (err) {
      console.error('Error registering:', err);
      setAuthError('Connection failed.');
    }
  };

  // 3. CRUD: Patient operations
  const handleAddPatient = async (pData: Omit<Patient, 'id' | 'createdAt'>) => {
    await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pData)
    });
    refreshData();
  };

  const handleEditPatient = async (id: string, pData: Partial<Patient>) => {
    await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pData)
    });
    refreshData();
  };

  const handleDeletePatient = async (id: string) => {
    await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    refreshData();
  };

  // 4. CRUD: Doctor operations
  const handleAddDoctor = async (dData: Omit<Doctor, 'id' | 'createdAt'>) => {
    await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dData)
    });
    refreshData();
  };

  const handleEditDoctor = async (id: string, dData: Partial<Doctor>) => {
    await fetch(`/api/doctors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dData)
    });
    refreshData();
  };

  const handleDeleteDoctor = async (id: string) => {
    await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
    refreshData();
  };

  // 5. Book appointment
  const handleBookAppointment = async (aptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aptData)
    });
    refreshData();
  };

  // 6. Update appointment status
  const handleUpdateAptStatus = async (id: string, status: AppointmentStatus) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    refreshData();
  };

  const handleDeleteAppointment = async (id: string) => {
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    refreshData();
  };

  // 7. Add medical EMR record
  const handleAddMedicalRecord = async (rData: Omit<MedicalRecord, 'id' | 'createdAt'>) => {
    await fetch('/api/medical-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rData)
    });
    refreshData();
  };

  // 8. CRUD: Departments
  const handleAddDepartment = async (deptData: Omit<Department, 'id' | 'createdAt'>) => {
    await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData)
    });
    refreshData();
  };

  const handleEditDepartment = async (id: string, deptData: Partial<Department>) => {
    await fetch(`/api/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData)
    });
    refreshData();
  };

  const handleDeleteDepartment = async (id: string) => {
    await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    refreshData();
  };

  // 9. Invoice billing creation
  const handleCreateInvoice = async (billData: Omit<Bill, 'id' | 'paidAmount' | 'status' | 'createdAt'>) => {
    await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData)
    });
    refreshData();
  };

  // 10. Record payment
  const handleRecordPayment = async (payPayload: { billId: string; amount: number; paymentMethod: string }) => {
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payPayload)
    });
    refreshData();
  };

  // If user is logged out, present our beautiful credentials form
  if (!currentUser) {
    return (
      <div id="auth-screen" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-extrabold text-2xl leading-none">+</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Saint Mary Clinical Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Hospital Management System • University Final Year Project
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Login
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your personal clinical information to unlock your portal session
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  placeholder="e.g. Clara Barton"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Clinical Email Address
                </label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  placeholder="e.g. clara@hospital.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Choose Clinical Role
                </label>
                <select
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value as UserRole)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 bg-slate-50/50 font-medium cursor-pointer"
                >
                  <option value={UserRole.ADMIN}>Administrator (Full Access)</option>
                  <option value={UserRole.DOCTOR}>Medical Doctor (EMR Clinical Cards)</option>
                  <option value={UserRole.NURSE}>Nurse (Patient Care & EMR)</option>
                  <option value={UserRole.RECEPTIONIST}>Receptionist (Billing/Booking)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Portal Password
                </label>
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  placeholder="••••••••"
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Unlock className="w-4 h-4" />
                Login & Access Portal
              </button>
            </form>


          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex h-screen overflow-hidden font-sans text-slate-800">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        userRole={userRole} 
        setUserRole={setUserRole} 
      />

      {/* 2. Right Main Layout Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
              Role Auth Active: {userRole}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono leading-none">{currentUser.email}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentUser(null);
              }}
              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
              title="Lock Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Content Panel View Router */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="text-center space-y-2">
                <Activity className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-mono">Synchronizing live clinic ledger state...</p>
              </div>
            </div>
          )}

          {/* Router switch cases */}
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              recentPatients={recentPatients}
              recentAppointments={recentAppointments}
              revenueChartData={revenueChartData}
              appointmentChartData={appointmentChartData}
              userRole={userRole}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsView
              patients={patients}
              onAddPatient={handleAddPatient}
              onEditPatient={handleEditPatient}
              onDeletePatient={handleDeletePatient}
            />
          )}

          {currentTab === 'doctors' && (
            <DoctorsView
              doctors={doctors}
              departments={departments}
              onAddDoctor={handleAddDoctor}
              onEditDoctor={handleEditDoctor}
              onDeleteDoctor={handleDeleteDoctor}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              patients={patients}
              doctors={doctors}
              onBookAppointment={handleBookAppointment}
              onUpdateStatus={handleUpdateAptStatus}
              onDeleteAppointment={handleDeleteAppointment}
              userRole={userRole}
            />
          )}

          {currentTab === 'medical-records' && (
            <MedicalRecordsView
              records={records}
              patients={patients}
              doctors={doctors}
              onAddRecord={handleAddMedicalRecord}
              userRole={userRole}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView
              bills={bills}
              patients={patients}
              payments={payments}
              onCreateInvoice={handleCreateInvoice}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {currentTab === 'departments' && (
            <DepartmentsView
              departments={departments}
              onAddDepartment={handleAddDepartment}
              onEditDepartment={handleEditDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              patients={patients}
              appointments={appointments}
              bills={bills}
              payments={payments}
            />
          )}

        </main>
      </div>
    </div>
  );
}
