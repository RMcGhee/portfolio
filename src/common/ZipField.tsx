import React, { useState } from 'react';
import { ValidatedField, ValidatedFieldProps, supabaseBaseUrl } from './Basic';
import { ZipDist } from '../entities/ZipDist';
import { CircularProgress, InputAdornment } from '@mui/material';
import { validateZip } from './Util';

type ZipFieldProps = ValidatedFieldProps & {
  onZipDataReceived: (data: ZipDist, zipCode: string) => void; // Callback to update state in parent
};
  
export const ZipField: React.FC<ZipFieldProps> = ({
  onZipDataReceived,
  ...validatedFieldProps
}) => {
  const [zipDataLoading, setZipDataLoading] = useState(false);
  
  const fetchZipData = async (zipCode: string) => {
    const edgeFunction = supabaseBaseUrl + 'get-zip';
    // Need to validate here too, since the setter is always called after validation, even
    // if validation fails.
    if (validateZip(zipCode)) {
      setZipDataLoading(true);
      const response = await fetch(edgeFunction, {
        method: 'POST',
        body: JSON.stringify({ 'zip': zipCode }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setZipDataLoading(false);
      if (!response.ok) throw new Error('Network response was not ok');
      const responseData = await response.json();
      let zips = responseData.data[0];
      if (zips !== undefined) {
        for (let [key, value] of Object.entries(zips)) {
          if (key.includes('zip') && typeof value === 'number') {
            zips[key] = value.toString().padStart(5, '0');
          }
        }
      }
      const data = zips as ZipDist;
      onZipDataReceived(data === undefined ? {} as ZipDist : data, zipCode);
    }
  };


  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    validatedFieldProps.setter(e);
    const zipCode = e.target.value;
    if (zipCode.length === 5) {
      fetchZipData(zipCode);
    } else {
      onZipDataReceived({} as ZipDist, zipCode);
    }
  };
  
  return (
    <ValidatedField
        {...validatedFieldProps}
        setter={handleZipChange}
        InputProps={{ 
          endAdornment: zipDataLoading ? <InputAdornment position='end'><CircularProgress/></InputAdornment> : null 
        }}
    />
  );
};
  