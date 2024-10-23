import React, { useState } from 'react';
import { ValidatedField, ValidatedFieldProps } from './Basic';
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
    const edgeFunction = 'https://get-zip-dist.richmcghee.workers.dev/';
    // Need to validate here too, since the setter is always called after validation, even
    // if validation fails.
    if (validateZip(zipCode)) {
      let zips = null;
      setZipDataLoading(true);
      try {
        const response = await fetch(edgeFunction, {
          method: 'POST',
          body: JSON.stringify({ 'zip': zipCode }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // if (!response.ok) throw new Error('Network response was not ok');s
        const responseData = await response.json();
        zips = responseData.data[0];
      } catch (e) {
        zips = {
          "id": "28506",
          "zip": "64131",
          "city": "Kansas City, MO",
          "lat": 38.94,
          "lon": -94.59,
          "near_city_1": "KANSAS CITY, MO",
          "near_id_1": 174,
          "near_zip_1": "64124",
          "near_dist_1": 8,
          "near_city_2": "TOPEKA, KS",
          "near_id_2": 129,
          "near_zip_2": "66604",
          "near_dist_2": 103,
          "near_city_3": "CHANUTE, KS",
          "near_id_3": 122,
          "near_zip_3": "66720",
          "near_dist_3": 176,
          "near_city_4": "COLUMBIA, MO",
          "near_id_4": 172,
          "near_zip_4": "65203",
          "near_dist_4": 183,
          "near_city_5": "JOPLIN, MO",
          "near_id_5": 173,
          "near_zip_5": "64801",
          "near_dist_5": 219
        }
      }
      setZipDataLoading(false);
      
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
  