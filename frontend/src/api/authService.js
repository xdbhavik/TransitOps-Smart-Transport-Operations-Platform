export const MOCK_USERS = [
  { email: 'fleet@transitops.com', password: 'password123', role: 'fleet_manager', name: 'Raven K.' },
  { email: 'driver@transitops.com', password: 'password123', role: 'driver', name: 'Elena Rostova' },
  { email: 'safety@transitops.com', password: 'password123', role: 'safety_officer', name: 'Marcus Vance' },
  { email: 'finance@transitops.com', password: 'password123', role: 'financial_analyst', name: 'David Chen' },
]

export const loginApi = async (email, password) => {
  // Simulating 500ms API response time
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const user = MOCK_USERS.find(u => u.email === email && u.password === password)
  
  if (!user) {
    const error = new Error('Invalid credentials')
    error.response = { data: { message: 'Invalid email or password' } }
    throw error
  }
  
  return {
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: `mock-jwt-token-for-${user.role}`,
  }
}

export const logoutApi = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
}

export const getMeApi = async () => {
  return {
    name: 'Raven K.',
    email: 'fleet@transitops.com',
    role: 'fleet_manager',
  }
}
