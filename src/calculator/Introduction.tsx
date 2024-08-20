import React from 'react';
import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import { LeftGrow } from '../common/Basic';

const Introduction: React.FC = () => {
  return (
    <LeftGrow>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 2 }}>
      <Typography variant='h5'>
        This is a work in progress, but is mostly functional.
      </Typography>
      <Typography variant='body1' gutterBottom>
        joule-home is a free calculator to help you figure out what your home heating and cooling costs would be if you replaced
        your gas furnace/AC combo with a heat pump.
      </Typography>
      <Typography variant='body1' gutterBottom>
        With just a few pieces of information about your home, your current system, how much energy you currently use,
        and location, we should be able to get a decent picture of your overall conditioning needs, and how that would
        be affected by an upgrade.
      </Typography>
      <Typography variant='body1' gutterBottom>
        For most people and situations, replacing a working, moderately efficient gas furnace/AC combo before its end of life won't
        be a big savings, but if you're looking at replacing them anyways, it may be much more efficient to switch to a heat pump.
        If you live in an area that regularly gets below 15°F, you may still want a gas furnace or resistive heat for backup heating since
        heat pumps are less efficient at colder temperatures, and a properly sized heat pump for cooling may be undersized for
        heating. Even so, this calculator can help you understand what your costs will be in most months, as modern heat pumps are
        still quite efficient down to negative temperatures.
      </Typography>
      <Typography variant='body1' gutterBottom>
        This calculator does not guarantee accuracy or provide financial advice, it is only a tool to estimate costs. If you live
        in an area where natural gas is <span style={{ fontWeight: 'bold' }}>much</span> cheaper than electricity, a natural gas furnace may be more cost effective for
        heating. I live in an area where the cost of natural gas four years ago made a heat pump a wash. However, those costs rose
        significantly in the past two years, and our heat pump is now quite a bit cheaper than running our furnace.
      </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} textAlign='center' justifyContent={'center'}>
                <Paper>
                    <Typography variant="h6">Required</Typography>
                    <Divider />
                    {["Nearest Zipcode", "Current Furnace efficiency (%)", 
                      "Current AC efficiency (SEER)", 
                      "Gas/electric price per unit",
                      "Gas/electric usage/month (there's example data available)"].map(item => (
                        <Typography key={item} sx={{ marginBottom: 1.3, padding: 1 }}>
                            {item}
                        </Typography>
                     ))}
                </Paper>
            </Grid>
        </Grid>
        Don't worry, we won't hide your results at the end by asking for your email or phone number.
        <br/>We don't wan't those.
        <br/>Why? I like heat pumps and wanted to play around with React. Stack is React, github static hosting, and Supabase for serverless functions/db.
      </Box>
    </LeftGrow>
  );
};

export default Introduction;
