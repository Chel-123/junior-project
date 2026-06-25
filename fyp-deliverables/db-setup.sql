-- HOSPITAL MANAGEMENT SYSTEM DATABASE SETUP SCRIPT
-- Suitable for MySQL Workbench and Final Year Project database creation.

CREATE DATABASE IF NOT EXISTS hospital_management_system;
USE hospital_management_system;

-- Disable foreign key checks temporarily to avoid drop conflicts
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Bill;
DROP TABLE IF EXISTS MedicalRecord;
DROP TABLE IF EXISTS Appointment;
DROP TABLE IF EXISTS Patient;
DROP TABLE IF EXISTS Doctor;
DROP TABLE IF EXISTS Department;
DROP TABLE IF EXISTS User;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE User (
    id VARCHAR(191) PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    password VARCHAR(191) NOT NULL,
    name VARCHAR(191) NOT NULL,
    role ENUM('ADMIN', 'DOCTOR', 'RECEPTIONIST') DEFAULT 'RECEPTIONIST',
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- 2. Departments Table
CREATE TABLE Department (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- 3. Doctors Table
CREATE TABLE Doctor (
    id VARCHAR(191) PRIMARY KEY,
    userId VARCHAR(191) UNIQUE,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    phone VARCHAR(191) NOT NULL,
    departmentId VARCHAR(191) NOT NULL,
    specialization VARCHAR(191) NOT NULL,
    schedule VARCHAR(191) NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (departmentId) REFERENCES Department(id)
);

-- 4. Patients Table
CREATE TABLE Patient (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    phone VARCHAR(191) NOT NULL,
    dob DATETIME(3) NOT NULL,
    gender VARCHAR(191) NOT NULL,
    bloodGroup VARCHAR(191) NOT NULL,
    address TEXT NOT NULL,
    medicalHistory TEXT NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- 5. Appointments Table
CREATE TABLE Appointment (
    id VARCHAR(191) PRIMARY KEY,
    patientId VARCHAR(191) NOT NULL,
    doctorId VARCHAR(191) NOT NULL,
    date DATETIME(3) NOT NULL,
    time VARCHAR(191) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    notes TEXT,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (patientId) REFERENCES Patient(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES Doctor(id) ON DELETE CASCADE
);

-- 6. Medical Records Table
CREATE TABLE MedicalRecord (
    id VARCHAR(191) PRIMARY KEY,
    patientId VARCHAR(191) NOT NULL,
    doctorId VARCHAR(191) NOT NULL,
    appointmentId VARCHAR(191),
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    prescription TEXT NOT NULL,
    date DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (patientId) REFERENCES Patient(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES Doctor(id) ON DELETE CASCADE,
    FOREIGN KEY (appointmentId) REFERENCES Appointment(id) ON DELETE SET NULL
);

-- 7. Bills Table
CREATE TABLE Bill (
    id VARCHAR(191) PRIMARY KEY,
    patientId VARCHAR(191) NOT NULL,
    appointmentId VARCHAR(191),
    totalAmount DECIMAL(10, 2) NOT NULL,
    paidAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID') DEFAULT 'UNPAID',
    dueDate DATETIME(3) NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (patientId) REFERENCES Patient(id) ON DELETE CASCADE,
    FOREIGN KEY (appointmentId) REFERENCES Appointment(id) ON DELETE SET NULL
);

-- 8. Payments Table
CREATE TABLE Payment (
    id VARCHAR(191) PRIMARY KEY,
    billId VARCHAR(191) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paymentMethod VARCHAR(191) NOT NULL,
    paymentDate DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    transactionId VARCHAR(191) UNIQUE NOT NULL,
    createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (billId) REFERENCES Bill(id) ON DELETE CASCADE
);

-- SEED STATEMENTS FOR INITIAL SETUP
INSERT INTO User (id, email, password, name, role) VALUES 
('usr-1', 'admin@hospital.com', 'admin123', 'System Administrator', 'ADMIN'),
('usr-2', 'doctor@hospital.com', 'admin123', 'Dr. Gregory House', 'DOCTOR'),
('usr-3', 'receptionist@hospital.com', 'admin123', 'Jane Smith', 'RECEPTIONIST');

INSERT INTO Department (id, name, description) VALUES 
('dept-1', 'Cardiology', 'Specialized care for heart, blood vessels, and cardiovascular systems.'),
('dept-2', 'Pediatrics', 'Comprehensive medical care for infants, children, and adolescents.'),
('dept-3', 'General Medicine', 'Primary care, physical assessments, and non-surgical treatment of adult diseases.');

INSERT INTO Doctor (id, userId, name, email, phone, departmentId, specialization, schedule) VALUES 
('doc-1', 'usr-2', 'Dr. Gregory House', 'house@hospital.com', '+1 (555) 123-4567', 'dept-3', 'Diagnostic Medicine / Nephrology', 'Mon, Tue, Thu 09:00 - 15:00'),
('doc-2', NULL, 'Dr. Sarah Connor', 'connor@hospital.com', '+1 (555) 234-5678', 'dept-1', 'Interventional Cardiology', 'Wed, Fri 08:00 - 16:00'),
('doc-3', NULL, 'Dr. Jane Foster', 'foster@hospital.com', '+1 (555) 345-6789', 'dept-2', 'Pediatric Endocrinology', 'Mon, Wed 10:00 - 18:00');

INSERT INTO Patient (id, name, email, phone, dob, gender, bloodGroup, address, medicalHistory) VALUES 
('pat-1', 'John Doe', 'johndoe@email.com', '+1 (555) 987-6543', '1985-05-15', 'Male', 'O+', '123 Main St, Springfield', 'Hypertension diagnosed in 2021. Allergy to Penicillin.'),
('pat-2', 'Mary Jane', 'maryjane@email.com', '+1 (555) 876-5432', '1992-09-20', 'Female', 'A-', '456 Elm St, Metropolia', 'Asthma since childhood. No drug allergies.'),
('pat-3', 'Bruce Wayne', 'bruce@waynecorp.com', '+1 (555) 007-1939', '1979-02-19', 'Male', 'AB+', 'Wayne Manor, Gotham City', 'Multiple orthopedic surgeries. Undergoes high stress levels.'),
('pat-4', 'Clark Kent', 'clark@dailyplanet.com', '+1 (555) 111-2222', '1982-06-18', 'Male', 'O-', '344 Clinton St, Metropolis', 'Exceptional physical fitness. No history of disease.'),
('pat-5', 'Diana Prince', 'diana@themysis.org', '+1 (555) 333-4444', '1988-11-10', 'Female', 'B+', 'Gateway City Museum', 'No chronic diseases. Highly active lifestyle.');

INSERT INTO Appointment (id, patientId, doctorId, date, time, reason, status, notes) VALUES 
('apt-1', 'pat-1', 'doc-1', NOW(), '10:30', 'Regular cardiovascular assessment for blood pressure monitoring.', 'CONFIRMED', 'Patient feels occasional dizziness.'),
('apt-2', 'pat-2', 'doc-3', NOW(), '14:00', 'Follow-up on pediatric breathing patterns.', 'PENDING', 'Parents requested Dr. Foster.'),
('apt-3', 'pat-3', 'doc-2', DATE_SUB(NOW(), INTERVAL 2 DAY), '09:00', 'Cardiac stress test.', 'COMPLETED', 'Completed successfully. Resting heart rate normal.');

INSERT INTO MedicalRecord (id, patientId, doctorId, appointmentId, symptoms, diagnosis, treatment, prescription) VALUES 
('rec-1', 'pat-3', 'doc-2', 'apt-3', 'Mild muscular strain around rib cage, exhaustion.', 'Acute fatigue and physical overexertion.', 'Mandatory 48-hour bed rest, high hydration.', 'Ibuprofen 400mg twice daily for discomfort.');

INSERT INTO Bill (id, patientId, appointmentId, totalAmount, paidAmount, status, dueDate) VALUES 
('bill-1', 'pat-3', 'apt-3', 350.00, 350.00, 'PAID', NOW()),
('bill-2', 'pat-1', 'apt-1', 120.00, 0.00, 'UNPAID', DATE_ADD(NOW(), INTERVAL 14 DAY));

INSERT INTO Payment (id, billId, amount, paymentMethod, transactionId) VALUES 
('pay-1', 'bill-1', 350.00, 'Card', 'TXN-9823412039');
