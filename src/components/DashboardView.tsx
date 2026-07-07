import React from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Banknote, 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  Heart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { UserRole } from '../types';

interface DashboardViewProps {
  stats: {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    totalRevenue: number;
  };
  recentPatients: any[];
  recentAppointments: any[];
  revenueChartData: any[];
  appointmentChartData: any[];
  userRole: UserRole;
  onNavigate: (tab: string) => void;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export default function DashboardView({
  stats,
  recentPatients,
  recentAppointments,
  revenueChartData,
  appointmentChartData,
  userRole,
  onNavigate
}: DashboardViewProps) {
  
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-mono font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Workspace Active
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Clinical Operations Command</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Welcome back to Saint Mary Clinic. You are logged in as <span className="text-emerald-400 font-medium underline decoration-emerald-500/30">{userRole}</span>. Manage scheduling, track medical records, and oversee financials in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700/50 text-right">
            <div className="text-[10px] text-slate-400 font-mono">STATION ID</div>
            <div className="text-xs font-semibold text-slate-200">STM-WEST-01</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Patients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-mono">+12% wk</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{stats.totalPatients}</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Registered Patients</p>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-mono">Full-time</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{stats.totalDoctors}</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Active Specialists</p>
          </div>
        </div>

        {/* Scheduled Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-mono">Today</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{stats.totalAppointments}</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Scheduled Visits</p>
          </div>
        </div>

        {/* Paid Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <Banknote className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-mono">Received</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{stats.totalRevenue.toLocaleString()} XAF</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Hospital Income</p>
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Analytics (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Hospital Billing Cashflow</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated monthly income and invoice receipts</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">Live Feed</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(val) => [`${val} XAF`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-900">Appointment Metrics</h3>
            <p className="text-xs text-slate-500 mt-0.5">Breakdown of consultations status</p>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {appointmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Stat */}
            <div className="absolute text-center">
              <div className="text-xl font-extrabold text-slate-800">{stats.totalAppointments}</div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono">Total</div>
            </div>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {appointmentChartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-xs text-slate-600 font-medium truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recents Directory Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recent Check-ins & Bookings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Most recent clinic appointment updates</p>
            </div>
            <button 
              onClick={() => onNavigate('appointments')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group cursor-pointer"
            >
              See all
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {recentAppointments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No scheduled appointments found.</div>
            ) : (
              recentAppointments.map((apt) => (
                <div key={apt.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                      {apt.patientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{apt.patientName}</h4>
                      <p className="text-xs text-slate-500">Scheduled with <span className="font-medium text-slate-700">{apt.doctorName}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {apt.date} at {apt.time}
                    </span>
                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                      apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Recently Admitted Patients</h3>
              <p className="text-xs text-slate-500 mt-0.5">Most recent registrations into the hospital index</p>
            </div>
            {userRole !== UserRole.DOCTOR && (
              <button 
                onClick={() => onNavigate('patients')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group cursor-pointer"
              >
                See all
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {recentPatients.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No registered patients.</div>
            ) : (
              recentPatients.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      {p.bloodGroup || 'O+'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{p.name}</h4>
                      <p className="text-xs text-slate-500">{p.gender} • {p.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-400 font-mono block">Registered</span>
                    <span className="text-xs text-slate-600 font-medium font-mono">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
