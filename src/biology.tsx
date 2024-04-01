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
import { AnnotatedImage, LeftGrow } from './common/Basic';
import BottomNav from './BottomNav';
import photos from './img/photos';

// const user_home_url = 'https://rmcghee.github.io/';
const user_home_url = 'localhost:3000/old-pages/';

function Biology() {
  return (
    <ThemeProvider theme={theme}>
    <CssBaseline>
    <Container sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <LeftGrow><Box sx={{ flexGrow: 0}} style={{ marginTop: 15 }}>
        <h1>biology</h1>
      </Box></LeftGrow>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: '500px' }}>
        <p>
          <h2> What is synthetic biology? </h2>
          Synthetic biology is the interdisciplinary field that combines biochemistry, systems biology, computer science, and genetic engineering to solve real world problems with biological machines. These machines can do a number of different things, from producing insulin for diabetics, to sensing toxins in a water sample, to isolating and destroying DNA from pathogenic viruses. In the coming years, synthetic biology will make progress towards better treatments for cancer, proactively treating pathogenic diseases, and mass production of complex molecules.
          <h2> New HIV test </h2>
          During my first year as president of Mizzou's Synthetic Biology Research Group (SynBRG), we desiged a new test for HIV that has the possibility of being a more distributable, more affordable test. The basis for this test is a microfluidic device that reports the results of the test with a color change, not unlike a pregnancy test.
          <h3> Motivation </h3>
          Current HIV tests suffer from one or more of the following problems:
          - Thermally unstable, rendering the test difficult to deliver to underserved areas in rural communities that are many times the most affected by HIV.
          - Expensive. Often, the people who need a test the most can't afford it.
          - Need highly trained individuals to administer it.
          <h3> Solution </h3>
          We designed a test using affinities between CD4 (human membrane protein), CCR5 (human membrane protein), and GP120 (HIV glycoprotein) to isolate a reporter molecule in the presence of the virus. We designed a chimeric protein composed of CD4 and LacZ, enabling us to transduce a signal. CCR5 is used as the stationary element on the column, and only binds CD4 in the presence of GP120. If the test is successful, mass production using laboratory strains of E. coli will allow an inexpensive test that is easy to produce. As well, this test will be simple to administer, requiring the user to apply a drop of blood to the device. Testing of the construct is currently pending.
          <h3> Future Modifications </h3>
          In order to enable this test to be more thermally stable, the two proteins used on the column could be circularized. Circular proteins are a relatively new concept, and are just now starting to become more researched. If function could be maintained, a circular protein is thought to be more stable than a non circular protein. 
          <h2> Recombinant snake anti-venin </h2>
          During my second year with SynBRG, the team designed a novel way of counteracting snake venom.
          <h3> Motivation </h3>
          - Many anti-venins are expensive to produce, and quite a few of them have gone out of production due to lack of profit for the companies producing them.
          - The reason anti-venins are expensive is because of the way they are produced. Snake venom is injected into large animals like horses or sheep, and their blood is extraced to purify the antibodies out of their blood.
          - Anti-venin isn't thermally stable, giving it a low shelf life.
          - Polyvalent anti-venins are produced, but some snakes have a unique cocktail of toxins, requiring a hospital with multiple snake species to carry anti-venins for each snake they need to treat for.
          <h3> Solution </h3>
          The team found genes that the snake uses to counteract the venom it produces. These genes allow the snake to produce copious quantities of venom without being killed itself. Using recombinantly produced venom, we are testing the efficacy of these proteins to determine the concentrations needed to counteract the venom. After getting the results of the enzyme activity assay, we are looking to move forward to in vitro toxicity assays to determine if the enzyme is non-toxic to mammals.
        </p>
      </Box>
      <BottomNav/>
    </Container>
    </CssBaseline>
    </ThemeProvider>
  );
}

export default Biology;
