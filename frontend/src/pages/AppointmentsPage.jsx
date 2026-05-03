import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { appointmentApi, doctorApi, patientApi } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiMessage } from '../utils/apiError.js';
import { formatDate } from '../utils/formatters.js';

const AppointmentsPage = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '', timeSlot: { start: '', end: '' }, reason: '', mode: 'in-person', notes: '' });
  const bookingDoctorId = user?.role === 'doctor' ? profile?._id : form.doctorId;

  const loadData = async () => {
    const params = user?.role === 'patient' && profile?._id ? { patientId: profile._id } : user?.role === 'doctor' && profile?._id ? { doctorId: profile._id } : {};
    const [{ data: appointmentData }, { data: doctorData }] = await Promise.all([appointmentApi.list(params), doctorApi.list()]);
    setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
    setDoctors(doctorData.doctors || []);
    if (user?.role === 'admin') {
      const { data: patientData } = await patientApi.list();
      setPatients(patientData.patients || []);
    }
  };

  useEffect(() => {
    loadData().catch((err) => setError(getApiMessage(err)));
  }, [profile?._id, user?.role]);

  useEffect(() => {
    if (bookingDoctorId && form.date) {
      appointmentApi.availableSlots(bookingDoctorId, { date: form.date }).then(({ data }) => setSlots(data.slots || [])).catch(() => setSlots([]));
      return;
    }
    setSlots([]);
  }, [bookingDoctorId, form.date]);

  const openDialog = () => {
    setForm({ patientId: '', doctorId: user?.role === 'doctor' ? profile?._id || '' : '', date: '', timeSlot: { start: '', end: '' }, reason: '', mode: 'in-person', notes: '' });
    setSlots([]);
    setError('');
    setDialogOpen(true);
  };

  const createAppointment = async () => {
    try {
      await appointmentApi.create({ ...form, patientId: user?.role === 'patient' ? profile?._id : form.patientId, doctorId: user?.role === 'doctor' ? profile?._id : form.doctorId });
      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      await loadData();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader title="Appointments" subtitle="Book, approve, reject, and manage appointment slots" actionLabel={user?.role === 'patient' ? 'Book appointment' : 'New appointment'} onAction={openDialog} actionIcon={<EventIcon />} />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Grid container spacing={2}>
        {appointments.map((appointment) => (
          <Grid item xs={12} md={6} lg={4} key={appointment._id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>{appointment.reason}</Typography>
                    <Typography variant="body2" color="text.secondary">{formatDate(appointment.date)} | {appointment.timeSlot?.start} - {appointment.timeSlot?.end}</Typography>
                  </Box>
                  <Chip label={appointment.status} color={appointment.status === 'approved' ? 'success' : appointment.status === 'rejected' ? 'error' : 'warning'} size="small" />
                </Stack>
                <Typography variant="body2" sx={{ mt: 2 }}>Mode: {appointment.mode}</Typography>
                <Typography variant="body2" color="text.secondary">Doctor: {appointment.doctor?.user?.name || appointment.doctor?.user?.name}</Typography>
                {(user?.role === 'doctor' || user?.role === 'admin') && appointment.status === 'pending' ? (
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button size="small" variant="contained" onClick={() => updateStatus(appointment._id, 'approved')}>Approve</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => updateStatus(appointment._id, 'rejected')}>Reject</Button>
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New appointment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {user?.role !== 'patient' ? (
              <TextField select label="Patient" value={form.patientId} onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))} fullWidth>
                {patients.map((patient) => <MenuItem key={patient._id} value={patient._id}>{patient.user?.name}</MenuItem>)}
              </TextField>
            ) : null}
            {user?.role !== 'doctor' ? (
              <TextField select label="Doctor" value={form.doctorId} onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value, timeSlot: { start: '', end: '' } }))} fullWidth>
                {doctors.map((doctor) => <MenuItem key={doctor._id} value={doctor._id}>{doctor.user?.name} - {doctor.specialization}</MenuItem>)}
              </TextField>
            ) : null}
            <TextField label="Appointment date" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value, timeSlot: { start: '', end: '' } }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField select label="Time slot" value={form.timeSlot.start} onChange={(e) => {
              const slot = slots.find((item) => item.startTime === e.target.value);
              setForm((prev) => ({ ...prev, timeSlot: { start: slot?.startTime || e.target.value, end: slot?.endTime || '' } }));
            }} fullWidth disabled={!bookingDoctorId || !form.date || slots.length === 0} helperText={!bookingDoctorId ? 'Select a doctor first' : !form.date ? 'Select a date first' : slots.length === 0 ? 'No slots available for the selected date' : ''}>
              {slots.map((slot) => <MenuItem key={`${slot.startTime}-${slot.endTime}`} value={slot.startTime}>{slot.label}</MenuItem>)}
            </TextField>
            <TextField label="Reason" value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField select label="Mode" value={form.mode} onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))} fullWidth>
              <MenuItem value="in-person">In-person</MenuItem>
              <MenuItem value="online">Online</MenuItem>
            </TextField>
            <TextField label="Notes" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createAppointment}>Book</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AppointmentsPage;
