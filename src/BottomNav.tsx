import React from 'react';
import { Divider, Stack, Typography, Tooltip } from '@mui/material';
import { LeftGrow } from './common/Basic';
import { Link } from 'react-router-dom';

import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const BottomNav: React.FC = () => {
  const tooltipContent = (
    <React.Fragment>
      <Typography color="inherit">Want to connect?</Typography>
      <Link to="https://www.linkedin.com/in/rich-mcghee-18a41757" target="_blank" rel="noopener noreferrer">
        LinkedIn
      </Link><br/>
      <Link to='.' target="_self" rel="noopener noreferrer">
        Home
      </Link>
    </React.Fragment>
  );
  
  return (
    <LeftGrow>
      <Stack
        direction={'row'}
        spacing={3}
        alignItems={'flex-end'}
        justifyContent={'flex-start'}
      >
        <Tooltip title={tooltipContent} enterDelay={0}>
          <h2>r.mcghee</h2>
        </Tooltip>
        <Divider orientation='vertical'/>
        <Link to="/joule-home">joule-home</Link>
        <Link to="/photography">photography</Link>
        <Link to="/biology">biology</Link>
      </Stack>
    </LeftGrow>
  );
}

export default BottomNav;