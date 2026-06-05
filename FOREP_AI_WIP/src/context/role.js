import { createContext, useContext } from 'react'

export const RoleContext = createContext(null)

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error('useRole must be used inside RoleProvider')
  return context
}
