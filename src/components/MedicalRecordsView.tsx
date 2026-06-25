import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  X, 
  User, 
  Stethoscope, 
  Activity, 
  Heart,
  Calendar,
  ClipboardList
} from 'lucide-react';
import { MedicalRecord, Patient, Doctor } from '../types';

interface MedicalRecordsViewProps {
  records: MedicalRecord[];
  patients: Patient[];
  doctors: Doctor[];
  onAddRecord: (r: Omit<MedicalRecord, 'id' | 'createdAt'>) => void;
  userRole: string;
}

export default function MedicalRecordsView({
  records,
  patients,
  doctors,
  onAddRecord,
  userRole
}: MedicalRecordsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Form States
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescription, setPrescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !symptoms || !diagnosis) {
      alert('Patient, Doctor, Symptoms, and Diagnosis fields are mandatory.');
      return;
    }

    onAddRecord({
      patientId,
      doctorId,
      symptoms,
      diagnosis,
      treatment,
      prescription,
      date
    });

    setIsAdding(false);
    // Reset Form
    setPatientId('');
    setDoctorId('');
    setSymptoms('');
    setDiagnosis('');
    setTreatment('');
    setPrescription('');
  };

  // Restrict to DOCTOR and ADMIN
  const canAddRecord = userRole === 'DOCTOR' || userRole === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Electronic Medical Records (EMR)</h2>
          <p className="text-sm text-slate-500 mt-0.5">Record clinical observations, register diagnoses, and write active prescriptions</p>
        </div>
        
        {canAddRecord && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Clinical Entry
          </button>
        )}
      </div>

      {/* Main Grid: Directory & Record card details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left EMR Registry list */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Medical Log Index
            </div>
            <div className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  No medical record logs found. Register a new entry.
                </div>
              ) : (
                records.map((rec) => (
                  <div 
                    key={rec.id} 
                    onClick={() => setSelectedRecord(rec)}
                    className="p-5 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-base">{rec.patientName}</h4>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold font-mono">
                          EMR
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Diagnosing Physician: <span className="text-slate-700">{rec.doctorName}</span>
                      </p>
                      <p className="text-xs text-slate-600 font-semibold line-clamp-1">
                        Primary Diagnosis: <span className="font-normal text-slate-500">{rec.diagnosis}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded block">
                        {rec.date}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">ID: {rec.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Details OR Form Sideboard */}
        <div className="space-y-6">
          
          {/* Create Entry Form Panel */}
          {isAdding && canAddRecord && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                  Create EMR Entry
                </h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Select Patient *</label>
                  <select
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.bloodGroup})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Diagnosing Doctor *</label>
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Entry Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Symptoms Identified *</label>
                  <textarea
                    rows={2}
                    required
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Mild chest soreness, heavy breathing..."
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Clinical Diagnosis *</label>
                  <textarea
                    rows={2}
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Chronic Fatigue syndrome with respiratory strain"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Recommended Treatment</label>
                  <textarea
                    rows={2}
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="e.g. Daily breathing loop intervals, 48 hours bed rest"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Prescription Details</label>
                  <textarea
                    rows={2}
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="e.g. Ibuprofen 400mg, twice daily for 5 days"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Save and Sign Record
                </button>
              </form>
            </div>
          )}

          {/* Inspect Record Details Sidebar Card */}
          {selectedRecord && !isAdding && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-slate-950 text-white p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    Official EMR Record
                  </span>
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-lg leading-tight">{selectedRecord.patientName}</h3>
                <p className="text-slate-400 text-xs mt-1">Logged on: {selectedRecord.date}</p>
              </div>

              <div className="p-6 space-y-5 text-sm">
                
                {/* Diagnosing Physician */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono">Attending Practitioner</div>
                    <div className="font-bold text-slate-800 text-xs">{selectedRecord.doctorName}</div>
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Symptoms Identified</h4>
                  <p className="text-slate-700 font-medium leading-relaxed bg-slate-50/40 p-2.5 rounded-lg border border-slate-100 text-xs">
                    {selectedRecord.symptoms}
                  </p>
                </div>

                {/* Diagnosis */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Clinical Diagnosis</h4>
                  <p className="text-slate-800 font-bold leading-relaxed bg-slate-50/40 p-2.5 rounded-lg border border-slate-100 text-xs">
                    {selectedRecord.diagnosis}
                  </p>
                </div>

                {/* Treatment */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Treatment Plan</h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50/40 p-2.5 rounded-lg border border-slate-100 text-xs">
                    {selectedRecord.treatment || 'No systemic treatments registered.'}
                  </p>
                </div>

                {/* Prescriptions */}
                <div className="border-t border-dashed border-slate-200 pt-4">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    Authorized Prescriptions
                  </h4>
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-emerald-950 font-mono text-xs leading-relaxed">
                    {selectedRecord.prescription || 'Rx: No pharmacological substances prescribed.'}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Empty Fallback State info */}
          {!isAdding && !selectedRecord && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-xs space-y-2">
              <ClipboardList className="w-8 h-8 text-slate-400 mx-auto" />
              <p>Select any clinical EMR file from the list to display comprehensive diagnostic files, medications, or treatable prescriptions.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
