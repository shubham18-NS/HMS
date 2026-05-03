import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { prescriptionApi, patientApi, doctorApi } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiMessage } from '../utils/apiError.js';

const emptyMedication = { name: '', dosage: '', duration: '', notes: '' };
const emptyForm = { patientId: '', doctorId: '', diagnosis: '', instructions: '', medications: [{ ...emptyMedication }] };

const PrescriptionsPage = () => {
  const { user, profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    if (user?.role === 'patient' && profile?._id) {
      const { data } = await prescriptionApi.listByPatient(profile._id);
      setPrescriptions(data || []);
      return;
    }

    const [patientRes, doctorRes] = await Promise.all([patientApi.list(), doctorApi.list()]);
    setPatients(patientRes.data.patients || []);
    setDoctors(doctorRes.data.doctors || []);
    if (profile?._id) {
      const { data } = await prescriptionApi.listByPatient(profile._id);
      setPrescriptions(data || []);
    }
  };

  useEffect(() => {
    loadData().catch((err) => setError(getApiMessage(err)));
  }, [profile?._id, user?.role]);

  const createPrescription = async () => {
    try {
      const medications = (form.medications || [])
        .map((item) => ({
          name: item.name?.trim(),
          dosage: item.dosage?.trim(),
          duration: item.duration?.trim(),
          notes: item.notes?.trim(),
        }))
        .filter((item) => item.name && item.dosage && item.duration);

      await prescriptionApi.create({
        ...form,
        patientId: user?.role === 'patient' ? profile?._id : form.patientId,
        doctorId: user?.role === 'doctor' ? profile?._id : form.doctorId,
        medications,
      });
      setForm(emptyForm);
      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  const updateMedicationField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addMedication = () => {
    setForm((prev) => ({ ...prev, medications: [...prev.medications, { ...emptyMedication }] }));
  };

  const removeMedication = (index) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <Stack spacing={3}>
      <PageHeader title="Prescriptions" subtitle="Add and review medication plans and treatment notes" actionLabel={user?.role !== 'patient' ? 'New prescription' : null} onAction={() => setDialogOpen(true)} actionIcon={<MedicalServicesIcon />} />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Grid container spacing={2}>
        {prescriptions.map((prescription) => (
          <Grid item xs={12} md={6} lg={4} key={prescription._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>{prescription.diagnosis}</Typography>
                <Typography variant="body2" color="text.secondary">{prescription.instructions || 'No instructions'}</Typography>
                <Box sx={{ mt: 2 }}>
                  {(prescription.medications || []).map((medicine) => (
                    <Typography variant="body2" key={`${medicine.name}-${medicine.dosage}`}>
                      {medicine.name} - {medicine.dosage} - {medicine.duration}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New prescription</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {user?.role !== 'patient' ? (
              <TextField select label="Patient" value={form.patientId} onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))} fullWidth>
                {patients.map((patient) => <MenuItem key={patient._id} value={patient._id}>{patient.user?.name}</MenuItem>)}
              </TextField>
            ) : null}
            {user?.role !== 'doctor' ? (
              <TextField select label="Doctor" value={form.doctorId} onChange={(e) => setForm((prev) => ({ ...prev, doctorId: e.target.value }))} fullWidth>
                {doctors.map((doctor) => <MenuItem key={doctor._id} value={doctor._id}>{doctor.user?.name}</MenuItem>)}
              </TextField>
            ) : null}
            <TextField label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm((prev) => ({ ...prev, diagnosis: e.target.value }))} fullWidth />
            <TextField label="Instructions" value={form.instructions} onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))} fullWidth multiline minRows={2} />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>Medications</Typography>
              <Button size="small" onClick={addMedication}>Add medicine</Button>
            </Stack>
            {form.medications.map((medicine, index) => (
              <Box key={`medicine-${index}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Name"
                      value={medicine.name}
                      onChange={(e) => updateMedicationField(index, 'name', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Dosage"
                      value={medicine.dosage}
                      onChange={(e) => updateMedicationField(index, 'dosage', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Duration"
                      value={medicine.duration}
                      onChange={(e) => updateMedicationField(index, 'duration', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Notes (optional)"
                      value={medicine.notes}
                      onChange={(e) => updateMedicationField(index, 'notes', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Button color="error" size="small" onClick={() => removeMedication(index)} disabled={form.medications.length === 1} sx={{ mt: 1 }}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createPrescription}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PrescriptionsPage;
