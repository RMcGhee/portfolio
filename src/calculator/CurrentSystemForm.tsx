import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, InputAdornment } from '@mui/material';
import { LeftGrow, ValidatedField } from '../common/Basic';
import { ZipField } from '../common/ZipField';
import { SelectClimate } from '../common/SelectClimate';
import { QuestionMark } from '@mui/icons-material';
import { HelpPopover } from '../common/HelpPopover';
import { Link, useOutletContext } from 'react-router-dom';
import { ContextType } from '../pages/joule-home';

const CurrentSystemForm: React.FC = () => {
  const { formData, setFormData } = useOutletContext<ContextType>();

  const [showHelpPopover, setShowHelpPopover] = useState(false);
  const haveZipDistData = Object.keys(formData.zipDistData).length !== 0;


  useEffect(() => {
    setFormData((draftFormData) => {
      Object.assign(draftFormData, formData);
      return draftFormData;
    });
    // intentionally not dependencies; formData and setFormData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const helpText = (
    <div>
      <h3>Current Heat Pump Seer/HSPF</h3>
      <p>You should be able to find this and HSPF by searching for the model of your heat pump, but it's usually between 13 and 20 SEER, and 8 and 10 HSPF.
        These values represent how efficient a heat pump is in cooling and heating mode, and higher numbers are better.
      </p>
      <hr/>
      <h3>Current AC Seer</h3>
      <p>See above, but AC only run in cooling mode, so they only have a SEER.</p>
      <hr/>
      <h3>Current Furnace Efficiency</h3>
      <p>Use this if you have any kind of burning heating device. Find by searching the model of your furnace, this value is usually between 80% and 95%, although older furnaces or boilers can be lower. Higher is better.</p>
      <hr/>
      <h3>Zip code/Closest Climate</h3>
      <p>Type in any zip code near you. After entering your zip code, select the closest locale to you in the Closest Climate box. If you want to use example data, use 64124</p>
    </div>
  );

  return (
    <LeftGrow>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 2 }}>
        <ValidatedField 
          label="Desired Heat Pump SEER" 
          value={formData.desiredHeatPumpSeer}
          inputType='decimal'
          inputProps={{ inputMode: 'decimal' }}
          setter={(e) => setFormData({...formData, desiredHeatPumpSeer: e.target.value})} 
          formOrder={0}
        />
        <ValidatedField 
          label="Desired Heat Pump HSPF"
          value={formData.desiredHeatPumpHspf}
          inputType='decimal'
          inputProps={{ inputMode: 'decimal' }}
          setter={(e) => setFormData({...formData, desiredHeatPumpHspf: e.target.value})} 
          formOrder={1}
        />
        <ValidatedField 
          label="Current AC SEER" 
          value={formData.currentACSeer}
          inputType='decimal'
          inputProps={{ inputMode: 'decimal' }}
          setter={(e) => setFormData({...formData, currentACSeer: e.target.value})} 
          formOrder={2}
        />
        <ValidatedField 
          label="Current Furnace Efficiency" 
          value={formData.currentFurnaceEfficiency} 
          inputType='decimal'
          inputProps={{ inputMode: 'decimal' }}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          setter={(e) => setFormData({...formData, currentFurnaceEfficiency: e.target.value})} 
          formOrder={3}
        />
        <div style={{ display: 'flex' }}>
          <ZipField
            label="Zip Code"
            value={formData.zipCode}
            len={5}
            inputType='int'
            inputProps={{ inputMode: 'numeric' }}
            style={{
              width: haveZipDistData ? '50%' : '100%',
              marginRight: '0',
              transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out',
            }}
            InputProps={{
              style: {
                borderTopRightRadius: haveZipDistData ? '0' : '4px',
                borderBottomRightRadius: haveZipDistData ? '0' : '4px',
              }
            }}
            setter={(e) => setFormData({...formData, zipCode: e.target.value})} 
            onZipDataReceived={(d, zipCode) => setFormData({...formData, zipDistData: d, zipCode: zipCode})}
            formOrder={4}
          />
        <SelectClimate
          label="Closest Climate"
          hidden={!haveZipDistData}
          style={{
            width: haveZipDistData ? '50%' : '0%',
            marginLeft: '0',
            opacity: haveZipDistData ? 1 : 0,
            transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out',
          }}
          InputProps={{
            style: {
              borderTopLeftRadius: '0',
              borderBottomLeftRadius: '0',
            }
          }}
          zipData={formData.zipDistData}
          selectedClimate={formData.selectedClimate}
          setSelectedClimate={(e) => setFormData({...formData, selectedClimate: e})}
        />
        </div>
        <IconButton
          color='primary'
          sx={{ alignSelf: 'flex-end', marginLeft: 'auto', marginRight: '5%'}}
          onClick={() => setShowHelpPopover(!showHelpPopover)}
        ><QuestionMark/></IconButton>
        <HelpPopover helpText={helpText} isOpen={showHelpPopover} onClose={() => setShowHelpPopover(false)}></HelpPopover>
        <Box sx={{
          position: 'relative',
          padding: 2,
          marginBottom: '30px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
          <Button
            component={Link}
            to='/joule-home'
            style={{
              transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out',
              left: 0,
          }}>
            Previous
          </Button>
          <Button
            component={Link}
            to='/joule-home/energy-usage'
            disabled={!haveZipDistData}
            style={{
              transition: 'width 0.5s ease-in-out, opacity 0.5s ease-in-out',
              left: 0,
          }}>
            Next
          </Button>
        </Box>
      </Box>
    </LeftGrow>
  );
};

export default CurrentSystemForm;
