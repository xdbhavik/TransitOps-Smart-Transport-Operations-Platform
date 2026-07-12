import axiosInstance from './axiosInstance'

const normalizeRole = (roleName) => String(roleName || '').toLowerCase()

export const loginApi = async (email, password) => {
  const { data } = await axiosInstance.post('/auth/login', {
    email,
    password,
  })

  return {
    token: data.token,
    user: {
      id: data.userId,
      email: data.email,
      role: normalizeRole(data.roleName),
      name: email.split('@')[0],
    },
    role: normalizeRole(data.roleName),
    message: data.message,
  }
}

export const registerApi = async (payload) => {
  const { data } = await axiosInstance.post('/auth/register', {
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    roleName: payload.roleName ? payload.roleName.toUpperCase() : undefined,
  })

  return {
    token: data.token,
    user: {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: normalizeRole(data.roleName),
    },
    role: normalizeRole(data.roleName),
    message: data.message,
  }
}

export const logoutApi = async () => {
  return Promise.resolve()
}

export const getMeApi = async () => {
  const storedUser = localStorage.getItem('transitops_user')
  if (!storedUser) {
    return null
  }
  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}
