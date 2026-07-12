import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const ROLE_LABELS = {
  admin: 'Admin',
  fleet_manager: 'Fleet Manager',
  driver: 'Driver',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage
    const storedToken = localStorage.getItem('transitops_token')
    const storedUser = localStorage.getItem('transitops_user')
    const storedRole = localStorage.getItem('transitops_role')
    if (storedToken && storedUser && storedRole) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setRole(storedRole)
        setIsAuthenticated(true)
      } catch {
        clearAuth()
      }
    }
    setLoading(false)
  }, [])

  const login = (userData, userRole, userToken) => {
    const userObj = {
      ...userData,
      roleLabel: ROLE_LABELS[userRole] || userRole,
    }
    setUser(userObj)
    setRole(userRole)
    setToken(userToken)
    setIsAuthenticated(true)
    localStorage.setItem('transitops_token', userToken)
    localStorage.setItem('transitops_user', JSON.stringify(userObj))
    localStorage.setItem('transitops_role', userRole)
  }

  const logout = () => {
    clearAuth()
  }

  const clearAuth = () => {
    setUser(null)
    setRole(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('transitops_token')
    localStorage.removeItem('transitops_user')
    localStorage.removeItem('transitops_role')
  }

  const value = {
    user,
    role,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    clearAuth,
    ROLE_LABELS,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
