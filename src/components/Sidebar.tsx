import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Receipt, 
  Building2, 
  BarChart3, 
  LogOut,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  userRole, 
  setUserRole 
}: SidebarProps) {
  
  // List of all navigation items with roles allowed
  const menuItems = [
    { id: 'dashboard', name: 'Overview Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.NURSE] },
    { id: 'patients', name: 'Patient Directory', icon: Users, roles: [UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE] },
    { id: 'doctors', name: 'Doctor Registries', icon: Stethoscope, roles: [UserRole.ADMIN] },
    { id: 'appointments', name: 'Appointments Manager', icon: Calendar, roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.NURSE] },
    { id: 'medical-records', name: 'Electronic Medical Records', icon: FileText, roles: [UserRole.ADMIN, UserRole.DOCTOR] },
    { id: 'billing', name: 'Invoices & Payments', icon: Receipt, roles: [UserRole.ADMIN, UserRole.RECEPTIONIST] },
    { id: 'departments', name: 'Hospital Departments', icon: Building2, roles: [UserRole.ADMIN] },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3, roles: [UserRole.ADMIN] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside id="sidebar-nav" className="w-68 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-xl">+</span>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Saint Mary</h1>
            <p className="text-xs text-slate-400 font-mono">Clinical Portal</p>
          </div>
        </div>
      </div>

      {/* Role Switcher Sandbox Block */}
      <div className="p-4 mx-4 my-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono font-medium text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Persona Role</span>
        </div>
        <select 
          value={userRole} 
          onChange={(e) => {
            const role = e.target.value as UserRole;
            setUserRole(role);
            // Default to overview dashboard when changing roles to avoid access errors
            setCurrentTab('dashboard');
          }}
          className="w-full bg-slate-800 text-slate-100 text-xs border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
        >
          <option value={UserRole.ADMIN}>Administrator (Full System)</option>
          <option value={UserRole.DOCTOR}>Medical Doctor (EMR & Diagnoses)</option>
          <option value={UserRole.RECEPTIONIST}>Receptionist (Bills & Booking)</option>
          <option value={UserRole.NURSE}>Nurse (Patient Care & EMR)</option>
        </select>
        <div className="mt-2 text-[10px] text-slate-400 flex items-start gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
          <span>Simulated credentials: admin123</span>
        </div>
      </div>

      {/* Menu Options */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer System Version */}
      <div className="p-4 border-t border-slate-800 mt-auto bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>FYP Deliverable</span>
          <span className="text-emerald-500 font-medium">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
}
