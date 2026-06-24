<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useCartStore } from '@/stores/cart'

const menuOffen = ref(false)
const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0()
const cart = useCartStore()

function toggleMenu() {
  menuOffen.value = !menuOffen.value
}

function handleLogout() {
  logout({ logoutParams: { returnTo: window.location.origin } })
}
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
        <template v-else>
          <img v-if="user?.picture" :src="user.picture" alt="Profilbild" class="profil-bild" />
          <button class="desktop-only" @click="handleLogout()">
            Ausloggen
          </button>
        </template>

        <button class="hamburger" aria-label="Menü öffnen" @click="toggleMenu">
          <span class="material-symbols-outlined">
            {{ menuOffen ? 'close' : 'menu' }}
          </span>
        </button>
      </div>
    </div>
    <div class="trennlinie"></div>
  </header>
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
</style>
