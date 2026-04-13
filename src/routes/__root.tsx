import { Outlet, createRootRoute } from '@tanstack/react-router'
import '@radix-ui/themes/styles.css'
import '../index.css'
import { Theme, Flex, Box } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BottomNav from '../BottomNav'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <Theme appearance="dark" accentColor="purple" grayColor="slate" panelBackground="solid">
      <QueryClientProvider client={queryClient}>
        <Flex direction="column" style={{ minHeight: '100vh' }}>
          <Box flexGrow="1" p="4">
            <Outlet />
          </Box>
          <Box>
            <BottomNav />
          </Box>
        </Flex>
      </QueryClientProvider>
    </Theme>
  )
}