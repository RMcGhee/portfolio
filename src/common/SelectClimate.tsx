import { TextField, TextFieldProps, MenuItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ZipDist } from '../entities/ZipDist';
import { isEmpty } from './Util';

type SelectClimateProps = TextFieldProps & {
  zipData: ZipDist;
  selectedClimate: string;
  setSelectedClimate: (data: string) => void;
};

type ClimateMenuItem = {
  itemKey: string | number;
  value: string | number;
};

const generateMenuItems = (zipData: ZipDist): ClimateMenuItem[] => {
  if (!isEmpty(zipData)) {
    return Array.from({ length: 5 }, (_, i) => {
      const cityKey = `near_city_${i + 1}` as keyof ZipDist;
      const zipKey = `near_zip_${i + 1}` as keyof ZipDist;
      return {itemKey: zipData[cityKey], value: zipData[zipKey]};
    });
  } else {
    return [{itemKey: 'placeholder', value: ''}];
  }
};

export const SelectClimate: React.FC<SelectClimateProps> = ({
  zipData,
  selectedClimate,
  setSelectedClimate,
  ...textFieldProps
}) => {
  const [menuItems, setMenuItems] = useState<ClimateMenuItem[]>(generateMenuItems(zipData));

  useEffect(() => {
    let menuItems = generateMenuItems(zipData);
    setMenuItems(menuItems);
    if (selectedClimate !== '' && menuItems.length > 1) {
      setSelectedClimate(selectedClimate);
    } else {
      setSelectedClimate(menuItems[0].value as string);
    }
    // intentionally not dependencies; setSelectedClimate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipData]);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedClimate(event.target.value as string);
  };

  const fieldStyle = {
    ...textFieldProps.style,
    transition: `${textFieldProps.style?.transition ? textFieldProps.style?.transition + ', ' : ''}background-color 1.0s ease`,
    backgroundColor: textFieldProps.disabled ? '#202020' : 'transparent',
  };

  return (
    <TextField
      {...textFieldProps}
      value={selectedClimate}
      select
      label='Closest Climate'
      onChange={handleChange}
      style={{
        ...fieldStyle
      }}
    >
      {menuItems.map(item => (
        <MenuItem key={item.itemKey} value={item.value}>{item.value} : {item.itemKey}</MenuItem>
      ))}
    </TextField>
  );
};
  