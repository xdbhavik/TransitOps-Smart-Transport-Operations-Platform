export const loginApi = async (email, password, role) => {
  // Simulating 500ms API response time
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    user: {
      name: email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      email,
      role,
    },
    token: `mock-jwt-token-for-${role}`,
  }
}

export const logoutApi = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
}

export const getMeApi = async () => {
  return {
    name: 'Raven K.',
    email: 'admin@transitops.com',
    role: 'fleet_manager',
  }
}
