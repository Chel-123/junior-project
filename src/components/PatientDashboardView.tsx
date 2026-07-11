import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Calendar, 
  FileText, 
  Plus, 
  Phone, 
  MapPin, 
  Heart, 
  Droplets, 
  Activity, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  X, 
  Edit3, 
  Sparkles,
  Lock,
  Stethoscope,
  Info
} from 'lucide-react';
import { Patient, MedicalRecord, Appointment, Doctor, User, AppointmentStatus } from '../types';

interface PatientDashboardViewProps {
  currentUser: User | null;
  patients: Patient[];
  records: MedicalRecord[];
  appointments: Appointment[];
  doctors: Doctor[];
  onBookAppointment: (aptData: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void> | void;
  onEditPatient: (id: string, pData: Partial<Patient>) => Promise<void> | void;
  onAddPatient: (pData: Omit<Patient, 'id' | 'createdAt'>) => Promise<void> | void;
}

export default function PatientDashboardView({
  currentUser,
  patients,
  records,
  appointments,
  doctors,
  onBookAppointment,
  onEditPatient,
  onAddPatient
}: PatientDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'appointments'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);

  // Edit profile form state
  const [editPhone, setEditPhone] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editMedicalHistory, setEditMedicalHistory] = useState('');

  // Complete registration form state (for new user PATIENTs with no profile yet)
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');
  const [regAddress, setRegAddress] = useState('');
  const [regMedicalHistory, setRegMedicalHistory] = useState('');

  // Appointment booking state
  const [bookDoctorId, setBookDoctorId] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookReason, setBookReason] = useState('');
  const [bookNotes, setBookNotes] = useState('');

  // Success messages
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Find the logged-in patient record matching our user account by email
  const patient = patients.find(p => p.email.toLowerCase() === currentUser?.email?.toLowerCase());

  // Filter EMR records & appointments for this specific patient
  const patientRecords = patient 
    ? records.filter(r => r.patientId === patient.id)
    : [];

  const patientAppointments = patient
    ? appointments.filter(a => a.patientId === patient.id)
    : [];

  const handleOpenEditProfile = () => {
    if (patient) {
      setEditPhone(patient.phone);
      setEditDob(patient.dob);
      setEditGender(patient.gender);
      setEditBloodGroup(patient.bloodGroup);
      setEditAddress(patient.address);
      setEditMedicalHistory(patient.medicalHistory);
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    await onEditPatient(patient.id, {
      phone: editPhone,
      dob: editDob,
      gender: editGender,
      bloodGroup: editBloodGroup,
      address: editAddress,
      medicalHistory: editMedicalHistory
    });

    setIsEditingProfile(false);
    showFeedback('Your personal profile was successfully updated!');
  };

  const handleRegisterPatientProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await onAddPatient({
      name: currentUser.name,
      email: currentUser.email,
      phone: regPhone || '+237 600-000-000',
      dob: regDob || '1995-01-01',
      gender: regGender,
      bloodGroup: regBloodGroup,
      address: regAddress || 'Yaounde, Cameroon',
      medicalHistory: regMedicalHistory || 'No chronic medical history stated.'
    });

    showFeedback('Your patient profile was created! Welcome to your digital health portal.');
  };

  const handleBookAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !bookDoctorId || !bookDate || !bookTime || !bookReason) return;

    await onBookAppointment({
      patientId: patient.id,
      doctorId: bookDoctorId,
      date: bookDate,
      time: bookTime,
      reason: bookReason,
      status: AppointmentStatus.PENDING,
      notes: bookNotes || 'Self-scheduled via Patient Portal'
    });

    setBookDoctorId('');
    setBookDate('');
    setBookTime('');
    setBookReason('');
    setBookNotes('');
    setIsBookingAppointment(false);
    showFeedback('Appointment successfully scheduled! It is currently pending clinical approval.');
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg('');
    }, 5000);
  };

  // Status Badge generator
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Approval
          </span>
        );
      case AppointmentStatus.CONFIRMED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Confirmed
          </span>
        );
      case AppointmentStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Completed
          </span>
        );
      case AppointmentStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Render the incomplete profile warning if logged-in user doesn't have an associated patient details
  if (!patient) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
        <div className="bg-slate-900 px-6 py-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            Patient Portal
          </div>
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Complete Your Profile Setup</h2>
          <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto">
            You are logged in as <span className="text-emerald-400 font-semibold">{currentUser?.name}</span>. Provide your clinical details below to establish your Eden Phoenix medical chart and access your dashboard.
          </p>
        </div>

        <form onSubmit={handleRegisterPatientProfile} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Mobile Number *</label>
              <input
                required
                type="text"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+237 677-123-456"
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Date of Birth *</label>
              <input
                required
                type="date"
                value={regDob}
                onChange={(e) => setRegDob(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Gender *</label>
              <select
                value={regGender}
                onChange={(e) => setRegGender(e.target.value as any)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Blood Group *</label>
              <select
                value={regBloodGroup}
                onChange={(e) => setRegBloodGroup(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Residential Address *</label>
            <input
              required
              type="text"
              value={regAddress}
              onChange={(e) => setRegAddress(e.target.value)}
              placeholder="e.g. Bastos, Yaounde"
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Known Allergies / Clinical History</label>
            <textarea
              value={regMedicalHistory}
              onChange={(e) => setRegMedicalHistory(e.target.value)}
              rows={3}
              placeholder="List any drug allergies, pre-existing conditions, or surgical history..."
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-semibold rounded-xl py-3 shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Initialize Patient Chart
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-52 h-52 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
              Patient Portal
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {patient.id}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome, {patient.name}</h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Access your secure medical charts, track incoming appointment slots, and request physician consultations in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            onClick={() => setIsBookingAppointment(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 transition-all text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Action Notification Alert Banner */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tabs Layout Nav */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Personal Profile
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          Electronic Medical Records ({patientRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" />
          My Appointments ({patientAppointments.length})
        </button>
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 border border-slate-200">
                  <UserIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{patient.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{patient.email}</p>
                </div>
              </div>
              <button
                onClick={handleOpenEditProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Phone</span>
                  <span className="text-slate-700 text-sm font-medium">{patient.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                  <span className="text-slate-700 text-sm font-medium">{patient.dob}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender Profile</span>
                  <span className="text-slate-700 text-sm font-medium">{patient.gender}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0 border border-rose-100 bg-rose-50/50">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
                  <span className="text-rose-700 text-sm font-bold">{patient.bloodGroup}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Residential Address</span>
                <span className="text-slate-700 text-sm">{patient.address}</span>
              </div>
            </div>
          </div>

          {/* Clinical Alert History Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 text-rose-700">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              Clinical History & Warnings
            </h4>
            <div className="bg-rose-50/30 border border-rose-100/60 rounded-xl p-4 text-xs space-y-2">
              <span className="block font-bold text-rose-800 uppercase tracking-wider text-[9px]">Official EMR Allergies & Notes</span>
              <p className="text-slate-600 leading-relaxed font-mono whitespace-pre-wrap">
                {patient.medicalHistory || "No current special restrictions declared."}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] text-slate-500 flex gap-2">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>All medical history entries are logged securely and can only be modified by you or authorized physicians in charge of your diagnoses.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MEDICAL EMR HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Electronic Medical History</h3>
            <span className="text-xs font-mono text-slate-400">{patientRecords.length} records available</span>
          </div>

          {patientRecords.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 max-w-xl mx-auto">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h4 className="font-semibold text-slate-700 text-base">No Medical Records Listed</h4>
              <p className="text-xs text-slate-400 mt-1">
                You do not have any official diagnostic records on file yet. Once an examining physician issues your consultation report, it will display here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientRecords.map((rec) => (
                <div key={rec.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-emerald-500/40 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      Date: {rec.date}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      {rec.doctorName || 'Diagnosing Doctor'}
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Symptoms Reported</span>
                      <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100/50">{rec.symptoms}</p>
                    </div>

                    <div>
                      <span className="block font-bold text-emerald-600 uppercase tracking-wider text-[9px] mb-0.5">Diagnosis</span>
                      <p className="text-slate-800 font-bold bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">{rec.diagnosis}</p>
                    </div>

                    <div>
                      <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Treatment Protocol</span>
                      <p className="text-slate-700">{rec.treatment}</p>
                    </div>

                    {rec.prescription && (
                      <div className="border-t border-dashed border-slate-200 pt-2.5">
                        <span className="block font-bold text-indigo-500 uppercase tracking-wider text-[9px] mb-0.5">Prescribed Pharmacy Drugs</span>
                        <p className="text-indigo-900 font-mono text-[11px] bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100/60">{rec.prescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MY APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">My Appointments</h3>
            <button
              onClick={() => setIsBookingAppointment(true)}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 transition-all text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule New
            </button>
          </div>

          {patientAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 max-w-xl mx-auto">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h4 className="font-semibold text-slate-700 text-base">No Scheduled Appointments</h4>
              <p className="text-xs text-slate-400 mt-1">
                You currently do not have any clinical consultation appointments scheduled.
              </p>
              <button
                onClick={() => setIsBookingAppointment(true)}
                className="mt-4 inline-flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule Consultation Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {patientAppointments.map((apt) => (
                <div key={apt.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-sm">Consultation with {apt.doctorName || 'Assigned Doctor'}</h4>
                        {getStatusBadge(apt.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{apt.date} at {apt.time}</span>
                        <span>Reason: <span className="font-medium text-slate-700">{apt.reason}</span></span>
                      </div>
                      {apt.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100 max-w-lg">
                          Clinical Notes: {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDIT PROFILE */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Edit Personal Information</h3>
                <p className="text-xs text-slate-400">Update your clinical registry credentials</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Mobile Phone *</label>
                  <input
                    required
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Date of Birth *</label>
                  <input
                    required
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Gender *</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Blood Group *</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Residential Address *</label>
                <input
                  required
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Known Allergies & Clinical History</label>
                <textarea
                  value={editMedicalHistory}
                  onChange={(e) => setEditMedicalHistory(e.target.value)}
                  rows={4}
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BOOK APPOINTMENT */}
      {isBookingAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Book Clinical Consultation</h3>
                <p className="text-xs text-slate-400">Request a session with an expert physician</p>
              </div>
              <button
                onClick={() => setIsBookingAppointment(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookAppointmentSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Choose Doctor & Specialization *</label>
                <select
                  required
                  value={bookDoctorId}
                  onChange={(e) => setBookDoctorId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Choose Date *</label>
                  <input
                    required
                    type="date"
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Choose Time *</label>
                  <input
                    required
                    type="time"
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Reason for Visit *</label>
                <input
                  required
                  type="text"
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  placeholder="e.g. Cardiovascular checkup, migraine assessment..."
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Additional Notes</label>
                <textarea
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  rows={3}
                  placeholder="Provide details about symptoms, duration, or special requests..."
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookingAppointment(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
