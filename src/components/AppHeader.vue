<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useCartStore } from '@/stores/cart'
import { useAuth } from '@/composables/useAuth'
import { usersApi } from '@/services/api'

const menuOffen = ref(false)
const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0()
const { userId, isAdmin } = useAuth()
const cart = useCartStore()

const profilMenuOffen = ref(false)
const showProfilModal = ref(false)
const profilSaving = ref(false)
const profilForm = reactive({ name: '', email: '' })

function toggleMenu() {
  menuOffen.value = !menuOffen.value
}

function handleLogout() {
  logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })
}

function toggleProfilMenu() {
  profilMenuOffen.value = !profilMenuOffen.value
}

async function oeffneProfilModal() {
  profilMenuOffen.value = false
  profilForm.name = user.value?.name ?? ''
  profilForm.email = user.value?.email ?? ''
  if (userId.value) {
    try {
      const data = await usersApi.getUser(userId.value)
      profilForm.name = data.name ?? profilForm.name
      profilForm.email = data.email ?? profilForm.email
    } catch {
      // Fallback auf Auth0-Daten
    }
  }
  showProfilModal.value = true
}

async function speichereProfil() {
  if (!userId.value) return
  profilSaving.value = true
  try {
    await usersApi.updateUser(userId.value, {
      name: profilForm.name,
      isAdmin: isAdmin.value,
    })
    showProfilModal.value = false
  } catch (err) {
    alert('Fehler beim Speichern: ' + err.message)
  } finally {
    profilSaving.value = false
  }
}

function schliesseProfilMenuAussen(e) {
  if (!e.target.closest('.profil-wrapper')) {
    profilMenuOffen.value = false
  }
}

onMounted(() => document.addEventListener('click', schliesseProfilMenuAussen))
onBeforeUnmount(() => document.removeEventListener('click', schliesseProfilMenuAussen))
</script>

<template>
  <header>
    <div class="header-innen">
      <RouterLink to="/" class="logo">Plantable</RouterLink>

      <nav id="nav-menu" :class="{ offen: menuOffen }">
        <RouterLink to="/katalog">Katalog</RouterLink>
        <RouterLink to="/community">Community</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
      </nav>

      <div class="aktionen">
        <RouterLink to="/warenkorb" class="icon-btn warenkorb-link" aria-label="Warenkorb">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span v-if="cart.totalItems > 0" class="warenkorb-badge">{{ cart.totalItems }}</span>
        </RouterLink>

        <button v-if="!isAuthenticated" class="desktop-only" aria-label="Einloggen" @click="loginWithRedirect()">
          <span class="material-symbols-outlined">person</span>
        </button>

        <div v-else class="profil-wrapper">
          <button class="profil-btn" @click.stop="toggleProfilMenu" aria-label="Profil">
            <img v-if="user?.picture" :src="user.picture" alt="Profilbild" class="profil-bild" />
            <span v-else class="material-symbols-outlined">person</span>
          </button>
          <div v-if="profilMenuOffen" class="profil-dropdown">
            <button class="profil-dropdown-item" @click="oeffneProfilModal">
              <span class="material-symbols-outlined">manage_accounts</span>
              Profil bearbeiten
            </button>
            <button class="profil-dropdown-item" @click="handleLogout">
              <span class="material-symbols-outlined">logout</span>
              Ausloggen
            </button>
          </div>
        </div>

        <button class="hamburger" aria-label="Menü öffnen" @click="toggleMenu">
          <span class="material-symbols-outlined">
            {{ menuOffen ? 'close' : 'menu' }}
          </span>
        </button>
      </div>
    </div>
    <div class="trennlinie"></div>
  </header>

  <Teleport to="body">
    <div v-if="showProfilModal" class="profil-modal-overlay" @click.self="showProfilModal = false">
      <div class="profil-modal-box">
        <div class="profil-modal-kopf">
          <div class="profil-modal-avatar">
            <img v-if="user?.picture" :src="user.picture" alt="Profilbild" class="profil-modal-bild" />
            <span v-else class="material-symbols-outlined">person</span>
          </div>
          <div>
            <h2 class="profil-modal-titel">Profil bearbeiten</h2>
            <p class="profil-modal-sub">Stammdaten anpassen</p>
          </div>
          <button class="profil-modal-schliessen" @click="showProfilModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="speichereProfil" class="profil-form">
          <div class="profil-form-gruppe">
            <label class="profil-form-label">E-Mail</label>
            <input type="email" :value="profilForm.email" readonly class="profil-form-input readonly" />
          </div>
          <div class="profil-form-gruppe">
            <label class="profil-form-label">Name</label>
            <input v-model="profilForm.name" type="text" required class="profil-form-input" placeholder="Dein Name" />
          </div>
          <div class="profil-form-aktionen">
            <button type="submit" class="profil-btn-speichern" :disabled="profilSaving">
              {{ profilSaving ? 'Speichere…' : 'Speichern' }}
            </button>
            <button type="button" class="profil-btn-abbrechen" @click="showProfilModal = false">Abbrechen</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style>
