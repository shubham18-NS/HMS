import { Box, Button, Stack, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, actionLabel, onAction, actionIcon }) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    justifyContent="space-between"
    alignItems={{ xs: 'flex-start', sm: 'center' }}
    spacing={2}
    sx={{ mb: 3 }}
  >
    <Box>
      <Typography variant="h4" fontWeight={800}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {subtitle}
      </Typography>
    </Box>
    {actionLabel ? (
      <Button variant="contained" startIcon={actionIcon} onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </Stack>
);

export default PageHeader;
