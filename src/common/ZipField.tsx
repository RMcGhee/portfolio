import { CircularProgress, InputAdornment } from '@mui/material';
import React, { useEffect } from 'react';
import type { ZipDist } from '../entities/ZipDist';
import { ValidatedField, type ValidatedFieldProps } from './Basic';
import { getZipDist } from '../apis/worker-apis';
import { useQuery } from '@tanstack/react-query';

type ZipFieldProps = ValidatedFieldProps & {
  onZipDataReceived: (data: ZipDist, zipCode: string) => void; // Callback to update state in parent
  zipCode: string;
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

const dummyData = {
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
  
export const ZipField: React.FC<ZipFieldProps> = ({
  onZipDataReceived,
  zipCode,
  ...validatedFieldProps
}) => {
  const bypassCorsToken = import.meta.env.VITE_BYPASS_CORS_TOKEN;

  const { data, isSuccess, isFetching } = useQuery({
    queryKey: [`get-zip-dist--${zipCode}`],
    queryFn: () => getZipDist(zipCode, bypassCorsToken), staleTime: 300 * 1000,
    enabled: (zipCode.length === 5),
  });
  
  useEffect(() => {
    let zips = null;
    
    if (isSuccess) {
      if (data) {
        zips = coerceZips(data);
      } else if (zips === undefined) {
        zips = dummyData;
      } else {
        zips = {} as ZipDist;
      }
      onZipDataReceived(zips, zipCode);
    } else {
      onZipDataReceived({} as ZipDist, zipCode);
    }
  }, [ data ]);
  
  return (
    <ValidatedField
        {...validatedFieldProps}
        setter={validatedFieldProps.setter}
        InputProps={{ 
          endAdornment: isFetching ? <InputAdornment position='end'><CircularProgress/></InputAdornment> : null 
        }}
    />
  );
};
  