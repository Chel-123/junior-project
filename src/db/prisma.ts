import { PrismaClient } from '@prisma/client';

// Lazy/singleton initialization of PrismaClient to ensure clean server startup
let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
    });
  }
  return prismaInstance;
}

export const prisma = getPrisma();

export async function ensureSeeded() {
  const db = getPrisma();
  
  try {
    const userCount = await db.user.count();
    if (userCount > 0) {
      console.log('Database already initialized with data. Running automated phone format migrations...');
      
      const allDoctors = await db.doctor.findMany({
        where: {
          phone: {
            startsWith: '+1 (555)'
          }
        }
      });
      for (const doc of allDoctors) {
        const formattedPhone = doc.phone
          .replace('+1 (555)', '+237 6')
          .replace('123-4567', '77-123-456')
          .replace('234-5678', '99-234-567')
          .replace('345-6789', '88-345-678');
        await db.doctor.update({
          where: { id: doc.id },
          data: { phone: formattedPhone }
        });
      }

      const allPatients = await db.patient.findMany({
        where: {
          phone: {
            startsWith: '+1 (555)'
          }
        }
      });
      for (const pat of allPatients) {
        const formattedPhone = pat.phone
          .replace('+1 (555)', '+237 6')
          .replace('987-6543', '75-987-654')
          .replace('876-5432', '95-876-543')
          .replace('007-1939', '57-007-193')
          .replace('111-2222', '71-112-222')
          .replace('333-4444', '93-334-444');
        await db.patient.update({
          where: { id: pat.id },
          data: { phone: formattedPhone }
        });
      }

      // Ensure all existing bills and payments are scaled to millions of francs (XAF)
      const allBills = await db.bill.findMany();
      for (const bill of allBills) {
        if (bill.totalAmount < 100000) {
          await db.bill.update({
            where: { id: bill.id },
            data: {
              totalAmount: bill.totalAmount * 10000,
              paidAmount: bill.paidAmount * 10000
            }
          });
        }
      }

      const allPayments = await db.payment.findMany();
      for (const payment of allPayments) {
        if (payment.amount < 100000) {
          await db.payment.update({
            where: { id: payment.id },
            data: {
              amount: payment.amount * 10000
            }
          });
        }
      }

      // Ensure there is at least one bill under 300,000 XAF as requested by the user
      const hasLowBill = await db.bill.findFirst({
        where: {
          totalAmount: {
            lt: 300000
          }
        }
      });
      if (!hasLowBill) {
        const pat2 = await db.patient.findFirst({
          where: { id: 'pat-2' }
        });
        if (pat2) {
          const twoWeeksLaterStr = new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0];
          await db.bill.upsert({
            where: { id: 'bill-3' },
            update: {
              totalAmount: 245000.00,
              paidAmount: 120000.00,
              status: 'PARTIALLY_PAID',
              dueDate: twoWeeksLaterStr
            },
            create: {
              id: 'bill-3',
              patientId: 'pat-2',
              totalAmount: 245000.00,
              paidAmount: 120000.00,
              status: 'PARTIALLY_PAID',
              dueDate: twoWeeksLaterStr
            }
          });

          await db.payment.upsert({
            where: { id: 'pay-2' },
            update: {
              amount: 120000.00,
              paymentMethod: 'Mobile Money',
              paymentDate: new Date().toISOString().split('T')[0],
              transactionId: 'TXN-8374829104'
            },
            create: {
              id: 'pay-2',
              billId: 'bill-3',
              amount: 120000.00,
              paymentMethod: 'Mobile Money',
              paymentDate: new Date().toISOString().split('T')[0],
              transactionId: 'TXN-8374829104'
            }
          });
        }
      }

      // Seed more patients if they don't exist
      await db.patient.upsert({
        where: { id: 'pat-6' },
        update: {},
        create: {
          id: 'pat-6',
          name: 'Peter Parker',
          email: 'peter@dailybugle.com',
          phone: '+237 672-444-555',
          dob: '2001-08-10',
          gender: 'Male',
          bloodGroup: 'O+',
          address: '20 Ingram St, Queens',
          medicalHistory: 'Spider bite in childhood. High metabolism. Excellent agility.'
        }
      });

      await db.patient.upsert({
        where: { id: 'pat-7' },
        update: {},
        create: {
          id: 'pat-7',
          name: 'Barry Allen',
          email: 'barry@centralcitypd.gov',
          phone: '+237 674-888-999',
          dob: '1990-03-28',
          gender: 'Male',
          bloodGroup: 'AB-',
          address: '502 Flash Way, Central City',
          medicalHistory: 'Accelerated healing, lightning strike survivor.'
        }
      });

      // Seed past medical records for other patients if they don't exist
      const defaultDocForMR = await db.doctor.findFirst() || { id: 'doc-1' };
      const defaultDocId = defaultDocForMR.id;

      const recordsToSeed = [
        {
          id: 'rec-2',
          patientId: 'pat-1',
          doctorId: defaultDocId,
          symptoms: 'Persistent dry cough and fatigue for 3 weeks.',
          diagnosis: 'Post-viral bronchial hyperreactivity.',
          treatment: 'Hydration, avoidance of triggers, inhaled bronchodilator.',
          prescription: 'Albuterol inhaler 90mcg, 2 puffs every 6 hours.',
          date: '2026-05-12'
        },
        {
          id: 'rec-3',
          patientId: 'pat-2',
          doctorId: defaultDocId,
          symptoms: 'Shortness of breath with physical activity.',
          diagnosis: 'Mild persistent Asthma.',
          treatment: 'Daily controller medication and rescue inhaler.',
          prescription: 'Fluticasone 110mcg daily, Albuterol for rescue.',
          date: '2026-06-20'
        },
        {
          id: 'rec-4',
          patientId: 'pat-4',
          doctorId: defaultDocId,
          symptoms: 'No physical symptoms. Requested annual physiological baseline.',
          diagnosis: 'Exceptional bone density, cellular vitality, and cardiac efficiency.',
          treatment: 'None needed. Maintain current dietary and environmental habits.',
          prescription: 'N/A',
          date: '2026-06-01'
        },
        {
          id: 'rec-5',
          patientId: 'pat-5',
          doctorId: defaultDocId,
          symptoms: 'Aesthetic check-up, general athletic stress review.',
          diagnosis: 'Peak athletic physiological state. Superior cardiovascular reserves.',
          treatment: 'Regular rest cycles between intensive field deployments.',
          prescription: 'Multivitamins',
          date: '2026-06-15'
        },
        {
          id: 'rec-6',
          patientId: 'pat-6',
          doctorId: defaultDocId,
          symptoms: 'Extreme fatigue and elevated body temperature (39.5 C).',
          diagnosis: 'Benign physiological hyper-metabolism.',
          treatment: 'High caloric diet and increased fluid intake. 12 hours undisturbed rest.',
          prescription: 'Paracetamol 500mg for fever control.',
          date: '2026-07-01'
        },
        {
          id: 'rec-7',
          patientId: 'pat-7',
          doctorId: defaultDocId,
          symptoms: 'Ankle sprain following rapid acceleration.',
          diagnosis: 'Grade I ligament strain - already 90% healed at assessment.',
          treatment: 'Light stretching, temporary restriction of high-speed maneuvers.',
          prescription: 'None. Healing rate is exceptionally accelerated.',
          date: '2026-07-05'
        }
      ];

      for (const rec of recordsToSeed) {
        await db.medicalRecord.upsert({
          where: { id: rec.id },
          update: {},
          create: rec
        });
      }

      return;
    }

    console.log('Database is empty. Populating initial seed data...');

    // 1. Seed Users
    const adminUser = await db.user.create({
      data: {
        id: 'usr-1',
        email: 'admin@hospital.com',
        name: 'System Administrator',
        role: 'ADMIN',
        password: 'admin123'
      }
    });

    const docUser = await db.user.create({
      data: {
        id: 'usr-2',
        email: 'doctor@hospital.com',
        name: 'Dr. Gregory House',
        role: 'DOCTOR',
        password: 'doctor123'
      }
    });

    await db.user.create({
      data: {
        id: 'usr-3',
        email: 'receptionist@hospital.com',
        name: 'Jane Smith',
        role: 'RECEPTIONIST',
        password: 'receptionist123'
      }
    });

    await db.user.create({
      data: {
        id: 'usr-4',
        email: 'nurse@hospital.com',
        name: 'Nurse Clara Barton',
        role: 'NURSE',
        password: 'nurse123'
      }
    });

    // 2. Seed Departments
    const dept1 = await db.department.create({
      data: {
        id: 'dept-1',
        name: 'Cardiology',
        description: 'Specialized care for heart, blood vessels, and cardiovascular systems.'
      }
    });

    const dept2 = await db.department.create({
      data: {
        id: 'dept-2',
        name: 'Pediatrics',
        description: 'Comprehensive medical care for infants, children, and adolescents.'
      }
    });

    const dept3 = await db.department.create({
      data: {
        id: 'dept-3',
        name: 'General Medicine',
        description: 'Primary care, physical assessments, and non-surgical treatment of adult diseases.'
      }
    });

    // 3. Seed Doctors
    const doc1 = await db.doctor.create({
      data: {
        id: 'doc-1',
        userId: docUser.id,
        name: 'Dr. Gregory House',
        email: 'house@hospital.com',
        phone: '+237 677-123-456',
        departmentId: dept3.id,
        specialization: 'Diagnostic Medicine / Nephrology',
        schedule: 'Mon, Tue, Thu 09:00 - 15:00'
      }
    });

    const doc2 = await db.doctor.create({
      data: {
        id: 'doc-2',
        name: 'Dr. Sarah Connor',
        email: 'connor@hospital.com',
        phone: '+237 699-234-567',
        departmentId: dept1.id,
        specialization: 'Interventional Cardiology',
        schedule: 'Wed, Fri 08:00 - 16:00'
      }
    });

    const doc3 = await db.doctor.create({
      data: {
        id: 'doc-3',
        name: 'Dr. Jane Foster',
        email: 'foster@hospital.com',
        phone: '+237 688-345-678',
        departmentId: dept2.id,
        specialization: 'Pediatric Endocrinology',
        schedule: 'Mon, Wed 10:00 - 18:00'
      }
    });

    // 4. Seed Patients
    const pat1 = await db.patient.create({
      data: {
        id: 'pat-1',
        name: 'John Doe',
        email: 'johndoe@email.com',
        phone: '+237 675-987-654',
        dob: '1985-05-15',
        gender: 'Male',
        bloodGroup: 'O+',
        address: '123 Main St, Springfield',
        medicalHistory: 'Hypertension diagnosed in 2021. Allergy to Penicillin.'
      }
    });

    const pat2 = await db.patient.create({
      data: {
        id: 'pat-2',
        name: 'Mary Jane',
        email: 'maryjane@email.com',
        phone: '+237 695-876-543',
        dob: '1992-09-20',
        gender: 'Female',
        bloodGroup: 'A-',
        address: '456 Elm St, Metropolia',
        medicalHistory: 'Asthma since childhood. No drug allergies.'
      }
    });

    const pat3 = await db.patient.create({
      data: {
        id: 'pat-3',
        name: 'Bruce Wayne',
        email: 'bruce@waynecorp.com',
        phone: '+237 657-007-193',
        dob: '1979-02-19',
        gender: 'Male',
        bloodGroup: 'AB+',
        address: 'Wayne Manor, Gotham City',
        medicalHistory: 'Multiple orthopedic surgeries. Undergoes high stress levels.'
      }
    });

    const pat4 = await db.patient.create({
      data: {
        id: 'pat-4',
        name: 'Clark Kent',
        email: 'clark@dailyplanet.com',
        phone: '+237 671-112-222',
        dob: '1982-06-18',
        gender: 'Male',
        bloodGroup: 'O-',
        address: '344 Clinton St, Metropolis',
        medicalHistory: 'Exceptional physical fitness. No history of disease.'
      }
    });

    const pat5 = await db.patient.create({
      data: {
        id: 'pat-5',
        name: 'Diana Prince',
        email: 'diana@themysis.org',
        phone: '+237 693-334-444',
        dob: '1988-11-10',
        gender: 'Female',
        bloodGroup: 'B+',
        address: 'Gateway City Museum',
        medicalHistory: 'No chronic diseases. Highly active lifestyle.'
      }
    });

    const pat6 = await db.patient.create({
      data: {
        id: 'pat-6',
        name: 'Peter Parker',
        email: 'peter@dailybugle.com',
        phone: '+237 672-444-555',
        dob: '2001-08-10',
        gender: 'Male',
        bloodGroup: 'O+',
        address: '20 Ingram St, Queens',
        medicalHistory: 'Spider bite in childhood. High metabolism. Excellent agility.'
      }
    });

    const pat7 = await db.patient.create({
      data: {
        id: 'pat-7',
        name: 'Barry Allen',
        email: 'barry@centralcitypd.gov',
        phone: '+237 674-888-999',
        dob: '1990-03-28',
        gender: 'Male',
        bloodGroup: 'AB-',
        address: '502 Flash Way, Central City',
        medicalHistory: 'Accelerated healing, lightning strike survivor.'
      }
    });

    // 5. Seed Appointments
    const todayStr = new Date().toISOString().split('T')[0];
    const twoDaysAgoStr = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const apt1 = await db.appointment.create({
      data: {
        id: 'apt-1',
        patientId: pat1.id,
        doctorId: doc1.id,
        date: todayStr,
        time: '10:30',
        reason: 'Regular cardiovascular assessment for blood pressure monitoring.',
        status: 'CONFIRMED',
        notes: 'Patient feels occasional dizziness.'
      }
    });

    await db.appointment.create({
      data: {
        id: 'apt-2',
        patientId: pat2.id,
        doctorId: doc3.id,
        date: todayStr,
        time: '14:00',
        reason: 'Follow-up on pediatric breathing patterns.',
        status: 'PENDING',
        notes: 'Parents requested Dr. Foster.'
      }
    });

    const apt3 = await db.appointment.create({
      data: {
        id: 'apt-3',
        patientId: pat3.id,
        doctorId: doc2.id,
        date: twoDaysAgoStr,
        time: '09:00',
        reason: 'Cardiac stress test.',
        status: 'COMPLETED',
        notes: 'Completed successfully. Resting heart rate normal.'
      }
    });

    await db.appointment.create({
      data: {
        id: 'apt-4',
        patientId: pat4.id,
        doctorId: doc1.id,
        date: tomorrowStr,
        time: '11:15',
        reason: 'Executive wellness exam.',
        status: 'CONFIRMED',
        notes: 'Routine blood tests ordered.'
      }
    });

    // 6. Seed Medical Records
    await db.medicalRecord.create({
      data: {
        id: 'rec-1',
        patientId: pat3.id,
        doctorId: doc2.id,
        appointmentId: apt3.id,
        symptoms: 'Mild muscular strain around rib cage, exhaustion.',
        diagnosis: 'Acute fatigue and physical overexertion.',
        treatment: 'Mandatory 48-hour bed rest, high hydration.',
        prescription: 'Ibuprofen 400mg twice daily for discomfort.',
        date: twoDaysAgoStr
      }
    });

    await db.medicalRecord.create({
      data: {
        id: 'rec-2',
        patientId: pat1.id,
        doctorId: doc1.id,
        symptoms: 'Persistent dry cough and fatigue for 3 weeks.',
        diagnosis: 'Post-viral bronchial hyperreactivity.',
        treatment: 'Hydration, avoidance of triggers, inhaled bronchodilator.',
        prescription: 'Albuterol inhaler 90mcg, 2 puffs every 6 hours.',
        date: '2026-05-12'
      }
    });

    await db.medicalRecord.create({
      data: {
        id: 'rec-3',
        patientId: pat2.id,
        doctorId: doc3.id,
        symptoms: 'Shortness of breath with physical activity.',
        diagnosis: 'Mild persistent Asthma.',
        treatment: 'Daily controller medication and rescue inhaler.',
        prescription: 'Fluticasone 110mcg daily, Albuterol for rescue.',
        date: '2026-06-20'
      }
    });

    await db.medicalRecord.create({
      data: {
        id: 'rec-4',
        patientId: pat4.id,
        doctorId: doc1.id,
        symptoms: 'No physical symptoms. Requested annual physiological baseline.',
        diagnosis: 'Exceptional bone density, cellular vitality, and cardiac efficiency.',
        treatment: 'None needed. Maintain current dietary and environmental habits.',
        prescription: 'N/A',
        date: '2026-06-01'
      }
    });

    await db.medicalRecord.create({
      data: {
        id: 'rec-5',
        patientId: pat5.id,
        doctorId: doc1.id,
        symptoms: 'Aesthetic check-up, general athletic stress review.',
        diagnosis: 'Peak athletic physiological state. Superior cardiovascular reserves.',
        treatment: 'Regular rest cycles between intensive field deployments.',
        prescription: 'Multivitamins',
        date: '2026-06-15'
      }
    });

    await db.medicalRecord.create({
      data: {
        id: 'rec-6',
        patientId: pat6.id,
        doctorId: doc1.id,
        symptoms: 'Extreme fatigue and elevated body temperature (39.5 C).',
        diagnosis: 'Benign physiological hyper-metabolism.',
        treatment: 'High caloric diet and increased fluid intake. 12 hours undisturbed rest.',
        prescription: 'Paracetamol 500mg for fever control.',
        date: '2026-07-01'
      }
    });

    await db.medicalRecord.create({
      data: {
        id: 'rec-7',
        patientId: pat7.id,
        doctorId: doc1.id,
        symptoms: 'Ankle sprain following rapid acceleration.',
        diagnosis: 'Grade I ligament strain - already 90% healed at assessment.',
        treatment: 'Light stretching, temporary restriction of high-speed maneuvers.',
        prescription: 'None. Healing rate is exceptionally accelerated.',
        date: '2026-07-05'
      }
    });

    // 7. Seed Bills & Payments
    const bill1 = await db.bill.create({
      data: {
        id: 'bill-1',
        patientId: pat3.id,
        appointmentId: apt3.id,
        totalAmount: 3500000.00,
        paidAmount: 3500000.00,
        status: 'PAID',
        dueDate: todayStr,
        createdAt: new Date(Date.now() - 86400000 * 2)
      }
    });

    const twoWeeksLaterStr = new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0];
    await db.bill.create({
      data: {
        id: 'bill-2',
        patientId: pat1.id,
        appointmentId: apt1.id,
        totalAmount: 1200000.00,
        paidAmount: 0.00,
        status: 'UNPAID',
        dueDate: twoWeeksLaterStr
      }
    });

    const bill3 = await db.bill.create({
      data: {
        id: 'bill-3',
        patientId: pat2.id,
        appointmentId: null,
        totalAmount: 245000.00,
        paidAmount: 120000.00,
        status: 'PARTIALLY_PAID',
        dueDate: twoWeeksLaterStr
      }
    });

    await db.payment.create({
      data: {
        id: 'pay-1',
        billId: bill1.id,
        amount: 3500000.00,
        paymentMethod: 'Card',
        paymentDate: twoDaysAgoStr,
        transactionId: 'TXN-9823412039'
      }
    });

    await db.payment.create({
      data: {
        id: 'pay-2',
        billId: bill3.id,
        amount: 120000.00,
        paymentMethod: 'Mobile Money',
        paymentDate: todayStr,
        transactionId: 'TXN-8374829104'
      }
    });

    console.log('Database initial seed completed successfully.');
  } catch (error) {
    console.error('Error seeding database with dummy data:', error);
  }
}
