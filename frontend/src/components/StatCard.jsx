import { Card, CardContent, Stack, Typography } from '@mui/material';

const StatCard = ({ label, value, icon, accent = '#0f766e' }) => {
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(15, 118, 110, 0.1)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(236,253,245,0.88))',
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <div>
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
          </div>
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ width: 56, height: 56, borderRadius: 3, backgroundColor: `${accent}15`, color: accent }}
          >
            {icon}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
