import { Grow } from '@mui/material';
import React, { ReactElement } from 'react';

const prod_env = false;

interface LeftGrowProps {
    children: ReactElement;
    timeout?: number;
    trigger?: boolean;
  }
  
  export const LeftGrow: React.FC<LeftGrowProps> = ({ children, timeout = 1500, trigger = true }) => {
  return (
    <Grow in={trigger} style={{ transformOrigin: '-30% 50%' }} timeout={timeout}>
      {children}
    </Grow>
    );
};

interface AnnotatedImageProps {
  children: ReactElement;
  img: string;
  maxHeight?: string;
  trigger: boolean;
  timeout?: number;
}

export const AnnotatedImage: React.FC<AnnotatedImageProps> = ({ children, img, maxHeight='40vh', trigger = true, timeout = 1500 }) => {
return (
  <LeftGrow trigger={trigger}>
      <div>
          <img src={img} style={{ maxWidth: '95vw', maxHeight: maxHeight, objectFit: 'contain' }}></img>
          {children}
          <br/>
      </div>
  </LeftGrow>
  )
};
