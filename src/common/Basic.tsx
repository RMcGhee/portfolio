import { Grow, TextField, TextFieldProps, Tooltip } from '@mui/material';
import React, { useState, ReactElement } from 'react';

const prod_env = false;
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const btuInkWh = 3412;
export const btuInCcf = 103900;
export const copInSeer = 0.293;
export const supabaseBaseUrl = prod_env ? 'https://uqjgvhebgvzrbbfjcxsg.supabase.co/functions/v1/' : 'http://127.0.0.1:54321/functions/v1/';

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
