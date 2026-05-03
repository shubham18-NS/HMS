import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { doctorApi } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiMessage } from '../utils/apiError.js';

const defaultAvailabilitySlot = { dayOfWeek: 1, specificDate: '', startTime: '09:00', endTime: '17:00', slotDuration: 30 };
const weekDays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  department: '',
  experienceYears: 0,
  consultationFee: 0,
  bio: '',
  availability: [],
};

const normalizeAvailability = (availability = []) =>
  availability
    .map((slot) => ({
      dayOfWeek: Number(slot.dayOfWeek),
      specificDate: slot.specificDate || '',
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDuration: Number(slot.slotDuration) || 30,
    }))
    .filter((slot) => Number.isInteger(slot.dayOfWeek) && slot.dayOfWeek >= 0 && slot.dayOfWeek <= 6 && slot.startTime && slot.endTime);

const DoctorsPage = () => {
  const { user, profile } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadDoctors = async () => {
    if (isDoctor && profile?._id) {
      const { data } = await doctorApi.get(profile._id);
      setDoctors(data ? [data] : []);
      return;
    }

    const { data } = await doctorApi.list({ search });
    setDoctors(data.doctors || []);
  };

  useEffect(() => {
    loadDoctors().catch((err) => setError(getApiMessage(err)));
  }, [search, isDoctor, profile?._id]);

  const openCreate = () => {
    if (!isAdmin) return;
    setEditing(null);
    setForm({ ...emptyForm, availability: [defaultAvailabilitySlot] });
    setDialogOpen(true);
  };

  const openEdit = (doctor) => {
    setEditing(doctor);
    setForm({
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      password: '',
      phone: doctor.user?.phone || '',
      specialization: doctor.specialization || '',
      department: doctor.department || '',
      experienceYears: doctor.experienceYears || 0,
      consultationFee: doctor.consultationFee || 0,
      bio: doctor.bio || '',
      availability: normalizeAvailability(doctor.availability || []),
    });
    setDialogOpen(true);
  };

  const openAvailabilityEditor = () => {
    if (!doctors.length) {
      setError('Your doctor profile is not available yet.');
      return;
    }

    openEdit(doctors[0]);
  };

  const updateAvailabilityField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addAvailabilitySlot = () => {
    setForm((prev) => ({ ...prev, availability: [...prev.availability, { ...defaultAvailabilitySlot }] }));
  };

  const removeAvailabilitySlot = (index) => {
    setForm((prev) => ({ ...prev, availability: prev.availability.filter((_, idx) => idx !== index) }));
  };

  const handleSave = async () => {
    setError('');
    const normalizedAvailability = normalizeAvailability(form.availability || []);

    if (normalizedAvailability.some((slot) => slot.startTime >= slot.endTime)) {
      setError('Each availability slot must have an end time after start time.');
      return;
    }

    const payload = {
      ...form,
      availability: normalizedAvailability,
      experienceYears: Number(form.experienceYears),
      consultationFee: Number(form.consultationFee),
    };

    try {
      if (editing) {
        if (isDoctor) {
          await doctorApi.availability(editing._id, { availability: normalizedAvailability });
        } else {
          await doctorApi.update(editing._id, payload);
        }
      } else {
        await doctorApi.create(payload);
      }
      setDialogOpen(false);
      await loadDoctors();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await doctorApi.remove(deleteId);
      setDeleteId(null);
      await loadDoctors();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Doctors"
        subtitle={isAdmin ? 'Manage specialists and availability schedules' : 'Set your availability so patients can book by slots'}
        actionLabel={isAdmin ? 'New Doctor' : 'Set Availability'}
        onAction={isAdmin ? openCreate : openAvailabilityEditor}
        actionIcon={<AddIcon />}
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
      {isAdmin ? <TextField label="Search doctors" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth /> : null}
      <Grid container spacing={2}>
        {doctors.map((doctor) => (
          <Grid item xs={12} md={6} lg={4} key={doctor._id}>
            <Box sx={{ p: 2.5, borderRadius: 3, background: 'white', boxShadow: '0 12px 24px rgba(15,23,42,0.06)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={800}>{doctor.user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{doctor.specialization}</Typography>
                  <Typography variant="body2" color="text.secondary">{doctor.department || 'No department'}</Typography>
                </Box>
                <Stack direction="row">
                  <IconButton onClick={() => openEdit(doctor)}><EditIcon fontSize="small" /></IconButton>
                  {isAdmin ? <IconButton onClick={() => setDeleteId(doctor._id)}><DeleteIcon fontSize="small" /></IconButton> : null}
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ mt: 2 }}>{doctor.bio || 'No bio provided'}</Typography>
              <Typography variant="body2" color="text.secondary">Patients: {doctor.patients?.length || 0}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Slot windows: {doctor.availability?.length || 0}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit doctor' : 'Create doctor'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {isAdmin ? (
              <>
                <TextField label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
                <TextField label="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} fullWidth />
                <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} fullWidth />
                <TextField label="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} fullWidth />
                <TextField label="Specialization" value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} fullWidth />
                <TextField label="Department" value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} fullWidth />
                <TextField label="Experience years" type="number" value={form.experienceYears} onChange={(e) => setForm((prev) => ({ ...prev, experienceYears: e.target.value }))} fullWidth />
                <TextField label="Consultation fee" type="number" value={form.consultationFee} onChange={(e) => setForm((prev) => ({ ...prev, consultationFee: e.target.value }))} fullWidth />
                <TextField label="Bio" value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} fullWidth multiline minRows={2} />
              </>
            ) : (
              <Alert severity="info">Configure weekly day slots or set an exact date slot to make patient booking easier.</Alert>
            )}

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>Availability slots</Typography>
              <Button size="small" onClick={addAvailabilitySlot}>Add slot</Button>
            </Stack>
            {form.availability.map((slot, index) => (
              <Box key={`${slot.dayOfWeek}-${slot.startTime}-${index}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Day"
                      value={slot.dayOfWeek}
                      onChange={(e) => updateAvailabilityField(index, 'dayOfWeek', Number(e.target.value))}
                      fullWidth
                      size="small"
                    >
                      {weekDays.map((day) => <MenuItem key={day.value} value={day.value}>{day.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Specific date (optional)"
                      type="date"
                      value={slot.specificDate || ''}
                      onChange={(e) => updateAvailabilityField(index, 'specificDate', e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      helperText="If set, this slot is used for this date only"
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Start"
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateAvailabilityField(index, 'startTime', e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="End"
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateAvailabilityField(index, 'endTime', e.target.value)}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={8} sm={2}>
                    <TextField
                      select
                      label="Duration"
                      value={slot.slotDuration}
                      onChange={(e) => updateAvailabilityField(index, 'slotDuration', Number(e.target.value))}
                      fullWidth
                      size="small"
                    >
                      {[15, 20, 30, 45, 60].map((minutes) => <MenuItem key={minutes} value={minutes}>{minutes} min</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={4} sm={12} md={12}>
                    <Button color="error" size="small" onClick={() => removeAvailabilitySlot(index)} disabled={form.availability.length === 1}>Remove</Button>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} title="Delete doctor" description="This will remove the doctor record and linked user account." onClose={() => setDeleteId(null)} onConfirm={handleDelete} confirmText="Delete" />
    </Stack>
  );
};

export default DoctorsPage;
