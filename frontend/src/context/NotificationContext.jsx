import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [alertCount, setAlertCount] = useState(0)

  const setAlerts = useCallback((count) => setAlertCount(count), [])

  return (
    <NotificationContext.Provider value={{ alertCount, setAlerts }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
