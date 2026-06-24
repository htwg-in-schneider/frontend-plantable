import { useAuth } from '@/composables/useAuth'

const API_BASE = 'http://localhost:8080/api'

async function apiCall(endpoint, method = 'GET', body = null) {
  const { getAuthHeaders } = useAuth()
  const options = {
    method,
    headers: getAuthHeaders(),
  }

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
}

// Plants API
export const plantsApi = {
  getAll: () => apiCall('/plants'),
  getById: (id) => apiCall(`/plants/${id}`),
  deletePlant: (id) => apiCall(`/plants/${id}`, 'DELETE'),
}
