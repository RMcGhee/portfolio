import { CircularProgress, InputAdornment } from '@mui/material';
import React, { useState } from 'react';
import type { ZipDist } from '../entities/ZipDist';
import { ValidatedField, type ValidatedFieldProps } from './Basic';
import { validateZip } from './Util';
import { getZipDist } from '../apis/worker-apis';

type ZipFieldProps = ValidatedFieldProps & {
  onZipDataReceived: (data: ZipDist, zipCode: string) => void; // Callback to update state in parent
};

function coerceZips(zipDist: ZipDist) {
  let res = {
    ...zipDist,
    zip: zipDist['zip'].toString().padStart(5, '0'),
    near_zip_1: zipDist['near_zip_1'].toString().padStart(5, '0'),
    near_zip_2: zipDist['near_zip_2'].toString().padStart(5, '0'),
    near_zip_3: zipDist['near_zip_3'].toString().padStart(5, '0'),
    near_zip_4: zipDist['near_zip_4'].toString().padStart(5, '0'),
    near_zip_5: zipDist['near_zip_5'].toString().padStart(5, '0'),
  }
  return res;
}
  
export const ZipField: React.FC<ZipFieldProps> = ({
  onZipDataReceived,
  ...validatedFieldProps
}) => {
  const [zipDataLoading, setZipDataLoading] = useState(false);
  
  const fetchZipData = async (zipCode: string) => {
    // Need to validate here too, since the setter is always called after validation, even
    // if validation fails.
    if (validateZip(zipCode)) {
      let zips = null;
      setZipDataLoading(true);
      try {
        const response = await fetch(getZipDist, {
          method: 'POST',
          body: JSON.stringify({ 'zip': zipCode }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const responseData = await response.json();
        zips = responseData[0] as ZipDist;
      } catch (e) {
        console.log('Using dummy data, response was not ok.');
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
        };
      }
      setZipDataLoading(false);
      
      if (zips !== undefined) {
        zips = coerceZips(zips)
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
  