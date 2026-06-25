import { ref, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

// Module-level — bleibt über Komponenten hinweg erhalten und ist in api.js nutzbar
let _getTokenSilently = null
const _userId = ref(null)
const _isAdmin = ref(false)

export async function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (_getTokenSilently) {
    try {
      const token = await _getTokenSilently()
      headers['Authorization'] = `Bearer ${token}`
    } catch {
      // nicht eingeloggt
    }
  }
  if (_userId.value) {
    headers['X-User-Id'] = _userId.value
  }
  return headers
}

export function useAuth() {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0()
  _getTokenSilently = getAccessTokenSilently

  const isAdmin = computed(() => _isAdmin.value)
  const userId = computed(() => _userId.value)

  async function syncUser() {
    if (!isAuthenticated.value || !user.value) return
    try {
      const headers = await getAuthHeaders()
      const apiBase = (import.meta.env.VITE_API_BASE_URL ?? 'https://backend-plantable.onrender.com').replace(/\/$/, '')
      const res = await fetch(`${apiBase}/api/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          auth0Id: user.value.sub,
          email: user.value.email,
          name: user.value.name,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        _userId.value = data.id
        _isAdmin.value = data.isAdmin
      }
    } catch (e) {
      console.error('User sync fehlgeschlagen:', e)
    }
  }

  return {
    isAuthenticated,
    user,
    isAdmin,
    userId,
    syncUser,
    getAuthHeaders,
  }
}
