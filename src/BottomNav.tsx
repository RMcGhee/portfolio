import React from 'react';
import { Flex, Tooltip, Separator } from '@radix-ui/themes';
import { LeftGrow } from './common/Basic';
import { Link } from '@tanstack/react-router';

const BottomNav: React.FC = () => {
  return (
    <LeftGrow>
      <Flex
        direction="row"
        gap="5"
        align="end"
        justify="start"
        style={{ marginBottom: '0.3em' }}
      >
        <Tooltip content="Want to connect?">
          <h2><Link to="/" className='unstyled-link'>r.mcghee</Link></h2>
        </Tooltip>
        <Separator orientation='vertical' size="2" />
        <Link to="/joule-home">joule-home</Link>
        <Link to="/photography">photography</Link>
        <Link to="/biology">biology</Link>
      </Flex>
    </LeftGrow>
  );
}

export default BottomNav;