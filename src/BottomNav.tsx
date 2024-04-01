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
  return (
    <LeftGrow>
      <Stack
        direction={'row'}
        spacing={3}
        alignItems={'flex-end'}
        justifyContent={'flex-start'}
      >
        <h2>r.mcghee</h2>
        <Divider orientation='vertical'/>
        <Link href="/joule-home">joule-home</Link><br />
        <Link href={user_home_url + "photography.html"}>photography</Link><br />
        <Link href={user_home_url + "synbio.html"}>biology</Link><br />
      </Stack>
    </LeftGrow>
  );
}

export default BottomNav;
