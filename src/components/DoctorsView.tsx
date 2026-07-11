import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  X, 
  Building2, 
  UserSquare, 
  Stethoscope, 
  Mail, 
  Smartphone 
} from 'lucide-react';
import { Doctor, Department } from '../types';

interface DoctorsViewProps {
  doctors: Doctor[];
  departments: Department[];
  onAddDoctor: (d: Omit<Doctor, 'id' | 'createdAt'>) => void;
  onEditDoctor: (id: string, d: Partial<Doctor>) => void;
  onDeleteDoctor: (id: string) => void;
}

export default function DoctorsView({
  doctors,
  departments,
  onAddDoctor,
  onEditDoctor,
  onDeleteDoctor
}: DoctorsViewProps) {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [schedule, setSchedule] = useState('');

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    (d.departmentName && d.departmentName.toLowerCase().includes(search.toLowerCase()))
  );

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDepartmentId(departments[0]?.id || '');
    setSpecialization('');
    setSchedule('Mon, Wed, Fri 09:00 - 17:00');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAdding(true);
    setIsEditing(null);
  };

  const handleOpenEdit = (d: Doctor) => {
    setName(d.name);
    setEmail(d.email);
    setPhone(d.phone);
    setDepartmentId(d.departmentId);
    setSpecialization(d.specialization);
    setSchedule(d.schedule);
    setIsEditing(d.id);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !departmentId || !specialization) {
      alert('All fields except phone/schedule are mandatory.');
      return;
    }

    const payload = { name, email, phone, departmentId, specialization, schedule };

    if (isAdding) {
      onAddDoctor(payload);
      setIsAdding(false);
    } else if (isEditing) {
      onEditDoctor(isEditing, payload);
      setIsEditing(null);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Doctor Registries</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage physician indices, shifts, and department allocations</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Assign New Doctor
        </button>
      </div>

      {/* Grid: Search and Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search specialists by name, clinic department, or clinical focus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center text-slate-400 border border-slate-200 rounded-2xl">
                No specialists registered in the hospital ledger.
              </div>
            ) : (
              filteredDoctors.map((doc) => (
                <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        MD
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                        {doc.departmentName || 'Specialist'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-bold text-slate-900 text-base">{doc.name}</h4>
                      <p className="text-xs font-semibold text-emerald-600 mt-1">{doc.specialization}</p>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{doc.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-[11px] truncate">{doc.schedule}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('De-register this physician from the system?')) {
                          onDeleteDoctor(doc.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form Column */}
        <div>
          {(isAdding || isEditing) ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <UserSquare className="w-5 h-5 text-emerald-600" />
                  {isAdding ? 'Assign Specialist' : 'Modify Physician Profile'}
                </h3>
                <button 
                  onClick={() => { setIsAdding(false); setIsEditing(null); }}
                  className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Connor"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. connor@hospital.com"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone Line *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +237 699-234-567"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Hospital Department *</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  >
                    <option value="">Select a department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Clinical Specialization *</label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Interventional Cardiology"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Regular Work Shift / Schedule</label>
                  <input
                    type="text"
                    required
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="e.g. Mon, Wed, Fri 09:00 - 17:00"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  {isAdding ? 'Assign Specialist' : 'Update Record'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
              Click "Assign New Doctor" or edit any physician's record card to modify active clinical departments or adjust work shift tables.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
