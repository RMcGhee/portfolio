import React, { useEffect, useState } from 'react';
import { Box, Button, Collapse, IconButton, InputAdornment, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { LeftGrow, ValidatedField, supabaseBaseUrl } from '../common/Basic';
import { FormData } from '../entities/FormData';
import { QuestionMark } from '@mui/icons-material';
import { HelpPopover } from '../common/HelpPopover';
import { EnergyFormData, MonthlyUsage, initEnergyForm, } from '../entities/EnergyFormData';
import { DegreeDayData, initDegreeDayMonths } from '../entities/DegreeDayData';
import { isEmpty, validateZip } from '../common/Util';
import { Updater } from 'use-immer';

type EnergyUsageFormProps = {
  formData: FormData;
  setFormData: Updater<FormData>;
};

const EnergyUsageForm: React.FC<EnergyUsageFormProps> = ({
  formData,
  setFormData,
}) => {

  const [energyFormData, setEnergyFormData] = useState<EnergyFormData>(initEnergyForm(formData));
  
  const [showHelpPopover, setShowHelpPopover] = useState(false);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const kWhData = {jan: '743', feb: '725', mar: '589', apr: '550', may: '714', jun: '1243', jul: '1635', aug: '1384', sep: '972', oct: '529', nov: '620', dec: '723',};
  const gasData = {jan: '171', feb: '156', mar: '143', apr: '65', may: '25', jun: '13', jul: '12', aug: '12', sep: '11', oct: '20', nov: '69', dec: '134'};

  const fillWithExampleData = (): void => {
    setEnergyFormData({...energyFormData, monthlyElectricUsage: {...kWhData}, monthlyGasUsage: {...gasData}});
  };

  const degreeDayDataOutOfDate = (degreeDayData: DegreeDayData): boolean => {
    let res = (isEmpty(degreeDayData) || degreeDayData.cooling.jan === '' || degreeDayData.zip !== formData.selectedClimate);
    return res;
  };

  useEffect(() => {
    if (validateZip(formData.selectedClimate) && degreeDayDataOutOfDate(formData.degreeDayData)) {
      const getDegreeDayData = async () => {
        const edgeFunction = supabaseBaseUrl + 'get-dd'
        const response = await fetch(edgeFunction, {
          method: 'POST',
          body: JSON.stringify({ 'zip': formData.selectedClimate }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const responseData = await response.json();
        const data = responseData.data[0] as DegreeDayData;
        data.cooling = initDegreeDayMonths(data.cooling);
        data.heating = initDegreeDayMonths(data.heating);
        data.year_2021.cooling = initDegreeDayMonths(data.year_2021.cooling);
        data.year_2021.heating = initDegreeDayMonths(data.year_2021.heating);
        data.year_2022.cooling = initDegreeDayMonths(data.year_2022.cooling);
        data.year_2022.heating = initDegreeDayMonths(data.year_2022.heating);
        data.year_2023.cooling = initDegreeDayMonths(data.year_2023.cooling);
        data.year_2023.heating = initDegreeDayMonths(data.year_2023.heating);

        setFormData((formDataDraft) => {
          formDataDraft.degreeDayData = data;
        });
      };
      getDegreeDayData();
    }
  }, []);

  useEffect(() => {
    setFormData((formDataDraft) => {
      Object.assign(formDataDraft, {
        monthlyElectricUsage: {...energyFormData.monthlyElectricUsage},
        monthlyGasUsage: {...energyFormData.monthlyGasUsage},
        dataYear: energyFormData.dataYear,
        electricPrice: energyFormData.electricPrice,
        gasPrice: energyFormData.gasPrice,
        gasUnits: energyFormData.gasUnits,
      } as FormData);
    });
  }, [energyFormData]);

  const helpText = (
    <div>
      <h3>Monthly electric or gas usage</h3>
      <p>You should be able to get the monthly usage from your electric and gas provider, and these should be in units of kWh (electric),
        and Ccf or therms/kBTU (gas). If you use a different energy source (propane, oil, kerosene, etc), then use your units for this.
        As long as you use the same units consistently, most calculations will be accurate.
      </p>
      <hr/>
      <h3>Electric/gas price</h3>
      <p>The average price that your utility charges per unit of energy delivered ($/kWh for electricity, $/Ccf/therms for gas).
        If your utility charges rates on a time of use basis, simply use the average price, not including delivery fees (divide (total bill - delivery fees) by total usage).
      </p>
      <hr/>
      <h3>Gas units; Ccf or kBTU</h3>
      <p>The units that your gas utility measures delivery in. Ccf and kBTU are fairly close (1.038 therms/Ccf), so if you don't know,
        it's fine to leave this as the default. therms and kBTU are the same. If you use a different fuel, just leave this as therms.
        Some efficiency results won't be relevant in this case, but the cost calculations will be accurate.
      </p>
    </div>
  );

  const rowSx = { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' } as React.CSSProperties;

  const monthlyForm = (
    <Box sx={{justifyContent: 'space-between', flexDirection: 'column', gap: 2, marginTop: '5px', }}>
      {months.map((month, i) => {
        return (
          <div style={rowSx} key={`${month}-row`}>
            <ValidatedField 
              label={`${month} Electric Usage`}
              value={energyFormData.monthlyElectricUsage[month.toLowerCase() as keyof MonthlyUsage]}
              inputType='decimal'
              inputProps={{ inputMode: 'decimal' }}
              InputProps={{ endAdornment: <InputAdornment position="end">kWh</InputAdornment> }}
              InputLabelProps={{ shrink: true }}
              formOrder={i}
              setter={(e) => setEnergyFormData({...energyFormData, monthlyElectricUsage: {...energyFormData.monthlyElectricUsage, [month.toLowerCase()]: e.target.value}})}
            />
            <ValidatedField 
              label={`${month} Gas Usage`}
              value={energyFormData.monthlyGasUsage[month.toLowerCase() as keyof MonthlyUsage]}
              inputType='decimal'
              inputProps={{ inputMode: 'decimal' }}
              InputProps={{ endAdornment: <InputAdornment position="end">{energyFormData.gasUnits}</InputAdornment> }}
              InputLabelProps={{ shrink: true }}
              formOrder={i + 12}
              setter={(e) => setEnergyFormData({...energyFormData, monthlyGasUsage: {...energyFormData.monthlyGasUsage, [month.toLowerCase()]: e.target.value}})}
            />
          </div>
        );
      })}
    </Box>
  );

  return (
    <LeftGrow>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 2, transition: 'all 1s' }} >
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2 }} >
          Year for data
          <ToggleButtonGroup
            color="primary"
            value={energyFormData.dataYear}
            exclusive
            onChange={(e, newYear : 2021 | 2022 | 2023) => {
              if (newYear !== null) {
                setEnergyFormData({...energyFormData, dataYear: newYear})
              }
            }
          }
            aria-label="Year for data"
          >
            <ToggleButton value={2023}>2023</ToggleButton>
            <ToggleButton value={2022}>2022</ToggleButton>
            <ToggleButton value={2021}>2021</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Tooltip title="Data comes from an 1800 sqft home in the midwest, 2023, use Zip 64124.">
          <Button onClick={fillWithExampleData}>Use Example Data</Button>
        </Tooltip>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, }}>
          <Collapse in={true} timeout={400}>{monthlyForm}</Collapse>
        </Box>
        <div style={rowSx}>
          <ValidatedField 
            label="Electric Price/kWh" 
            value={energyFormData.electricPrice}
            inputType='decimal'
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            formOrder={24}
            setter={(e) => setEnergyFormData({...energyFormData, electricPrice: e.target.value})}
          />
          <ValidatedField 
            label={`Gas Price/${energyFormData.gasUnits}`}
            value={energyFormData.gasPrice}
            inputType='decimal'
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            formOrder={25}
            setter={(e) => setEnergyFormData({...energyFormData, gasPrice: e.target.value})}
          />
        </div>
        <ToggleButtonGroup
          color="primary"
          value={energyFormData.gasUnits}
          exclusive
          onChange={(e, newUnits) => setEnergyFormData({...energyFormData, gasUnits: newUnits})}
          aria-label="Gas Units"
        >
          <ToggleButton value="ccf">Ccf</ToggleButton>
          <ToggleButton value="therm">therms/kBTU</ToggleButton>
        </ToggleButtonGroup>
        <IconButton
          color='primary'
          sx={{ alignSelf: 'flex-end', marginLeft: 'auto', marginRight: '5%'}}
          onClick={() => setShowHelpPopover(!showHelpPopover)}
        ><QuestionMark/></IconButton>
        <HelpPopover helpText={helpText} isOpen={showHelpPopover} onClose={() => setShowHelpPopover(false)}></HelpPopover>
      </Box>
    </LeftGrow>
  );
};

export default EnergyUsageForm;
