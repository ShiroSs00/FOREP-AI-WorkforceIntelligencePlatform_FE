import { useCallback, useMemo, useState } from 'react'
import { roles } from '../constants/roles.js'
import { RoleContext } from './role.js'
const storageKey = 'forep_selected_role'

function readDeepValues(value, keys, result = []) {
  if (!value || typeof value !== 'object') return result
  for (const [key, child] of Object.entries(value)) {
    if (keys.includes(key) && child !== undefined && child !== null && child !== '') result.push(child)
    if (child && typeof child === 'object') readDeepValues(child, keys, result)
  }
  return result
}

function firstDeepValue(account, keys) {
  return readDeepValues(account, keys).find((value) => typeof value !== 'object') ?? null
}

function getInitials(account, fallback) {
  const firstName = account?.firstName ?? ''
  const lastName = account?.lastName ?? ''
  if (firstName || lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const name = account?.name ?? account?.fullName ?? account?.email ?? ''
  const initials = String(name).split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join('')
  return initials.toUpperCase() || fallback
}

function getAccountDisplayUser(account, fallbackUser) {
  if (!account || typeof account !== 'object') return fallbackUser
  const fullName = account.firstName || account.lastName ? `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() : ''
  return {
    name: fullName || account.fullName || account.name || account.email || fallbackUser.name,
    title: account.jobTitle || account.role || account.department || fallbackUser.title,
    initials: getInitials(account, fallbackUser.initials),
  }
}

function collectRoleCandidates(account) {
  return [
    account?.role?.name,
    account?.role?.authority,
    account?.role,
    account?.roleName,
    account?.account?.role?.name,
    account?.account?.role?.authority,
    account?.account?.role,
    account?.employee?.role?.name,
    account?.employee?.role,
    account?.employee?.account?.role?.name,
    account?.employee?.account?.role,
    account?.user?.role?.name,
    account?.user?.role,
    account?.user?.account?.role?.name,
    account?.user?.account?.role,
    account?.authorities?.[0]?.authority,
    account?.authorities?.[0]?.name,
    account?.authorities?.[0],
    account?.roles?.[0]?.name,
    account?.roles?.[0]?.authority,
    account?.roles?.[0],
    ...readDeepValues(account, ['role', 'roleName', 'authority']),
  ].filter(Boolean)
}

function resolveRoleFromAccount(account) {
  const candidates = collectRoleCandidates(account)
  for (const rawRole of candidates) {
    const normalized = String(rawRole)
      .toLowerCase()
      .replace(/^role_/, '')
      .replace(/[^a-z0-9]+/g, '_')
    if (normalized === 'hr' || normalized.includes('human_resource') || normalized.includes('people') || normalized.includes('people_ops')) return 'hr'
    if (normalized.includes('admin')) return 'admin'
    if (normalized.includes('manager')) return 'manager'
    if (normalized.includes('employee') || normalized.includes('staff') || normalized === 'user') return 'employee'
  }
  return null
}

function getAccountContext(account) {
  return {
    employeeId: firstDeepValue(account, ['employeeId', 'currentEmployeeId']) ?? account?.employee?.id ?? account?.id ?? null,
    teamId: firstDeepValue(account, ['teamId']) ?? account?.team?.id ?? null,
    organizationId: firstDeepValue(account, ['organizationId', 'orgId']) ?? account?.organization?.id ?? account?.organization?.organizationId ?? null,
    managerId: firstDeepValue(account, ['managerId', 'userId']) ?? null,
  }
}

export function RoleProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [accountRole, setAccountRole] = useState(null)
  const [selectedRole, setSelectedRoleState] = useState(() => {
    const stored = localStorage.getItem(storageKey)
    return roles[stored] ? stored : 'employee'
  })

  const setSelectedRole = useCallback((nextRole) => {
    if (!roles[nextRole]) return
    localStorage.setItem(storageKey, nextRole)
    setSelectedRoleState(nextRole)
  }, [])

  const syncRoleFromAccount = useCallback((account) => {
    const accountRole = resolveRoleFromAccount(account)
    if (account) setAccount(account)
    setAccountRole(accountRole)
    const resolvedRole = accountRole ?? 'employee'
    setSelectedRole(resolvedRole)
    return resolvedRole
  }, [setSelectedRole])

  const value = useMemo(() => {
    const roleConfig = roles[selectedRole]
    const menuGroups = roleConfig.menuSections
    return {
      selectedRole,
      setSelectedRole,
      accountRole,
      canPreviewRoles: accountRole === 'admin',
      syncRoleFromAccount,
      roleConfig,
      account,
      accountContext: getAccountContext(account),
      currentUser: getAccountDisplayUser(account, roleConfig.user),
      createActions: roleConfig.createActions,
      availableRoutes: roleConfig.allowedRoutes,
      menuGroups,
      menuItems: menuGroups.flatMap((group) => group.items),
      menuSections: roleConfig.menuSections,
    }
  }, [account, accountRole, selectedRole, setSelectedRole, syncRoleFromAccount])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
