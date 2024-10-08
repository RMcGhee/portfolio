import { useEffect, useState } from 'react';
import { Container, ThemeProvider, CssBaseline } from '@mui/material';
import { Box } from '@mui/system';
import { Link, Outlet, useLocation } from 'react-router-dom';
import theme from './base-theme';

import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import jhc from './img/joule-home-sc.png'
import bad from './img/badlands.jpg'
import msa from './img/msa.png'
import { LeftGrow } from './common/Basic';
import BottomNav from './BottomNav';

function App() {
  const [renderOrder, setRenderOrder] = useState(0);
  const [renderTimer, setRenderTimer] = useState<NodeJS.Timer|null>(null);

  const location = useLocation();
  const isRootRoute = location.pathname === '/';

  useEffect(() => {
    window.scrollTo(0,0);
  }, [location]);

  useEffect(() => {
      const interval = setInterval(() => setRenderOrder(renderOrder + 1), 450);
      setRenderTimer(interval);

      return () => clearInterval(interval);
  }, [renderOrder]);

  useEffect(() => {
    if (renderOrder >= 4 && renderTimer !== null) {
      clearInterval(renderTimer);
    }
  }, [renderOrder, renderTimer]);

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline>
    <Container sx={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: '0px' }}>
      <Box sx={{ flexGrow: 1, paddingBottom: '100px' }}>
      {isRootRoute && 
        <div>
          <LeftGrow><Box sx={{ flexGrow: 0}} style={{ marginTop: 15 }}>
            <h1>portfolio</h1>
          </Box></LeftGrow>
          
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: '500px' }}>
            <LeftGrow trigger={renderOrder > 0}>
              <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }} style={{ gap: 15, marginTop: 15 }}>
                <h3 style={{ whiteSpace: 'nowrap' }}>joule-home</h3>
                <Link to='/joule-home'>
                  <img src={jhc} alt='Graphs of energy usage' style={{ maxHeight: '25vh', objectFit: 'contain' }}></img>
                </Link>
              </Box>
            </LeftGrow>
            <LeftGrow trigger={renderOrder > 1}>
              <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }} style={{ gap: 15, marginTop: 15 }}>
                <h3 style={{ whiteSpace: 'nowrap' }}>photography</h3>
                <Link to='/photography'>
                  <img src={bad} alt='The badlands in black and white' style={{ maxHeight: '25vh', objectFit: 'contain' }}></img>
                </Link>
              </Box>
            </LeftGrow>
            <LeftGrow trigger={renderOrder > 2}>
              <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }} style={{ gap: 15, marginTop: 15 }}>
                <h3 style={{ whiteSpace: 'nowrap' }}>biology</h3>
                <Link to='/biology'>
                  <img src={msa} alt='Python code screenshot' style={{ maxHeight: '25vh', objectFit: 'contain' }}></img>
                </Link>
              </Box>
            </LeftGrow>
          </Box>
        </div>
      }
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
