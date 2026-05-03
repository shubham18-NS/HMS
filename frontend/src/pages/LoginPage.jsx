import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiMessage } from '../utils/apiError.js';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, background: 'radial-gradient(circle at top, #d9f7f1 0%, #f5f7fb 45%, #eef2ff 100%)' }}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: '0 30px 60px rgba(15, 23, 42, 0.12)', overflow: 'visible' }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 48, height: 48, borderRadius: 3, background: 'linear-gradient(135deg, #0f766e, #14b8a6)', display: 'grid', placeItems: 'center', color: 'white' }}>
                  <LocalHospitalIcon />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    HMS Portal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Secure access for staff and patients
                  </Typography>
                </Box>
              </Stack>
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.2}>
                  {error ? <Alert severity="error">{error}</Alert> : null}
                  <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} fullWidth required />
                  <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} fullWidth required />
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? 'Signing in...' : 'Login'}
                  </Button>
                </Stack>
              </Box>
              <Typography variant="body2" color="text.secondary">
                New here? <Link to="/register">Create an account</Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
