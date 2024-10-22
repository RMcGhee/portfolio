import { Container, ThemeProvider, CssBaseline } from '@mui/material';
import { Box } from '@mui/system';
import { Outlet, useLocation } from 'react-router-dom';
import theme from './base-theme';

import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import BottomNav from './BottomNav';
import Home from './pages/home';

function App() {
  const location = useLocation();
  const isRootRoute = location.pathname === '/';

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline>
    <Container sx={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: '0px' }}>
      <Box sx={{ flexGrow: 1, paddingBottom: '100px' }}>
      {isRootRoute && <Home />}
      <Outlet/ >
      </Box>
      <Box marginBottom='0px'> {/* Prevents marginBottom on BottomNav from being rendered off page */}
        <BottomNav/>
      </Box>
    </Container>
    </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
