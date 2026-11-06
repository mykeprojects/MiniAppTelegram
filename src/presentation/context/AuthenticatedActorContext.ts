import { createContext } from 'react'
import type { AuthenticatedActor } from '../../domain/models/actor'

export const AuthenticatedActorContext = createContext<AuthenticatedActor | null>(
  null,
)
