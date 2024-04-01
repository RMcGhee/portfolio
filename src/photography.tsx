import React, { useEffect, useState } from 'react';
import { Button, Container, ThemeProvider } from '@mui/material';
import { CssBaseline } from '@mui/material';
import { Box } from '@mui/system';
import theme from './base-theme';

import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import jhc from './img/joule-home-sc.png'
import bad from './img/badlands1.jpg'
import msa from './img/msa.png'
import { AnnotatedImage, LeftGrow } from './common/Basic';
import BottomNav from './BottomNav';
import photos from './img/photos';

// const user_home_url = 'https://rmcghee.github.io/';
const user_home_url = 'localhost:3000/old-pages/';

function Photography() {
  const [renderOrder, setRenderOrder] = useState(0);
  const [renderTimer, setRenderTimer] = useState<NodeJS.Timer|null>(null);

  useEffect(() => {
      const interval = setInterval(() => setRenderOrder(renderOrder + 1), 350);
      setRenderTimer(interval);

      return () => clearInterval(interval);
  }, [renderOrder]);

  useEffect(() => {
    if (renderOrder >= 8 && renderTimer !== null) {
      clearInterval(renderTimer);
    }
  }, [renderOrder, renderTimer]);

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline>
    <Container sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <LeftGrow><Box sx={{ flexGrow: 0}} style={{ marginTop: 15 }}>
        <h1>photography</h1>
      </Box></LeftGrow>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: '500px' }}>
      <AnnotatedImage img={photos.d} trigger={renderOrder > 0}>
          <p>Outer Disk at Big Tree
          Big Tree, a local landmark. This is the view during the winter, when the outer disk of the milky way is prominent. 
          This is a little over 20 images taken on a Pentax K-50 (28mm f2.8 ISO 3200)</p>
      </AnnotatedImage>
      <AnnotatedImage img={photos.e} trigger={renderOrder > 1}>
      <p>Galactic Core Rising Over Big Tree 
        This is the galactic core of the milky way galaxy, visible late spring through August in the northern hemisphere.
        This is about 30 images taken on a Pentax K-50 (28mm f2.8 ISO 3200), processed in Lightroom, Microsoft ICE, and Photoshop.
      </p>
      </AnnotatedImage>
      <AnnotatedImage img={photos.f} trigger={renderOrder > 2}>
      <p>The following images were taken during a back country camping trip in the badlands, as well as a visit to landmarks nearby.</p>
      </AnnotatedImage>
      <AnnotatedImage img={photos.g} trigger={renderOrder > 3}>
        <p/>
      </AnnotatedImage>
      <AnnotatedImage img={photos.h} trigger={renderOrder > 4}>
      <p>Crazy Horse Memorial</p>
      </AnnotatedImage>
      <AnnotatedImage img={photos.i} trigger={renderOrder > 4}>
        <p>Devil's Tower, WY</p>
      </AnnotatedImage>
      </Box>
      <BottomNav/>
    </Container>
    </CssBaseline>
    </ThemeProvider>
  );
}

export default Photography;
