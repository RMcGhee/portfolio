import React from 'react';
import { Link, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { LeftGrow } from './common/Basic';

import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const user_home_url = 'https://rmcghee.github.io/'

const BottomNav: React.FC = () => {
  const tooltipContent = (
    <React.Fragment>
      <Typography color="inherit">Additional Info</Typography>
      <Link href={user_home_url + "extra_info.html"} target="_blank" rel="noopener noreferrer">
        Click here for more info
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
          <h2 style={{ cursor: 'pointer' }}>r.mcghee</h2>
        </Tooltip>
        <Divider orientation='vertical'/>
        <Link href={user_home_url + "synbio.html"}>synthetic biology</Link><br />
        <Link href={user_home_url + "photography.html"}>photography</Link><br />
        <Link href="/">joule-home</Link><br />
      </Stack>
    </LeftGrow>
  );
}

export default BottomNav;
