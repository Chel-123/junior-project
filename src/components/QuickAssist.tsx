import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Building2, 
  Receipt,
  Command,
  ArrowRight,
  Clock,
  ExternalLink,
  Activity,
  Heart,
  Phone,
  Mail,
  User,
  AlertCircle,
  ShieldCheck,
  MapPin,
  ClipboardList,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { Patient, Doctor, Appointment, MedicalRecord, Department, Bill, UserRole, AppointmentStatus, BillStatus } from '../types';

interface QuickAssistProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  records: MedicalRecord[];
  departments: Department[];
  bills: Bill[];
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
}

type CategoryType = 'all' | 'patients' | 'doctors' | 'records' | 'appointments' | 'departments' | 'bills';

interface SearchResultItem {
  id: string;
  category: Exclude<CategoryType, 'all'>;
  title: string;
  subtitle: string;
  tags: string[];
  original: any;
}

export default function QuickAssist({
  isOpen,
  onClose,
  patients,
  doctors,
  appointments,
  records,
  departments,
  bills,
  setCurrentTab,
  userRole
}: QuickAssistProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setActiveCategory('all');
      setSelectedIndex(0);
      setSelectedItem(null);
    }
  }, [isOpen]);

  // Handle outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Build the searchable dataset based on current data
  const searchDataset: SearchResultItem[] = [];

  // 1. Patients
  patients.forEach(p => {
    searchDataset.push({
      id: `p-${p.id}`,
      category: 'patients',
      title: p.name,
      subtitle: `Blood Group: ${p.bloodGroup} • Dob: ${p.dob}`,
      tags: [p.name, p.email, p.phone, p.bloodGroup, p.address, p.medicalHistory],
      original: p
    });
  });

  // 2. Doctors (Only if not Patient role)
  if (userRole !== UserRole.PATIENT) {
    doctors.forEach(d => {
      const deptName = departments.find(dept => dept.id === d.departmentId)?.name || d.departmentName || 'General';
      searchDataset.push({
        id: `d-${d.id}`,
        category: 'doctors',
        title: d.name,
        subtitle: `${d.specialization} • Dept: ${deptName}`,
        tags: [d.name, d.email, d.phone, d.specialization, d.schedule, deptName],
        original: { ...d, departmentName: deptName }
      });
    });
  }

  // 3. Appointments
  appointments.forEach(apt => {
    const pat = patients.find(p => p.id === apt.patientId);
    const doc = doctors.find(d => d.id === apt.doctorId);
    const patName = pat?.name || apt.patientName || 'Unknown Patient';
    const docName = doc?.name || apt.doctorName || 'Unknown Doctor';

    // If role is PATIENT, only show their own appointments
    if (userRole === UserRole.PATIENT && pat?.email !== pat?.email) { // logic protection
       // will filter below using patient matching or simply skip
    }

    searchDataset.push({
      id: `a-${apt.id}`,
      category: 'appointments',
      title: `Apt: ${patName} with ${docName}`,
      subtitle: `Date: ${apt.date} • ${apt.time} • Status: ${apt.status}`,
      tags: [patName, docName, apt.date, apt.time, apt.status, apt.reason, apt.notes],
      original: { ...apt, patientName: patName, doctorName: docName }
    });
  });

  // 4. Medical Records
  records.forEach(rec => {
    const pat = patients.find(p => p.id === rec.patientId);
    const doc = doctors.find(d => d.id === rec.doctorId);
    const patName = pat?.name || rec.patientName || 'Unknown Patient';
    const docName = doc?.name || rec.doctorName || 'Unknown Doctor';

    searchDataset.push({
      id: `r-${rec.id}`,
      category: 'records',
      title: `EMR Entry - ${patName}`,
      subtitle: `Diagnosis: ${rec.diagnosis} • Dr. ${docName}`,
      tags: [patName, docName, rec.symptoms, rec.diagnosis, rec.treatment, rec.prescription, rec.date],
      original: { ...rec, patientName: patName, doctorName: docName }
    });
  });

  // 5. Departments
  departments.forEach(dept => {
    searchDataset.push({
      id: `dept-${dept.id}`,
      category: 'departments',
      title: dept.name,
      subtitle: dept.description,
      tags: [dept.name, dept.description],
      original: dept
    });
  });

  // 6. Bills (Only for Admin or specific staff)
  if (userRole === UserRole.ADMIN || userRole === UserRole.RECEPTIONIST) {
    bills.forEach(bill => {
      const pat = patients.find(p => p.id === bill.patientId);
      const patName = pat?.name || bill.patientName || 'Unknown Patient';
      searchDataset.push({
        id: `b-${bill.id}`,
        category: 'bills',
        title: `Invoice for ${patName}`,
        subtitle: `Total: $${bill.totalAmount} • Status: ${bill.status} • Due: ${bill.dueDate}`,
        tags: [patName, bill.status, bill.dueDate, bill.id],
        original: { ...bill, patientName: patName }
      });
    });
  }

  // Filter dataset by search term and tab category
  const filteredDataset = searchDataset.filter(item => {
    // 1. Filter by category tab
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }

    // 2. Filter by Search Query
    if (!query.trim()) return true;
    const cleanQuery = query.toLowerCase().trim();
    return item.tags.some(tag => tag && tag.toLowerCase().includes(cleanQuery));
  });

  // Auto-select first item when filtered list changes
  useEffect(() => {
    if (filteredDataset.length > 0) {
      setSelectedIndex(0);
      setSelectedItem(filteredDataset[0]);
    } else {
      setSelectedItem(null);
    }
  }, [query, activeCategory]);

  // Handle Keyboard Navigation inside the result list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredDataset.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (selectedIndex + 1) % filteredDataset.length;
      setSelectedIndex(nextIndex);
      setSelectedItem(filteredDataset[nextIndex]);
      scrollIntoView(nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (selectedIndex - 1 + filteredDataset.length) % filteredDataset.length;
      setSelectedIndex(prevIndex);
      setSelectedItem(filteredDataset[prevIndex]);
      scrollIntoView(prevIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedItem) {
        handleNavigateToItem(selectedItem);
      }
    }
  };

  const scrollIntoView = (index: number) => {
    const listElement = listRef.current;
    if (!listElement) return;

    const itemElement = listElement.children[index] as HTMLElement;
    if (!itemElement) return;

    const listHeight = listElement.clientHeight;
    const itemTop = itemElement.offsetTop;
    const itemHeight = itemElement.clientHeight;

    if (itemTop + itemHeight > listElement.scrollTop + listHeight) {
      listElement.scrollTop = itemTop + itemHeight - listHeight;
    } else if (itemTop < listElement.scrollTop) {
      listElement.scrollTop = itemTop;
    }
  };

  // Switch tabs and navigate directly to the searched item
  const handleNavigateToItem = (item: SearchResultItem) => {
    const tabMap: Record<string, string> = {
      patients: 'patients',
      doctors: 'doctors',
      records: 'medical-records',
      appointments: 'appointments',
      departments: 'departments',
      bills: 'billing'
    };

    const targetTab = tabMap[item.category];
    if (targetTab) {
      setCurrentTab(targetTab);
      onClose();
    }
  };

  // Helper icons mapping
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patients': return <Users className="w-4 h-4 text-sky-500" />;
      case 'doctors': return <Stethoscope className="w-4 h-4 text-emerald-500" />;
      case 'appointments': return <Calendar className="w-4 h-4 text-indigo-500" />;
      case 'records': return <FileText className="w-4 h-4 text-rose-500" />;
      case 'departments': return <Building2 className="w-4 h-4 text-violet-500" />;
      case 'bills': return <Receipt className="w-4 h-4 text-amber-500" />;
      default: return <Command className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'patients': return 'Patient Profile';
      case 'doctors': return 'Specialist Doctor';
      case 'appointments': return 'Appointment Slot';
      case 'records': return 'Medical Record (EMR)';
      case 'departments': return 'Hospital Department';
      case 'bills': return 'Financial Invoice';
      default: return 'Core Record';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop blur overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Centered Command Palette Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-5xl h-[600px] flex flex-col overflow-hidden relative z-10"
          >
            {/* Top search input and close */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search patients, doctors, diagnosis, symptoms, appointments, invoices..."
                className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none focus:ring-0 font-medium py-1"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-mono">
                  ESC
                </span>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Filter Category Badges */}
            <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono mr-2 shrink-0">
                Filters:
              </span>
              {(['all', 'patients', 'doctors', 'records', 'appointments', 'departments', 'bills'] as CategoryType[]).map(cat => {
                if (cat === 'doctors' && userRole === UserRole.PATIENT) return null;
                if (cat === 'bills' && userRole !== UserRole.ADMIN && userRole !== UserRole.RECEPTIONIST) return null;

                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Split Screen Search Content */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Left results list */}
              <div className="flex-1 overflow-y-auto flex flex-col" style={{ flexBasis: '55%' }}>
                {filteredDataset.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <AlertCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No matching clinical records found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Try searching with other keywords, spelling, or filter criteria.
                    </p>
                  </div>
                ) : (
                  <div ref={listRef} className="p-2 space-y-1">
                    {filteredDataset.map((item, index) => {
                      const isHighlighted = index === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedIndex(index);
                            setSelectedItem(item);
                          }}
                          onDoubleClick={() => handleNavigateToItem(item)}
                          className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
                            isHighlighted 
                              ? 'bg-slate-800 text-white shadow-md shadow-slate-900/5' 
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${isHighlighted ? 'bg-white/10' : 'bg-slate-100'}`}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 justify-between">
                              <span className="font-semibold text-xs text-slate-400 font-mono uppercase tracking-wider">
                                {getCategoryLabel(item.category)}
                              </span>
                              {isHighlighted && (
                                <span className="text-[10px] text-white/50 font-mono flex items-center gap-1">
                                  Double click to navigate <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <h4 className={`text-sm font-semibold truncate ${isHighlighted ? 'text-white' : 'text-slate-900'}`}>
                              {item.title}
                            </h4>
                            <p className={`text-xs truncate ${isHighlighted ? 'text-white/70' : 'text-slate-500'}`}>
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right details drawer preview */}
              <div className="flex-1 bg-slate-50/40 overflow-y-auto p-6" style={{ flexBasis: '45%' }}>
                {selectedItem ? (
                  <div className="space-y-6">
                    {/* Header Details */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {getCategoryLabel(selectedItem.category)}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2 leading-snug">
                          {selectedItem.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          System ID: <span className="font-mono">{selectedItem.original.id}</span>
                        </p>
                      </div>
                      <div className="p-3 bg-white border border-slate-200/60 rounded-xl shadow-xs">
                        {getCategoryIcon(selectedItem.category)}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-4" />

                    {/* Category-specific card view details */}
                    {selectedItem.category === 'patients' && (() => {
                      const p = selectedItem.original as Patient;
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                              <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Blood Group</div>
                              <div className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                {p.bloodGroup}
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                              <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Gender / Dob</div>
                              <div className="text-sm font-bold text-slate-800 mt-0.5">{p.gender} • {p.dob}</div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">Contact Info</h4>
                            <div className="space-y-2 text-xs text-slate-700">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{p.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{p.phone}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>{p.address}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-2">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase font-mono tracking-wider flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5 text-emerald-600" />
                              Clinical History Overview
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed italic">
                              "{p.medicalHistory || 'No clinical conditions logged in base intake files.'}"
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {selectedItem.category === 'doctors' && (() => {
                      const d = selectedItem.original as Doctor;
                      return (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">Specialty & Team</h4>
                            <div className="space-y-2 text-xs text-slate-700">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Specialization</span>
                                <span className="font-semibold text-slate-800 text-sm">{d.specialization}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Assigned Department</span>
                                <span className="font-semibold text-slate-800">{d.departmentName}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">Weekly Shift Schedule</h4>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-100 p-3 rounded-lg border border-slate-200/60">
                              <Clock className="w-4 h-4 text-indigo-500" />
                              <span>{d.schedule}</span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-2 text-xs text-slate-700">
                            <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">Staff Contact Channel</h4>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{d.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{d.phone}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {selectedItem.category === 'appointments' && (() => {
                      const apt = selectedItem.original as Appointment;
                      const statusColors: Record<AppointmentStatus, string> = {
                        [AppointmentStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
                        [AppointmentStatus.CONFIRMED]: 'bg-sky-50 text-sky-700 border-sky-200',
                        [AppointmentStatus.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        [AppointmentStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200',
                      };
                      return (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">Appointment Overview</h4>
                            <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Patient Name</span>
                                <span className="font-semibold text-slate-800">{apt.patientName}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Specialist Practitioner</span>
                                <span className="font-semibold text-slate-800">{apt.doctorName}</span>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between p-2.5 bg-slate-100 rounded-lg border border-slate-200/60">
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                {apt.date} at {apt.time}
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[apt.status] || 'bg-slate-50'}`}>
                                {apt.status}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Reason for Appointment</span>
                              <p className="text-xs text-slate-800 mt-1 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                                "{apt.reason}"
                              </p>
                            </div>
                            {apt.notes && (
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Clinical Intention Notes</span>
                                <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                  {apt.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {selectedItem.category === 'records' && (() => {
                      const rec = selectedItem.original as MedicalRecord;
                      return (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-2 text-xs">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
                              <span>Patient: {rec.patientName}</span>
                              <span>Dr. {rec.doctorName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">Date Recorded: {rec.date}</div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Patient Symptoms</span>
                              <p className="text-xs text-slate-800 font-medium mt-1">{rec.symptoms}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Professional Diagnosis</span>
                              <p className="text-xs text-slate-800 font-bold text-rose-700 mt-1">{rec.diagnosis}</p>
                            </div>
                          </div>

                          <div className="bg-emerald-50/40 border border-emerald-100/80 p-4 rounded-xl space-y-3">
                            <div>
                              <span className="text-[10px] text-emerald-800 uppercase font-mono font-bold block">Prescribed Action & Treatment Plan</span>
                              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{rec.treatment}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-emerald-800 uppercase font-mono font-bold block">Prescription Drug Allocation</span>
                              <p className="text-xs font-mono font-bold text-emerald-900 mt-1 bg-white border border-emerald-100 px-2.5 py-1.5 rounded-lg">
                                {rec.prescription}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {selectedItem.category === 'departments' && (() => {
                      const dept = selectedItem.original as Department;
                      // Find doctors assigned to this department
                      const assignedDocs = doctors.filter(doc => doc.departmentId === dept.id);
                      return (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-2">
                            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Department Description</span>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {dept.description}
                            </p>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider flex items-center justify-between">
                              <span>Assigned Physicians</span>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                                {assignedDocs.length} Specialists
                              </span>
                            </h4>
                            {assignedDocs.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No physicians currently allocated to this ward registry.</p>
                            ) : (
                              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                                {assignedDocs.map(doc => (
                                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-xs text-slate-800 border border-slate-100 bg-slate-50/50">
                                    <span className="font-semibold">{doc.name}</span>
                                    <span className="text-slate-500 italic text-[10px]">{doc.specialization}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {selectedItem.category === 'bills' && (() => {
                      const bill = selectedItem.original as Bill;
                      const billColors: Record<BillStatus, string> = {
                        [BillStatus.UNPAID]: 'bg-rose-50 text-rose-700 border-rose-200',
                        [BillStatus.PARTIALLY_PAID]: 'bg-amber-50 text-amber-700 border-amber-200',
                        [BillStatus.PAID]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      };
                      const remaining = bill.totalAmount - bill.paidAmount;
                      return (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Patient Invoice Recipient</span>
                                <span className="font-semibold text-slate-800 text-sm">{bill.patientName}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${billColors[bill.status] || 'bg-slate-50'}`}>
                                {bill.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-xs">
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block">Total Billed</span>
                                <span className="font-bold text-slate-900">${bill.totalAmount.toFixed(2)}</span>
                              </div>
                              <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/60">
                                <span className="text-[9px] text-emerald-700 uppercase font-mono font-bold block">Paid Sum</span>
                                <span className="font-bold text-emerald-800">${bill.paidAmount.toFixed(2)}</span>
                              </div>
                              <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/60">
                                <span className="text-[9px] text-rose-700 uppercase font-mono font-bold block">Balance</span>
                                <span className="font-bold text-rose-800">${remaining.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 font-mono">Invoice Date:</span>
                              <span className="font-semibold text-slate-800">{bill.createdAt.split('T')[0]}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 font-mono">Payment Due Date:</span>
                              <span className="font-bold text-rose-600">{bill.dueDate}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Navigation Trigger Button */}
                    <div className="pt-4">
                      <button
                        onClick={() => handleNavigateToItem(selectedItem)}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-slate-800/10"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Navigate & View Full Dashboard Module
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                      <Command className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">Select a search result item to inspect deep record detail sheets.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom help bar */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 rounded bg-white border border-slate-200">↑↓</span> Move
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 rounded bg-white border border-slate-200">Enter</span> Open details
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 rounded bg-white border border-slate-200">Double-Click</span> Go to tab
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                HMS Quick Assist v1.1
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
