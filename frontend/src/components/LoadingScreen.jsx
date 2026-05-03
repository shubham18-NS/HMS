import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = () => (
  <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', gap: 2 }}>
    <CircularProgress color="primary" />
    <Typography color="text.secondary">Loading HMS...</Typography>
  </Box>
);

export default LoadingScreen;
