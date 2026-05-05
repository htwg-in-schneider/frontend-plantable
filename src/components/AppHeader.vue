<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const menuOffen = ref(false)

function toggleMenu() {
  menuOffen.value = !menuOffen.value
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
        <button aria-label="Warenkorb">
          <span class="material-symbols-outlined">shopping_cart</span>
        </button> 
        <button aria-label="Profil" class="desktop-only">
          <span class="material-symbols-outlined">person</span>
        </button>

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