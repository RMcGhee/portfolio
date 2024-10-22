import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { Box } from '@mui/system';
import { useImmer } from 'use-immer';

import '../App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { LeftGrow } from '../common/Basic';
import { FormData, defaultFormData } from '../entities/FormData';
import { isEmpty } from '../common/Util';
import { Outlet } from 'react-router-dom';

export interface ContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

function JouleHome() {
  const [formData, setFormData] = useImmer({...defaultFormData} as FormData);

  useEffect(() => {
    // Load cached data from localStorage
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      let loadedData = {...defaultFormData, ...JSON.parse(savedData)};
      setFormData((draftFormData) => {
        Object.assign(draftFormData, loadedData);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save form data 3 seconds after it's updated.
  useEffect(() => {
    if (!isEmpty(formData)) {
      const timer = setTimeout(() => {
        localStorage.setItem('formData', JSON.stringify(formData));
      }, 3000);
  
      // Return clearTimeout as the cleanup so that it clears if unmounted or called again.
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);
 
  return (
    <div>
      <LeftGrow><Box sx={{ flexGrow: 0}} style={{ marginTop: 15 }}>
        <h1>joule-home</h1>
      </Box></LeftGrow>
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        maxWidth: '500px',
      }}>
        <Outlet context={{ formData, setFormData }} / >
      </Box>
    </div>
  );
}

export default JouleHome;
