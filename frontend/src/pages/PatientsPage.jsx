import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { patientApi, doctorApi } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { getApiMessage } from '../utils/apiError.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  bloodGroup: '',
  address: '',
  medicalHistory: '',
};

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [doctorId, setDoctorId] = useState('');
  const [error, setError] = useState('');

  const loadPatients = async () => {
    const { data } = await patientApi.list({ search });
    setPatients(data.patients || []);
  };

  useEffect(() => {
    loadPatients().catch((err) => setError(getApiMessage(err)));
    doctorApi.list().then(({ data }) => setDoctors(data.doctors || [])).catch(() => null);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (patient) => {
    setEditing(patient);
    setForm({
      name: patient.user?.name || '',
      email: patient.user?.email || '',
      password: '',
      phone: patient.user?.phone || '',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '',
      gender: patient.gender || 'male',
      bloodGroup: patient.bloodGroup || '',
      address: patient.address || '',
      medicalHistory: Array.isArray(patient.medicalHistory) ? patient.medicalHistory.join(', ') : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    const payload = {
      ...form,
      medicalHistory: form.medicalHistory
        ? form.medicalHistory.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editing) {
        await patientApi.update(editing._id, payload);
      } else {
        await patientApi.create(payload);
      }
      setDialogOpen(false);
      await loadPatients();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await patientApi.remove(deleteId);
      setDeleteId(null);
      await loadPatients();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  const handleAssign = async () => {
    if (!assigning || !doctorId) return;
    try {
      await patientApi.assignDoctor(assigning._id, doctorId);
      setAssignOpen(false);
      setDoctorId('');
      setAssigning(null);
      await loadPatients();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader title="Patients" subtitle="Manage patient records, history, and doctor assignments" actionLabel="New Patient" onAction={openCreate} actionIcon={<AddIcon />} />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField label="Search patients" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
      <Grid container spacing={2}>
        {patients.map((patient) => (
          <Grid item xs={12} md={6} lg={4} key={patient._id}>
            <Box sx={{ p: 2.5, borderRadius: 3, background: 'white', boxShadow: '0 12px 24px rgba(15,23,42,0.06)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={800}>{patient.user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{patient.user?.email}</Typography>
                  <Typography variant="body2" color="text.secondary">{patient.bloodGroup || 'Blood group not set'}</Typography>
                </Box>
                <Stack direction="row">
                  <IconButton onClick={() => openEdit(patient)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton onClick={() => { setAssigning(patient); setAssignOpen(true); }}><AssignmentIndIcon fontSize="small" /></IconButton>
                  <IconButton onClick={() => setDeleteId(patient._id)}><DeleteIcon fontSize="small" /></IconButton>
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ mt: 2 }}>{patient.address || 'No address provided'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned doctor: {patient.assignedDoctor?.user?.name || 'Not assigned'}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit patient' : 'Create patient'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField label="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} fullWidth />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} fullWidth />
            <TextField label="Date of birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField select label="Gender" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} fullWidth>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField label="Blood group" value={form.bloodGroup} onChange={(e) => setForm((prev) => ({ ...prev, bloodGroup: e.target.value }))} fullWidth />
            <TextField label="Address" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} fullWidth multiline minRows={2} />
            <TextField label="Medical history (comma separated)" value={form.medicalHistory} onChange={(e) => setForm((prev) => ({ ...prev, medicalHistory: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Assign doctor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} fullWidth>
              {doctors.map((doctor) => <MenuItem key={doctor._id} value={doctor._id}>{doctor.user?.name} - {doctor.specialization}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign}>Assign</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteId)} title="Delete patient" description="This will remove the patient record and linked user account." onClose={() => setDeleteId(null)} onConfirm={handleDelete} confirmText="Delete" />
    </Stack>
  );
};

export default PatientsPage;
