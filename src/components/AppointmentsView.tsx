import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  X, 
  Check, 
  Ban, 
  Clock, 
  ChevronRight, 
  Sparkles,
  FileText
} from 'lucide-react';
import { Appointment, Patient, Doctor, AppointmentStatus } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onBookAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  userRole: string;
}

export default function AppointmentsView({
  appointments,
  patients,
  doctors,
  onBookAppointment,
  onUpdateStatus,
  onDeleteAppointment,
  userRole
}: AppointmentsViewProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Booking Form States
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const resetForm = () => {
    setPatientId('');
    setDoctorId('');
    setDate('');
    setTime('');
    setReason('');
    setNotes('');
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !date || !time || !reason) {
      alert('Patient, Doctor, Date, Time, and Reason are required.');
      return;
    }

    onBookAppointment({
      patientId,
      doctorId,
      date,
      time,
      reason,
      status: AppointmentStatus.PENDING,
      notes
    });

    setIsBooking(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header and Add booking */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Appointments Manager</h2>
          <p className="text-sm text-slate-500 mt-0.5">Schedule, dispatch, confirm, and update clinical consultations</p>
        </div>
        
        {userRole !== 'DOCTOR' && (
          <button
            onClick={() => { resetForm(); setIsBooking(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Book Consultation
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === status 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Scheduled Cards Column */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 border border-slate-200 rounded-2xl">
              No appointments registered matching the chosen status.
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div key={apt.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left Patient-Doctor Info */}
                <div className="space-y-2 max-w-md">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                      apt.status === AppointmentStatus.CONFIRMED ? 'bg-emerald-500' :
                      apt.status === AppointmentStatus.COMPLETED ? 'bg-blue-500' :
                      apt.status === AppointmentStatus.CANCELLED ? 'bg-rose-500' :
                      'bg-amber-500'
                    }`}></span>
                    <h4 className="font-bold text-slate-800 text-base">{apt.patientName || 'Unknown Patient'}</h4>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">ID: {apt.id}</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Physician: <span className="font-semibold text-slate-700">{apt.doctorName || 'Assigned Specialist'}</span>
                  </p>
                  
                  <p className="text-xs text-slate-600 font-medium">
                    Reason: <span className="text-slate-500 font-normal italic">"{apt.reason}"</span>
                  </p>

                  {apt.notes && (
                    <div className="bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-500 border border-slate-100 italic">
                      Notes: {apt.notes}
                    </div>
                  )}
                </div>

                {/* Right Time Actions Block */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-700 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.date} at {apt.time}</span>
                    </div>
                  </div>

                  {/* Status update Actions */}
                  <div className="flex items-center gap-1.5">
                    {apt.status === AppointmentStatus.PENDING && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, AppointmentStatus.CONFIRMED)}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Confirm Appointment"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm
                      </button>
                    )}

                    {apt.status === AppointmentStatus.CONFIRMED && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, AppointmentStatus.COMPLETED)}
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Complete Appointment"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Visited
                      </button>
                    )}

                    {apt.status !== AppointmentStatus.CANCELLED && apt.status !== AppointmentStatus.COMPLETED && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, AppointmentStatus.CANCELLED)}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Cancel Appointment"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      apt.status === AppointmentStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-800' :
                      apt.status === AppointmentStatus.COMPLETED ? 'bg-blue-50 text-blue-800' :
                      apt.status === AppointmentStatus.CANCELLED ? 'bg-rose-50 text-rose-800' :
                      'bg-amber-50 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Booking Form Sidebar Panel */}
        <div>
          {isBooking ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Schedule Consultation
                </h3>
                <button 
                  onClick={() => setIsBooking(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Select Patient *</label>
                  <select
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  >
                    <option value="">-- Choose Patient Record --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.bloodGroup})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Select Doctor / Specialist *</label>
                  <select
                    required
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  >
                    <option value="">-- Choose Physician --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Time *</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Reason for Visit *</label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Chronic blood pressure assessment"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Internal Reception Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide any instructions or details..."
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Confirm and Book
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-xs space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p>Click "Book Consultation" to open the appointment Scheduler. Only Admin or Receptionist roles are authorized to schedule bookings.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
