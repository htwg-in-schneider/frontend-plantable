<script setup>
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { plantsApi } from '@/services/api'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  pflanze: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['deleted'])
const { isAdmin } = useAuth()
const cart = useCartStore()
const deleting = ref(false)

const imWarenkorb = computed(() =>
  cart.items.some(i => i.plant.id === props.pflanze.id)
)

function addToCart() {
  cart.addItem({
    id: props.pflanze.id,
    name: props.pflanze.name,
    bild: props.pflanze.bild,
    price: props.pflanze.preis,
  })
}

async function deletePlant() {
  if (!window.confirm(`Pflanze "${props.pflanze.name}" wirklich löschen?`)) return
  deleting.value = true
  try {
    await plantsApi.deletePlant(props.pflanze.id)
    emit('deleted', props.pflanze.id)
  } catch (error) {
    alert('Fehler beim Löschen: ' + error.message)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <article class="pflanzenkarte">
    <div class="pflanzenbild">
      <RouterLink :to="{ name: 'pflanze-detail', params: { id: pflanze.id } }" class="bild-link">
        <img :src="pflanze.bild" :alt="pflanze.name" />
      </RouterLink>
      <button
        v-if="isAdmin"
        @click="deletePlant"
        :disabled="deleting"
        class="btn-delete-admin"
        title="Nur für Admins"
      >
        <span class="material-symbols-outlined">delete</span>
      </button>
    </div>
    <div class="pflanzen-info">
      <div class="pflanzen-kopf">
        <span class="etikett">{{ pflanze.kategorie }}</span>
        <span class="pflege-badge" :class="pflanze.pflegestufe">
          <span class="material-symbols-outlined">{{ pflanze.pflegeIcon }}</span>
          {{ pflanze.pflegeLabel }}
        </span>
      </div>
      <h3 class="pflanzen-name">{{ pflanze.name }}</h3>
      <p class="pflanzen-latin">{{ pflanze.latinName }}</p>
      <div class="pflanzen-fuss">
        <span class="pflanze-preis" v-if="pflanze.preis !== null">
          {{ pflanze.preis.toFixed(2).replace('.', ',') }} €
        </span>
        <span class="pflanze-preis" v-else>Preis auf Anfrage</span>
        <button
          class="warenkorb-btn"
          :class="{ 'im-warenkorb': imWarenkorb }"
          :aria-label="`${pflanze.name} in den Warenkorb`"
          @click="addToCart"
        >
          <span class="material-symbols-outlined">
            {{ imWarenkorb ? 'shopping_cart' : 'add_shopping_cart' }}
          </span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.pflanzenkarte {
  background-color: #fff;
  border-radius: var(--radius);
  overflow: hidden;
  transition: box-shadow 0.5s;
}

.pflanzenkarte:hover {
  box-shadow: 0 20px 80px rgba(62, 54, 49, 0.12);
}

.pflanzenbild {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background-color: var(--flaeche-hell);
  position: relative;
}

.bild-link {
  display: block;
  width: 100%;
  height: 100%;
}

.pflanzenbild img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.pflanzenkarte:hover .pflanzenbild img { transform: scale(1.1); }

.btn-delete-admin {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(186, 26, 26, 0.9);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 5;
}

.pflanzenkarte:hover .btn-delete-admin { opacity: 1; }
.btn-delete-admin:hover:not(:disabled) { background-color: #ba1a1a; }
.btn-delete-admin:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-delete-admin .material-symbols-outlined { font-size: 1.25rem; }

.pflanzen-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pflanzen-kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.pflege-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-rund);
  font-size: 0.55rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pflege-badge .material-symbols-outlined { font-size: 0.75rem; }
.pflege-badge.leicht  { background-color: #3a4711; color: #d9eaa3; }
.pflege-badge.mittel  { background-color: rgba(255, 181, 155, 0.2); color: var(--terrakotta); }
.pflege-badge.experte { background-color: #ffdad6; color: #ba1a1a; }

.pflanzen-name {
  font-size: 1.25rem;
  color: var(--gruen-dunkel);
}

.pflanzen-latin {
  font-family: var(--schrift-serif);
  font-style: italic;
  font-size: 0.875rem;
  color: var(--rand);
}

.pflanzen-fuss {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}

.pflanze-preis {
  font-family: var(--schrift-serif);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gruen-dunkel);
}

.warenkorb-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--gruen);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.2s;
}

.warenkorb-btn:hover { background-color: var(--gruen-dunkel); }
.warenkorb-btn.im-warenkorb { background-color: var(--gruen-dunkel); }
.warenkorb-btn .material-symbols-outlined { font-size: 1.25rem; }
</style>