.profil-bild {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.warenkorb-link {
  position: relative;
}

.warenkorb-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: var(--terrakotta, #95482b);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
}

/* ── Profil Wrapper ── */
.profil-wrapper {
  position: relative;
}

.profil-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  transition: opacity 0.2s;
}
.profil-btn:hover { opacity: 0.8; }

/* ── Profil Dropdown ── */
.profil-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 12rem;
  background: #fff;
  border: 1px solid var(--flaeche-dunkel, #e8e0d8);
  border-radius: var(--radius, 0.5rem);
  box-shadow: 0 8px 24px rgba(62, 54, 49, 0.12);
  z-index: 200;
  overflow: hidden;
}

.profil-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  color: var(--gruen-dunkel, #2d4739);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background-color 0.15s;
}
.profil-dropdown-item:hover { background-color: var(--flaeche, #f4ede6); }
.profil-dropdown-item .material-symbols-outlined { font-size: 1.1rem; color: var(--text-gedimmt, #857b72); }
.profil-dropdown-item + .profil-dropdown-item { border-top: 1px solid var(--flaeche-dunkel, #e8e0d8); }

/* ── Profil Modal ── */
.profil-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 1rem;
}

.profil-modal-box {
  background: var(--hintergrund, #fdf8f4);
  border-radius: var(--radius, 0.5rem);
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 80px rgba(62, 54, 49, 0.2);
}

.profil-modal-kopf {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.profil-modal-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: var(--flaeche, #f4ede6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profil-modal-bild {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profil-modal-titel {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gruen-dunkel, #2d4739);
  margin: 0 0 0.2rem;
}

.profil-modal-sub {
  font-size: 0.8rem;
  color: var(--text-gedimmt, #857b72);
  margin: 0;
}

.profil-modal-schliessen {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-gedimmt, #857b72);
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}
.profil-modal-schliessen:hover { background-color: var(--flaeche-dunkel, #e8e0d8); }
.profil-modal-schliessen .material-symbols-outlined { font-size: 1.25rem; }

.profil-form { display: flex; flex-direction: column; gap: 1rem; }

.profil-form-gruppe { display: flex; flex-direction: column; gap: 0.375rem; }

.profil-form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gruen-dunkel, #2d4739);
}

.profil-form-input {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--flaeche-dunkel, #e8e0d8);
  border-radius: var(--radius, 0.5rem);
  font-size: 0.875rem;
  color: var(--gruen-dunkel, #2d4739);
  font-family: inherit;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}
.profil-form-input:focus { border-color: var(--gruen, #3d7355); }
.profil-form-input.readonly { background: var(--flaeche-hell, #fdf8f4); color: var(--text-gedimmt, #857b72); cursor: default; }

.profil-form-aktionen {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.profil-btn-speichern,
.profil-btn-abbrechen {
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-rund, 999px);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.2s;
}

.profil-btn-speichern { background-color: var(--gruen, #3d7355); color: #fff; border: none; }
.profil-btn-speichern:hover:not(:disabled) { background-color: var(--gruen-dunkel, #2d4739); }
.profil-btn-speichern:disabled { opacity: 0.5; cursor: not-allowed; }

.profil-btn-abbrechen { background: transparent; color: var(--text-leise, #857b72); border: 1px solid var(--flaeche-dunkel, #e8e0d8); }
.profil-btn-abbrechen:hover { background-color: var(--flaeche-dunkel, #e8e0d8); }
</style>
