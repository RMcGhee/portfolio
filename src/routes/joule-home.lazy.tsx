import { useEffect, useState } from 'react'
import { Box, Flex } from '@radix-ui/themes'

import { LeftGrow } from '../common/Basic'
import { type FormData, defaultFormData } from '../entities/FormData'
import { isEmpty } from '../common/Util'
import { createLazyFileRoute, Outlet } from '@tanstack/react-router'
import { JouleHomeContext } from '../entities/joule-home-context'

export const Route = createLazyFileRoute('/joule-home')({
  component: JouleHome,
})

export interface JouleHomeContext {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

function JouleHome() {
  const [ formData, setFormData ] = useState<FormData>({ ...defaultFormData })

  useEffect(() => {
    // Load cached data from localStorage
    const savedData = localStorage.getItem('formData')
    if (savedData) {
      let loadedData = { ...defaultFormData, ...JSON.parse(savedData) }
      setFormData(loadedData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save form data 3 seconds after it's updated.
  useEffect(() => {
    if (!isEmpty(formData)) {
      const timer = setTimeout(() => {
        localStorage.setItem('formData', JSON.stringify(formData))
      }, 3000)

      // Return clearTimeout as the cleanup so that it clears if unmounted or called again.
      return () => clearTimeout(timer)
    }
  }, [formData])

  return (
    <div>
      <LeftGrow>
        <Box style={{ marginTop: 15 }}>
          <h1>joule-home</h1>
        </Box>
      </LeftGrow>
      <Flex direction="column" flexGrow="1" justify="between" style={{ maxWidth: '500px' }}>
        <JouleHomeContext.Provider value={{ formData, setFormData }}>
          <Outlet />
        </JouleHomeContext.Provider>
      </Flex>
    </div>
  )
}
