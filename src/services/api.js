import { getAuthHeaders } from '@/composables/useAuth'

const API_BASE = 'http://localhost:8080/api'

async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = await getAuthHeaders()
  const options = { method, headers }

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options)

    if (!response.ok) {
      const error = new Error(`API Error: ${response.status}`)
      error.status = response.status
      throw error
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Community API
export const communityApi = {
  getPosts: () => apiCall('/community/posts'),
  getPost: (id) => apiCall(`/community/posts/${id}`),
  createPost: (postData) => apiCall('/community/posts', 'POST', postData),
  updatePost: (id, postData) => apiCall(`/community/posts/${id}`, 'PUT', postData),
  deletePost: (id) => apiCall(`/community/posts/${id}`, 'DELETE'),

  getComments: (postId) => apiCall(`/community/posts/${postId}/comments`),
  createComment: (postId, content) => apiCall(
    `/community/posts/${postId}/comments`,
    'POST',
    { content }
  ),
  deleteComment: (postId, commentId) => apiCall(
    `/community/posts/${postId}/comments/${commentId}`,
    'DELETE'
  ),
}

// Users API
export const usersApi = {
  createOrGetUser: (userData) => apiCall('/users', 'POST', userData),
  getUser: (id) => apiCall(`/users/${id}`),
  getAllUsers: () => apiCall('/users'),
  updateUser: (id, data) => apiCall(`/users/${id}`, 'PUT', data),
}

// Plants API
export const plantsApi = {
  getAll: () => apiCall('/plants'),
  getById: (id) => apiCall(`/plants/${id}`),
  createPlant: (data) => apiCall('/plants', 'POST', data),
  updatePlant: (id, data) => apiCall(`/plants/${id}`, 'PUT', data),
  deletePlant: (id) => apiCall(`/plants/${id}`, 'DELETE'),
}

// UserPlants API (Dashboard – persönliche Pflanzensammlung)
export const userPlantsApi = {
  add: (plantId, nickname = null, acquiredAt = null) =>
    apiCall('/user-plants', 'POST', { plantId, nickname, acquiredAt }),
  getMyPlants: () => apiCall('/user-plants/me'),
  logCare: (id, careType, action) =>
    apiCall(`/user-plants/${id}/care`, 'POST', { careType, action }),
  update: (id, data) => apiCall(`/user-plants/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/user-plants/${id}`, 'DELETE'),
}

// Dashboard API (Pflegeaufgaben gruppiert nach Fälligkeit)
export const dashboardApi = {
  getCareItems: () => apiCall('/dashboard/care-items'),
}
