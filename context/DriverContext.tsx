'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type Driver = {
  id: string
  full_name: string
  email: string
  phone: string
  vehicle_model: string
  number_plate: string
  routes: string[]
  is_taken: boolean
  created_at: string
}

type DriverContextValue = {
  session: Session | null
  driver: Driver | null
  driverError: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const DriverContext = createContext<DriverContextValue | undefined>(undefined)

export function DriverProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [driverError, setDriverError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.email) {
        fetchDriver(session.user.email)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        fetchDriver(session.user.email)
      } else {
        setDriver(null)
        setDriverError(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchDriver = async (email: string) => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      setDriver(null)
      setDriverError("Your account is not registered as a driver. Contact your dispatcher.")
    } else {
      setDriver(data)
      setDriverError(null)
    }
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setDriver(null)
    setDriverError(null)
  }

  return (
    <DriverContext.Provider value={{ session, driver, driverError, loading, signOut }}>
      {children}
    </DriverContext.Provider>
  )
}

export function useDriver() {
  const context = useContext(DriverContext)
  if (context === undefined) {
    throw new Error('useDriver must be used within a DriverProvider')
  }
  return context
}
