import 'vue-router'
import type { Role } from './data/nav'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    subtitle?: string
    roles?: Role[]
    public?: boolean
  }
}
