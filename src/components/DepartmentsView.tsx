import React, { useState } from 'react';
import { 
  Plus, 
  Building2, 
  Trash2, 
  Edit, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { Department } from '../types';

interface DepartmentsViewProps {
  departments: Department[];
  onAddDepartment: (d: Omit<Department, 'id' | 'createdAt'>) => void;
  onEditDepartment: (id: string, d: Partial<Department>) => void;
  onDeleteDepartment: (id: string) => void;
}

export default function DepartmentsView({
  departments,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment
}: DepartmentsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAdding(true);
    setIsEditing(null);
  };

  const handleOpenEdit = (d: Department) => {
    setName(d.name);
    setDescription(d.description);
    setIsEditing(d.id);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      alert('Department Name and description are mandatory.');
      return;
    }

    const payload = { name, description };

    if (isAdding) {
      onAddDepartment(payload);
      setIsAdding(false);
    } else if (isEditing) {
      onEditDepartment(isEditing, payload);
      setIsEditing(null);
    }
    resetForm();
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hospital Departments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Control active medical wings, specialty centers, and clinical descriptions</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Department
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Department List Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center text-slate-400 border border-slate-200 rounded-2xl">
              No hospital departments active in ledger.
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{dept.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {dept.description}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this department? Any associated physicians will need department re-allocation.')) {
                        onDeleteDepartment(dept.id);
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

        {/* Side Form Column */}
        <div>
          {(isAdding || isEditing) ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  {isAdding ? 'Create Wing' : 'Modify Ward Details'}
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cardiology Unit"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe clinical scope, machinery, or wards of the department..."
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  {isAdding ? 'Publish Wing' : 'Save Details'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              Click "Create Department" to add clinical wards or adjust wing titles.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
