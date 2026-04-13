import { CircularProgress, InputAdornment } from '@mui/material';
import React, { useEffect } from 'react';
import { dummyData, type ZipDist } from '../entities/ZipDist';
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
  