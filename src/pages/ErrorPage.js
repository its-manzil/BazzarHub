// pages/ErrorPage.js
import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h1" sx={{ mb: 2 }}>
        Oops!
      </Typography>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Sorry, an unexpected error has occurred.
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        {error.statusText || error.message}
      </Typography>
      <Button 
        variant="contained" 
        component={Link} 
        to="/"
        size="large"
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default ErrorPage;