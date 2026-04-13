import React from 'react';
import { Divider, Stack, Typography, Tooltip } from '@mui/material';
import { LeftGrow } from './common/Basic';
import { Link } from '@tanstack/react-router';

const BottomNav: React.FC = () => {
  const tooltipContent = (
    <React.Fragment>
      <Typography color="inherit">Want to connect?</Typography>
      <a href="https://www.linkedin.com/in/rich-mcghee-18a41757" target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a><br/>
      <Link to='/' target="_self" rel="noopener noreferrer">
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
        marginBottom='0.3em'
      >
        <Tooltip title={tooltipContent} enterDelay={0}>
        <h2><Link to="/" className='unstyled-link'>r.mcghee</Link></h2>
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
