import { Outlet, createRootRoute } from '@tanstack/react-router'
import CssBaseline from '@mui/material/CssBaseline';
import '../index.css'
import { Box, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BottomNav from '../BottomNav';
import theme from '../base-theme';


const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Box sx={{ display: 'flex', flexGrow: 1, padding: '1em' }}>
              <Outlet />
            </Box>
            <Box marginBottom='0px'> {/* Prevents marginBottom on BottomNav from being rendered off page */}
              <BottomNav/>
            </Box>
          </Box>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
