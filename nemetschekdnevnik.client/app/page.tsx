import { AppProvider } from '@/components/app-provider'
import { Router } from '@/components/router'

export default function Page() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
