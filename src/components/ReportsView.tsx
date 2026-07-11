import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Printer, 
  Users, 
  Calendar, 
  Banknote, 
  Download, 
  TrendingUp, 
  Building2 
} from 'lucide-react';
import { Patient, Appointment, Bill, Payment } from '../types';

interface ReportsViewProps {
  patients: Patient[];
  appointments: Appointment[];
  bills: Bill[];
  payments: Payment[];
}

export default function ReportsView({
  patients,
  appointments,
  bills,
  payments
}: ReportsViewProps) {
  const [activeReportType, setActiveReportType] = useState<'PATIENT' | 'APPOINTMENT' | 'REVENUE'>('PATIENT');

  // Aggregations
  const totalReceived = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBilled = bills.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
  const pendingCollections = totalBilled - totalReceived;

  const totalPatients = patients.length;
  const femaleCount = patients.filter(p => p.gender === 'Female').length;
  const maleCount = patients.filter(p => p.gender === 'Male').length;
  const otherCount = patients.filter(p => p.gender === 'Other').length;

  const totalApts = appointments.length;
  const completedApts = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledApts = appointments.filter(a => a.status === 'CANCELLED').length;
  const confirmedApts = appointments.filter(a => a.status === 'CONFIRMED').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Audit patient demographics, visit frequency charts, and cash receipts</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Active Report
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveReportType('PATIENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeReportType === 'PATIENT' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          <Users className="w-4 h-4" />
          Patient Demographic Reports
        </button>
        <button
          onClick={() => setActiveReportType('APPOINTMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeReportType === 'APPOINTMENT' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Appointment Frequency Reports
        </button>
        <button
          onClick={() => setActiveReportType('REVENUE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeReportType === 'REVENUE' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          <Banknote className="w-4 h-4" />
          Financial Revenue Audits
        </button>
      </div>

      {/* Main Print Section Container */}
      <div id="printable-report-area" className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-8">
        
        {/* Hospital Letterhead Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-emerald-600 font-bold text-2xl leading-none">+</span>
              SAINT MARY HOSPITAL
            </h1>
            <p className="text-xs text-slate-400">Main Western Wing Road • Tel: +1 (555) 000-1111</p>
          </div>
          <div className="text-right">
            <h3 className="font-mono text-xs font-bold text-slate-700">CLINICAL AUDIT STATEMENT</h3>
            <p className="text-xs text-slate-400 mt-0.5">Date generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Dynamic Patient Demographics Report */}
        {activeReportType === 'PATIENT' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Patient Demographics & Clinic Load
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">An analysis of admitted files, gender distributions, and registry logs.</p>
            </div>

            {/* Micro KPI Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Admitted</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{totalPatients} patients</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Female Registry</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{femaleCount} records</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Male Registry</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{maleCount} records</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Others</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{otherCount} records</div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Gender / Sex</th>
                    <th className="px-6 py-3">DOB</th>
                    <th className="px-6 py-3">Blood Group</th>
                    <th className="px-6 py-3">Contact Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="px-6 py-3">{p.gender}</td>
                      <td className="px-6 py-3 font-mono">{p.dob}</td>
                      <td className="px-6 py-3 font-bold text-emerald-700">{p.bloodGroup}</td>
                      <td className="px-6 py-3">{p.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Appointment Frequency Report */}
        {activeReportType === 'APPOINTMENT' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Clinic Appointment Load & Status Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary of medical appointments scheduled, completed, or cancelled.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Scheduled</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{totalApts} visits</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Completed Checks</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{completedApts} visits</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Confirmed Queue</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{confirmedApts} visits</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Cancelled Visits</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{cancelledApts} visits</div>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-3">Appointment ID</th>
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Attending Specialist</th>
                    <th className="px-6 py-3">Consult Date</th>
                    <th className="px-6 py-3">Status Badging</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td className="px-6 py-3 font-mono">{apt.id}</td>
                      <td className="px-6 py-3 font-semibold text-slate-800">{apt.patientName}</td>
                      <td className="px-6 py-3">{apt.doctorName}</td>
                      <td className="px-6 py-3 font-mono">{apt.date} at {apt.time}</td>
                      <td className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">
                        <span className={`inline-block px-2 py-0.5 rounded ${
                          apt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-800' :
                          apt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-800' :
                          apt.status === 'CANCELLED' ? 'bg-rose-50 text-rose-800' :
                          'bg-amber-50 text-amber-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Financial Revenue Report */}
        {activeReportType === 'REVENUE' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                Financial Revenue, Billing, and Collections Statement
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Auditing incoming transactional assets, pending invoices, and net income.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Gross Invoiced Fees</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{totalBilled.toLocaleString()} XAF</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/20">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-600">Net Received Revenue</span>
                <div className="text-xl font-bold text-emerald-700 mt-1">{totalReceived.toLocaleString()} XAF</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-amber-200/60 bg-amber-50/20">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-600">Accounts Receivable (Pending)</span>
                <div className="text-xl font-bold text-amber-700 mt-1">{pendingCollections.toLocaleString()} XAF</div>
              </div>
            </div>

            {/* Bills audit table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <th className="px-6 py-3">Invoice Code</th>
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Total Cost</th>
                    <th className="px-6 py-3">Collected Amount</th>
                    <th className="px-6 py-3">Outstanding Balance</th>
                    <th className="px-6 py-3">Status Badging</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {bills.map((bill) => {
                    const balance = Number(bill.totalAmount) - Number(bill.paidAmount);
                    return (
                      <tr key={bill.id}>
                        <td className="px-6 py-3 font-mono">{bill.id}</td>
                        <td className="px-6 py-3 font-semibold text-slate-800">{bill.patientName}</td>
                        <td className="px-6 py-3">{Number(bill.totalAmount).toLocaleString()} XAF</td>
                        <td className="px-6 py-3">{Number(bill.paidAmount).toLocaleString()} XAF</td>
                        <td className="px-6 py-3 font-bold font-mono text-slate-700">{balance.toLocaleString()} XAF</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-800' :
                            bill.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-800' :
                            'bg-rose-50 text-rose-800'
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Hospital Footer Seal */}
        <div className="border-t border-slate-100 pt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>Eden Phoenix Hospital Administrative Registrar</span>
          <span>Security Certified Audit Logs</span>
        </div>

      </div>
    </div>
  );
}
