<script setup>
import { useAuth } from '@/composables/useAuth'

const { role, setRole, debugMode, setDebugMode } = useAuth()

const roles = [
  { value: 'guest', label: 'Gast', color: '#95482b' },
  { value: 'user', label: 'Benutzer', color: '#2d4739' },
  { value: 'admin', label: 'Admin', color: '#173124' },
]
</script>

<template>
  <div class="debug-role-selector">
    <button class="debug-toggle" @click="setDebugMode(!debugMode)" :title="debugMode ? 'Debug-Modus aktiv' : 'Debug-Modus inaktiv'">
    <span class="material-symbols-outlined">{{ debugMode ? 'bug_report' : 'bug_report' }}</span>
    </button>

    <div v-if="debugMode" class="role-menu">
      <span class="role-label">Debug-Rolle:</span>
      <button
        v-for="r in roles"
        :key="r.value"
        class="role-button"
        :class="{ aktiv: role === r.value }"
        :style="{ borderColor: r.color, color: role === r.value ? r.color : 'inherit' }"
        @click="setRole(r.value)"
      >
        {{ r.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.debug-role-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem;
}

.debug-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(149, 72, 43, 0.1);
  color: #95482b;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.debug-toggle:hover {
  background-color: rgba(149, 72, 43, 0.2);
}

.debug-toggle .material-symbols-outlined {
  font-size: 1.25rem;
}

.role-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--flaeche);
  border-radius: var(--radius-rund);
  border: 1px solid var(--flaeche-dunkel);
}

.role-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-gedimmt);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.role-button {
  padding: 0.375rem 0.75rem;
  border: 2px solid;
  border-radius: var(--radius-rund);
  background: transparent;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.role-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.role-button.aktiv {
  background-color: currentColor;
  color: #fff;
}

@media (max-width: 1024px) {
  .role-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    flex-direction: column;
    z-index: 1000;
  }

  .role-label {
    display: none;
  }
}
</style>
