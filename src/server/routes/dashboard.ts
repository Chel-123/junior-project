import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

// GET /api/reports/dashboard
router.get('/reports/dashboard', async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      payments,
      recentPatients,
      recentAppointmentsList,
      allAppointments
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.payment.findMany(),
      prisma.patient.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, doctor: true }
      }),
      prisma.appointment.findMany()
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    const recentAppointments = recentAppointmentsList.map(a => ({
      ...a,
      patientName: a.patient ? a.patient.name : 'Unknown',
      doctorName: a.doctor ? a.doctor.name : 'Unknown'
    }));

    const revenueChartData = [
      { name: 'Jan', revenue: 4500000 },
      { name: 'Feb', revenue: 5800000 },
      { name: 'Mar', revenue: 7200000 },
      { name: 'Apr', revenue: 8100000 },
      { name: 'May', revenue: 9200000 },
      { name: 'Jun', revenue: totalRevenue }
    ];

    const appointmentChartData = [
      { name: 'Confirmed', value: allAppointments.filter(a => a.status === 'CONFIRMED').length },
      { name: 'Pending', value: allAppointments.filter(a => a.status === 'PENDING').length },
      { name: 'Completed', value: allAppointments.filter(a => a.status === 'COMPLETED').length },
      { name: 'Cancelled', value: allAppointments.filter(a => a.status === 'CANCELLED').length }
    ];

    res.json({
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue
      },
      recentPatients,
      recentAppointments,
      revenueChartData,
      appointmentChartData
    });
  } catch (error) {
    console.error('Error generating dashboard reports:', error);
    res.status(500).json({ message: 'Error generating reports' });
  }
});

export default router;
