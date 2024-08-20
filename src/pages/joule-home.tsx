import { useEffect, useState } from 'react';
import { Button, Container } from '@mui/material';
import { Box } from '@mui/system';
import { useImmer } from 'use-immer';

import '../App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { LeftGrow } from '../common/Basic';
import CurrentSystemForm from '../calculator/CurrentSystemForm';
import Introduction from '../calculator/Introduction';
import { FormData, defaultFormData } from '../entities/FormData';
import { isEmpty } from '../common/Util';
import EnergyUsageForm from '../calculator/EnergyUsageForm';
import EnergyUsageAnalysis from '../calculator/EnergyUsageAnalysis';
import { validateCurrentSystemData } from '../entities/CurrentSystemData';
import { validateEnergyFormData } from '../entities/EnergyFormData';

function JouleHome() {
  const [currentStep, setCurrentStep] = useState(0);
  const [nextDisabled, setNextDisabled] = useState(false);
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
  }, []);

  // Save form data 3 seconds after it's updated.
  useEffect(() => {
    if (!isEmpty(formData)) {
      const timer = setTimeout(() => {
        localStorage.setItem('formData', JSON.stringify(formData));
      }, 3000);
      switch(currentStep) {
        case 1:
          setNextDisabled(!validateCurrentSystemData(formData));
          break;
        case 2:
          setNextDisabled(!validateEnergyFormData(formData));
          break;
        case 3:
          // validate energy analysis form
      }
  
      // Return clearTimeout as the cleanup so that it clears if unmounted or called again.
      return () => clearTimeout(timer);
    }
  }, [formData]);

  const handleNextStep = (stepChange = 1) => {
    localStorage.setItem('formData', JSON.stringify(formData));
    if (currentStep === 3) {
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep + stepChange);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CurrentSystemForm formData={formData} setFormData={setFormData} />;
      case 2:
        return <EnergyUsageForm formData={formData} setFormData={setFormData} />;
      case 3:
        return <EnergyUsageAnalysis formData={formData} setFormData={setFormData} />;
      default:
        return <Introduction />;
    }
  };
  
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
        {renderStep()}

        <Box sx={{ position: 'relative', padding: 2, marginBottom: '30px' }}>
          <Button
            onClick={() => handleNextStep(-1)}
            style={{
              width: currentStep !== 0 ? '50%' : '0%',
              opacity: currentStep !== 0 ? 1 : 0,
              transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out',
              position: 'absolute',
              left: 0,
            }}
          >
            Previous
          </Button>
          <Button
            onClick={() => handleNextStep()}
            disabled={nextDisabled}
            style={{
              width: currentStep !== 0 ? '50%' : '100%',
              transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out',
              flexGrow: currentStep === 0 ? 1 : 0,
              position: 'absolute',
              right: 0,
            }}
          >
            {currentStep === 3 ? 'Home' : 'Next'}
          </Button>
        </Box>
      </Box>
    </div>
  );
}

export default JouleHome;
