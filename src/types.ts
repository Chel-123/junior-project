/**
 * Hospital Management System (HMS) Type Definitions
 * Suitable for a university Final Year Project.
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  RECEPTIONIST = 'RECEPTIONIST'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId?: string; // Optional links to user account if they login
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName?: string; // Resolved name for UI convenience
  specialization: string;
  schedule: string; // e.g., "Mon, Wed, Fri 09:00 - 17:00"
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  address: string;
  medicalHistory: string; // Free text list of conditions, allergies, etc.
  createdAt: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string; // UI conveniences
  doctorId: string;
  doctorName?: string; // UI conveniences
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  appointmentId?: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription: string; // e.g., "Paracetamol 500mg, 3x daily"
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export enum BillStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID'
}

export interface Bill {
  id: string;
  patientId: string;
  patientName?: string;
  appointmentId?: string;
  totalAmount: number;
  paidAmount: number;
  status: BillStatus;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'Insurance' | 'Bank Transfer';
  paymentDate: string; // YYYY-MM-DD
  transactionId: string;
  createdAt: string;
}

// Initial state interface for JSON file persistence
export interface DatabaseState {
  users: User[];
  departments: Department[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  bills: Bill[];
  payments: Payment[];
}
