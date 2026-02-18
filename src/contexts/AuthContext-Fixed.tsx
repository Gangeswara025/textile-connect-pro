// Fix Auth Persistence Issue

// Step 1: Update AuthContext to properly handle auth state changes
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, getCurrentUser, onAuthStateChange, signOut } from '@/lib/auth'

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
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: session.user.email === 'admin@textile-connect.com' ? 'admin' : 'buyer',
            full_name: session.user.user_metadata?.full_name,
            company_name: session.user.user_metadata?.company_name,
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
      
      // Only update user state if the session actually changed
      if (authUser?.id !== user?.id) {
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email!,
            role: authUser.email === 'admin@textile-connect.com' ? 'admin' : 'buyer',
            full_name: authUser.user_metadata?.full_name,
            company_name: authUser.user_metadata?.company_name,
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
