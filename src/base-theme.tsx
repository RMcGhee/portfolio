import { ThemeOptions, createTheme } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#aa00ff',
        },
        secondary: {
            main: '#e91e63',
        },
        background: {
            default: '#000000', // Set the default background color to black
            paper: '#222222',
        },
    },
};

let theme = createTheme(themeOptions);

theme = createTheme(theme, {
    components: {
        MuiTooltip: {
            styleOverrides: {
                arrow: {
                    "&:before": {
                      border: `1px solid ${theme.palette.secondary.main}`
                    },
                    color: `${theme.palette.background.default}BF`,
                },
                tooltip: {
                    backgroundColor: `${theme.palette.background.default}BF`,
                    fontSize: theme.typography.pxToRem(14),
                    border: `1px solid ${theme.palette.secondary.main}`,
                }
            }
        }
    }
});

export default theme;