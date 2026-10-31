export type Role = 'admin' | 'reception' | 'housekeeping'

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin de hotel',
  reception: 'Recepción',
  housekeeping: 'Housekeeping',
}

export interface NavItem {
  name: string
  path: string
  label: string
  icon: string
  roles: Role[]
}

const ALL: Role[] = ['admin', 'reception', 'housekeeping']

export const NAV: NavItem[] = [
  { name: 'inicio', path: '/', label: 'Inicio', icon: 'home', roles: ALL },
  { name: 'recepcion', path: '/recepcion', label: 'Recepción', icon: 'login', roles: ['admin', 'reception'] },
  { name: 'habitaciones', path: '/habitaciones', label: 'Habitaciones', icon: 'bed', roles: ALL },
  { name: 'reservas', path: '/reservas', label: 'Reservas', icon: 'calendar', roles: ['admin', 'reception'] },
  { name: 'huespedes', path: '/huespedes', label: 'Huéspedes', icon: 'users', roles: ['admin', 'reception'] },
  { name: 'caja', path: '/caja', label: 'Caja', icon: 'wallet', roles: ['admin', 'reception'] },
  { name: 'housekeeping', path: '/housekeeping', label: 'Housekeeping', icon: 'sparkles', roles: ['admin', 'housekeeping'] },
  { name: 'incidentes', path: '/incidentes', label: 'Incidentes', icon: 'alert', roles: ALL },
  { name: 'reportes', path: '/reportes', label: 'Reportes', icon: 'chart', roles: ['admin'] },
  { name: 'configuracion', path: '/configuracion', label: 'Configuración', icon: 'sliders', roles: ALL },
]
