import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/formatters.js';

const RecordsPage = () => {
  const { profile } = useAuth();

  return (
    <Stack spacing={3}>
      <PageHeader title="Medical Records" subtitle="Patient history, reports, and clinical notes" />
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={800}>{profile?.user?.name || 'Patient'}</Typography>
          <Typography variant="body2" color="text.secondary">DOB: {formatDate(profile?.dateOfBirth)}</Typography>
          <Typography variant="body2" color="text.secondary">Blood group: {profile?.bloodGroup || '-'}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            {(profile?.medicalHistory || []).map((item) => <Chip key={item} label={item} sx={{ mb: 1 }} />)}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default RecordsPage;
