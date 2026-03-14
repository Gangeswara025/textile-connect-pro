import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, getCurrentUser, onAuthStateChange } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session first
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Only set user if there's an active session
          console.log('AuthContext - Found active session:', session.user.email)
          const supabaseUser = session.user as User
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            role: supabaseUser.email === 'admin@textile-connect.com' ? 'admin' : 'buyer',
            full_name: supabaseUser.user_metadata?.full_name,
            company_name: supabaseUser.user_metadata?.company_name,
          })
        } else {
          // No active session, clear user
          console.log('AuthContext - No active session, clearing user')
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes, but only update if session changes
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      console.log('AuthContext - Auth state changed:', authUser)
      
      // Only update user state if session actually changed
      if (authUser?.id !== user?.id) {
        if (authUser) {
          const supabaseUser = authUser as User
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            role: supabaseUser.email === 'admin@textile-connect.com' ? 'admin' : 'buyer',
            full_name: supabaseUser.user_metadata?.full_name,
            company_name: supabaseUser.user_metadata?.company_name,
          })
        } else {
          setUser(null)
        }
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
