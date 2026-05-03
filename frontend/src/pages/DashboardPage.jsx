import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardApi, appointmentApi, prescriptionApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { formatDate, formatDateTime } from '../utils/formatters.js';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'admin') {
          const { data } = await dashboardApi.summary();
          setSummary(data);
        }
        const appointmentParams = user?.role === 'patient' && profile?._id ? { patientId: profile._id } : user?.role === 'doctor' && profile?._id ? { doctorId: profile._id } : {};
        const { data: appointmentData } = await appointmentApi.list(appointmentParams);
        setAppointments(Array.isArray(appointmentData) ? appointmentData : []);

        if (user?.role === 'patient' && profile?._id) {
          const { data: prescriptionData } = await prescriptionApi.listByPatient(profile._id);
          setPrescriptions(Array.isArray(prescriptionData) ? prescriptionData : []);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    };

    load();
  }, [profile?._id, user?.role]);

  const chartData = useMemo(() => {
    if (!summary?.monthlyAppointments) return [];
    return summary.monthlyAppointments.map((item) => ({
      name: `${item._id.month}/${item._id.year}`,
      total: item.total,
    }));
  }, [summary]);

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Welcome back, ${user?.name || 'User'}`}
        subtitle="A role-aware operational view of the hospital system"
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={3}>
        {isAdmin ? (
          <>
            <Grid item xs={12} sm={6} lg={3}><StatCard label="Patients" value={summary?.totals?.patients ?? 0} icon={<GroupsIcon />} /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard label="Doctors" value={summary?.totals?.doctors ?? 0} icon={<LocalHospitalIcon />} accent="#b45309" /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard label="Appointments" value={summary?.totals?.appointments ?? 0} icon={<EventIcon />} accent="#2563eb" /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard label="Invoices" value={summary?.totals?.invoices ?? 0} icon={<ReceiptLongIcon />} accent="#7c3aed" /></Grid>
          </>
        ) : null}
        {isDoctor ? (
          <Grid item xs={12} sm={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Doctor profile</Typography>
                <Typography variant="h5" fontWeight={800}>{profile?.specialization || 'General Practice'}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.department || 'Department not set'}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={`Experience: ${profile?.experienceYears || 0} years`} sx={{ mr: 1 }} />
                  <Chip label={`Fee: ${profile?.consultationFee || 0}`} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ) : null}
        {isPatient ? (
          <Grid item xs={12} sm={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Patient summary</Typography>
                <Typography variant="h5" fontWeight={800}>{profile?.bloodGroup || 'Blood group pending'}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.address || 'No address on file'}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={`DOB: ${formatDate(profile?.dateOfBirth)}`} sx={{ mr: 1 }} />
                  <Chip label={`Reports: ${profile?.reports?.length || 0}`} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>

      {isAdmin ? (
        <Card>
          <CardContent sx={{ height: 360 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Monthly appointments
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            Recent appointments
          </Typography>
          <Stack spacing={1.5}>
            {appointments.slice(0, 5).map((appointment) => (
              <Box key={appointment._id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, p: 2, borderRadius: 2, background: 'rgba(15, 118, 110, 0.05)' }}>
                <Box>
                  <Typography fontWeight={700}>{appointment.reason}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(appointment.date)} | {appointment.status}
                  </Typography>
                </Box>
                <Chip label={appointment.mode} size="small" />
              </Box>
            ))}
            {!appointments.length ? <Typography color="text.secondary">No appointments yet.</Typography> : null}
          </Stack>
        </CardContent>
      </Card>

      {isPatient ? (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <MedicalServicesIcon fontSize="small" color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Recent prescriptions
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {prescriptions.slice(0, 5).map((prescription) => (
                <Box key={prescription._id} sx={{ p: 2, borderRadius: 2, background: 'rgba(37, 99, 235, 0.06)' }}>
                  <Typography fontWeight={700}>{prescription.diagnosis}</Typography>
                  <Typography variant="body2" color="text.secondary">{formatDate(prescription.createdAt)}</Typography>
                  <Typography variant="body2" color="text.secondary">Medicines: {prescription.medications?.length || 0}</Typography>
                </Box>
              ))}
              {!prescriptions.length ? <Typography color="text.secondary">No prescriptions yet.</Typography> : null}
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
};

export default DashboardPage;
