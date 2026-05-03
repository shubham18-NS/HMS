import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', px: 2 }}>
    <Box>
      <Typography variant="h2" fontWeight={900}>404</Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>The page could not be found.</Typography>
      <Button component={Link} to="/dashboard" variant="contained">Go to dashboard</Button>
    </Box>
  </Box>
);

export default NotFoundPage;
