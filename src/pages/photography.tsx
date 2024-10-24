import { useEffect, useState } from 'react';
import { Box } from '@mui/system';

import '../App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AnnotatedImage, LeftGrow } from '../common/Basic';
import photos from '../img/photos';
import { useFadeOrder } from '../hooks/useFadeOrder';

function Photography() {
  const [ fadeOrder ] = useFadeOrder(6);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <LeftGrow><Box sx={{ flexGrow: 0}} style={{ marginTop: 15 }}>
        <h1>photography</h1>
      </Box></LeftGrow>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: '500px' }}>
        <AnnotatedImage img={photos.d} maxHeight='80vh' trigger={fadeOrder > 0}>
            <p>Outer Disk at Big Tree
            Big Tree, a local landmark. This is the view during the winter, when the outer disk of the milky way is prominent. 
            This is a little over 20 images taken on a Pentax K-50 (28mm f2.8 ISO 3200)</p>
        </AnnotatedImage>
        <AnnotatedImage img={photos.e} maxHeight='80vh' trigger={fadeOrder > 1}>
        <p>Galactic Core Rising Over Big Tree 
          This is the galactic core of the milky way galaxy, visible late spring through August in the northern hemisphere.
          This is about 30 images taken on a Pentax K-50 (28mm f2.8 ISO 3200), processed in Lightroom, Microsoft ICE, and Photoshop.
        </p>
        </AnnotatedImage>
        <AnnotatedImage img={photos.f} maxHeight='80vh' trigger={fadeOrder > 2}>
        <p>The following images were taken during a back country camping trip in the badlands, as well as a visit to landmarks nearby.</p>
        </AnnotatedImage>
        <AnnotatedImage img={photos.g} maxHeight='80vh' trigger={fadeOrder > 3}>
          <p/>
        </AnnotatedImage>
        <AnnotatedImage img={photos.h} maxHeight='80vh' trigger={fadeOrder > 4}>
        <p>Crazy Horse Memorial</p>
        </AnnotatedImage>
        <AnnotatedImage img={photos.i} maxHeight='80vh' trigger={fadeOrder > 5}>
          <p>Devil's Tower, WY</p>
        </AnnotatedImage>
      </Box>
    </Box>
  );
}

export default Photography;
