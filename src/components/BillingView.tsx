import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  X, 
  DollarSign, 
  CreditCard, 
  Check, 
  ChevronRight,
  ShieldCheck,
  History
} from 'lucide-react';
import { Bill, Patient, Payment, BillStatus } from '../types';

interface BillingViewProps {
  bills: Bill[];
  patients: Patient[];
  payments: Payment[];
  onCreateInvoice: (b: Omit<Bill, 'id' | 'paidAmount' | 'status' | 'createdAt'>) => void;
  onRecordPayment: (p: { billId: string; amount: number; paymentMethod: string }) => void;
}

export default function BillingView({
  bills,
  patients,
  payments,
  onCreateInvoice,
  onRecordPayment
}: BillingViewProps) {
  const [isInvoiceAdding, setIsInvoiceAdding] = useState(false);
  const [recordingPaymentBill, setRecordingPaymentBill] = useState<Bill | null>(null);

  // Form states - Create Invoice
  const [patientId, setPatientId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Form states - Record Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Insurance' | 'Bank Transfer'>('Card');

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !totalAmount || !dueDate) {
      alert('Patient, amount, and due date are required.');
      return;
    }

    onCreateInvoice({
      patientId,
      totalAmount: Number(totalAmount),
      dueDate
    });

    setIsInvoiceAdding(false);
    setPatientId('');
    setTotalAmount('');
    setDueDate('');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingPaymentBill || !paymentAmount) return;

    const amountNum = Number(paymentAmount);
    const maximumAllowed = recordingPaymentBill.totalAmount - recordingPaymentBill.paidAmount;

    if (amountNum <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }

    if (amountNum > maximumAllowed) {
      alert(`Payment exceeds maximum remaining balance of ${maximumAllowed} XAF`);
      return;
    }

    onRecordPayment({
      billId: recordingPaymentBill.id,
      amount: amountNum,
      paymentMethod
    });

    setRecordingPaymentBill(null);
    setPaymentAmount('');
  };

  return (
    <div className="space-y-8 text-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Invoices & Payments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Generate hospital invoices, process transactions, and track revenue histories</p>
        </div>
        <button
          onClick={() => { setIsInvoiceAdding(true); setRecordingPaymentBill(null); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left billing list column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active invoice ledger card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Hospital Ledger Invoices
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400">
                    <th className="px-6 py-3">Invoice / Patient</th>
                    <th className="px-6 py-3">Total Due</th>
                    <th className="px-6 py-3">Amount Paid</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No invoices registered in the clinical ledger.
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => {
                      const balance = bill.totalAmount - bill.paidAmount;
                      return (
                        <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-800 text-sm block">{bill.patientName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">Inv: {bill.id}</span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{Number(bill.totalAmount).toLocaleString()} XAF</td>
                          <td className="px-6 py-4 font-semibold text-slate-500">{Number(bill.paidAmount).toLocaleString()} XAF</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                              bill.status === BillStatus.PAID ? 'bg-emerald-100 text-emerald-800' :
                              bill.status === BillStatus.PARTIALLY_PAID ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {bill.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-400">{bill.dueDate}</td>
                          <td className="px-6 py-4 text-right">
                            {balance > 0 ? (
                              <button
                                onClick={() => { setRecordingPaymentBill(bill); setIsInvoiceAdding(false); }}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-semibold font-mono text-xs cursor-pointer transition-colors"
                              >
                                Collect Pay
                              </button>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px] flex items-center justify-end gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-500" /> Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Audit Trail Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Receipt Transaction Audit Trail
            </div>
            <div className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No payment transactions processed yet.</div>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{p.amount.toLocaleString()} XAF</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold font-mono">
                          {p.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">TxID: {p.transactionId}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-medium text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200/50">
                        {p.paymentDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right contextual form Panel */}
        <div>
          
          {/* Create Invoice form */}
          {isInvoiceAdding && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  Issue Invoice
                </h3>
                <button 
                  onClick={() => setIsInvoiceAdding(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Fee Invoice Amount (XAF) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="e.g. 150.00"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Issue and Post Invoice
                </button>
              </form>
            </div>
          )}

          {/* Record payment form */}
          {recordingPaymentBill && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Process Transaction
                </h3>
                <button 
                  onClick={() => setRecordingPaymentBill(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1 text-xs mb-4">
                <div className="text-slate-400">Paying Patient File</div>
                <div className="font-bold text-slate-800">{recordingPaymentBill.patientName}</div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-slate-600 mt-2 font-mono">
                  <span>Balance Due:</span>
                  <span className="font-bold text-emerald-600">
                    {(recordingPaymentBill.totalAmount - recordingPaymentBill.paidAmount).toLocaleString()} XAF
                  </span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Amount (XAF) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={recordingPaymentBill.totalAmount - recordingPaymentBill.paidAmount}
                    placeholder="e.g. 100.00"
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Channel</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  >
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Cash">Cash Receipt</option>
                    <option value="Insurance">Insurance Direct Claim</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Collect and Print Receipt
                </button>
              </form>
            </div>
          )}

          {/* Empty informational placeholder */}
          {!isInvoiceAdding && !recordingPaymentBill && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <p>Select "Collect Pay" beside an unpaid ledger item or click "Create Invoice" to begin billing. Receipts are logged for transparency audits.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
