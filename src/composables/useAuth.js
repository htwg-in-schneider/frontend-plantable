import { ref, computed } from 'vue'

const currentRole = ref(localStorage.getItem('debug_role') || 'guest')
const debugMode = ref(localStorage.getItem('debug_mode') === 'true')

export function useAuth() {
  const role = computed(() => currentRole.value)

  const userId = computed(() => {
    if (role.value === 'guest') return null
    // Mock User IDs für Entwicklung
    return role.value === 'admin' ? 1 : 2
  })

  const isAdmin = computed(() => role.value === 'admin')
  const isUser = computed(() => role.value === 'user')
  const isGuest = computed(() => role.value === 'guest')
  const isAuthenticated = computed(() => role.value !== 'guest')

  function setRole(newRole) {
    currentRole.value = newRole
    localStorage.setItem('debug_role', newRole)
  }

  function setDebugMode(enabled) {
    debugMode.value = enabled
    localStorage.setItem('debug_mode', enabled ? 'true' : 'false')
  }

  // Header für API-Calls
  function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' }
    if (isAuthenticated.value && userId.value) {
      headers['X-User-Id'] = userId.value
    }
    return headers
  }

  return {
    role,
    userId,
    isAdmin,
    isUser,
    isGuest,
    isAuthenticated,
    debugMode,
    setRole,
    setDebugMode,
    getAuthHeaders,
  }
}
