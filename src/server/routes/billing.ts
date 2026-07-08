import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

// GET /api/bills
router.get('/bills', async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: { patient: true },
      orderBy: { createdAt: 'desc' }
    });
    const response = bills.map(b => ({
      ...b,
      patientName: b.patient ? b.patient.name : 'Unknown Patient'
    }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

// POST /api/bills
router.post('/bills', async (req, res) => {
  try {
    const { patientId, appointmentId, totalAmount, dueDate } = req.body;
    const newBill = await prisma.bill.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        totalAmount: Number(totalAmount),
        paidAmount: 0.0,
        status: 'UNPAID',
        dueDate
      },
      include: { patient: true }
    });
    res.status(201).json({
      ...newBill,
      patientName: newBill.patient ? newBill.patient.name : 'Unknown Patient'
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ message: 'Error creating bill' });
  }
});

// GET /api/payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// POST /api/payments
router.post('/payments', async (req, res) => {
  try {
    const { billId, amount, paymentMethod } = req.body;
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const payAmount = Number(amount);
    const newPaidAmount = bill.paidAmount + payAmount;
    let newStatus = bill.status;
    if (newPaidAmount >= bill.totalAmount) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const txnId = `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const [payment, updatedBill] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          billId,
          amount: payAmount,
          paymentMethod,
          paymentDate: todayStr,
          transactionId: txnId
        }
      }),
      prisma.bill.update({
        where: { id: billId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus
        }
      })
    ]);

    res.status(201).json({ payment, bill: updatedBill });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Error recording payment' });
  }
});

export default router;
