import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  UserPlus, 
  FileHeart, 
  Calendar, 
  Smartphone, 
  Mail, 
  MapPin, 
  UserCircle 
} from 'lucide-react';
import { Patient } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  onAddPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => void;
  onEditPatient: (id: string, p: Partial<Patient>) => void;
  onDeletePatient: (id: string) => void;
}

export default function PatientsView({
  patients,
  onAddPatient,
  onEditPatient,
  onDeletePatient
}: PatientsViewProps) {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Search filter
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.bloodGroup.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDob('');
    setGender('Male');
    setBloodGroup('O+');
    setAddress('');
    setMedicalHistory('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAdding(true);
    setIsEditing(null);
  };

  const handleOpenEdit = (p: Patient) => {
    setName(p.name);
    setEmail(p.email);
    setPhone(p.phone);
    setDob(p.dob);
    setGender(p.gender);
    setBloodGroup(p.bloodGroup);
    setAddress(p.address);
    setMedicalHistory(p.medicalHistory);
    setIsEditing(p.id);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      alert('Name, Email and Phone are required.');
      return;
    }

    if (isAdding) {
      onAddPatient({ name, email, phone, dob, gender, bloodGroup, address, medicalHistory });
      setIsAdding(false);
    } else if (isEditing) {
      onEditPatient(isEditing, { name, email, phone, dob, gender, bloodGroup, address, medicalHistory });
      setIsEditing(null);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">Register, manage, and inspect complete medical files</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search patient record index by name, phone, email, or blood group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Main Grid: Directory and Detail View panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Patient Table Directory */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Blood Group / Sex</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">DOB</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No registered patients match your query. Add a new card to start.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <span>{p.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700">
                          {p.bloodGroup}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">{p.gender}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="block">{p.phone}</span>
                        <span className="block text-xs text-slate-400 truncate max-w-44">{p.email}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{p.dob}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingPatient(p)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Medical Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this patient record permanently? This will remove all historic associations.')) {
                                onDeletePatient(p.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Form OR View Detail Panel */}
        <div className="space-y-6">
          
          {/* Add / Edit Form Panel */}
          {(isAdding || isEditing) && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  {isAdding ? 'Register New File' : 'Update Clinical File'}
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mary Jane"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-45"
                      className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Sex</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">DOB</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Home Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, Postcode"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Medical Anamnesis / Allergies</label>
                  <textarea
                    rows={3}
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="Known illnesses, drug allergies, surgeries..."
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  {isAdding ? 'Register Patient File' : 'Save Modifications'}
                </button>
              </form>
            </div>
          )}

          {/* Active Detail View Panel */}
          {viewingPatient && !isAdding && !isEditing && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-slate-900 text-white p-6 relative">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-md">
                    Clinical Chart Card
                  </div>
                  <button 
                    onClick={() => setViewingPatient(null)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-lg border border-slate-700">
                    {viewingPatient.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{viewingPatient.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{viewingPatient.gender} • DOB: {viewingPatient.dob}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                    <UserCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Biographic Coordinates
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{viewingPatient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{viewingPatient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{viewingPatient.address || 'No registered address'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                    <FileHeart className="w-3.5 h-3.5 text-emerald-600" />
                    Medical History & Anamnesis
                  </h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/50 italic leading-relaxed">
                    {viewingPatient.medicalHistory || 'No pre-existing clinical history declared on record.'}
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>File Opened:</span>
                  <span>{new Date(viewingPatient.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Fallback info when empty */}
          {!isAdding && !isEditing && !viewingPatient && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
              Select any patient record to view their complete clinical anamnesis, or click "Add New Patient" to expand the directory list.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
