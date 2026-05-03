import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { invoiceApi, patientApi } from '../services/api.js';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiMessage } from '../utils/apiError.js';

const BillingPage = () => {
  const { user, profile } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ patientId: '', amount: '', dueDate: '', notes: '', items: [{ label: 'Consultation', quantity: 1, price: 0 }] });

  const loadInvoices = async () => {
    const params = user?.role === 'patient' && profile?._id ? { patientId: profile._id } : {};
    const [{ data: invoiceData }] = await Promise.all([invoiceApi.list(params)]);
    setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
    if (user?.role === 'admin') {
      const { data: patientData } = await patientApi.list();
      setPatients(patientData.patients || []);
    }
  };

  useEffect(() => {
    loadInvoices().catch((err) => setError(getApiMessage(err)));
  }, [profile?._id, user?.role]);

  const createInvoice = async () => {
    try {
      await invoiceApi.create({
        ...form,
        patientId: user?.role === 'patient' ? profile?._id : form.patientId,
        amount: Number(form.amount),
        items: form.items.map((item) => ({ ...item, quantity: Number(item.quantity), price: Number(item.price) })),
      });
      setDialogOpen(false);
      await loadInvoices();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  const markPaid = async (id) => {
    try {
      await invoiceApi.markPaid(id, { paymentMethod: 'cash' });
      await loadInvoices();
    } catch (err) {
      setError(getApiMessage(err));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader title="Billing" subtitle="Invoices, payment tracking, and billing operations" actionLabel={user?.role === 'admin' ? 'New invoice' : null} onAction={() => setDialogOpen(true)} actionIcon={<ReceiptLongIcon />} />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Grid container spacing={2}>
        {invoices.map((invoice) => (
          <Grid item xs={12} md={6} lg={4} key={invoice._id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>{formatCurrency(invoice.amount)}</Typography>
                    <Typography variant="body2" color="text.secondary">{formatDate(invoice.dueDate)}</Typography>
                  </Box>
                  <Chip label={invoice.status} color={invoice.status === 'paid' ? 'success' : 'warning'} size="small" />
                </Stack>
                <Typography variant="body2" sx={{ mt: 2 }}>{invoice.notes || 'No notes'}</Typography>
                {user?.role === 'admin' && invoice.status !== 'paid' ? (
                  <Button sx={{ mt: 2 }} variant="contained" onClick={() => markPaid(invoice._id)}>
                    Mark paid
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New invoice</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {user?.role !== 'patient' ? (
              <TextField select label="Patient" value={form.patientId} onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))} fullWidth>
                {patients.map((patient) => <MenuItem key={patient._id} value={patient._id}>{patient.user?.name}</MenuItem>)}
              </TextField>
            ) : null}
            <TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} fullWidth />
            <TextField label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Notes" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createInvoice}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default BillingPage;
