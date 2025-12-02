import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import createRoutes from './routes'
import { useAuthStore } from './store/authStore'

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const router = createRoutes()

  // Initialize auth state from localStorage on app mount
  useEffect(() => {
    initialize()
  }, [initialize])

  return <RouterProvider router={router} />
}

export default App
