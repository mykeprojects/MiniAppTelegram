import { useContext, type PropsWithChildren } from 'react'
import type { UserRole } from '../../domain/models/actor'
import { AuthenticatedActorContext } from '../context/AuthenticatedActorContext'

interface RoleGuardProps extends PropsWithChildren {
  roles: UserRole[]
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const actor = useContext(AuthenticatedActorContext)
  if (!actor || !roles.includes(actor.rol)) {
    return (
      <main>
        <p role="alert">No tienes permisos para acceder a esta sección.</p>
      </main>
    )
  }
  return children
}
