
<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { plantsApi } from '@/services/api'
import PflanzeFormular from '@/components/PflanzeFormular.vue'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const { isAdmin } = useAuth()

const rawPlant = ref(null)
const loading = ref(true)
const error = ref(null)

// Edit-Modus
const isEditing = ref(false)

const editForm = reactive({
  botanicalName: '',
  commonName: '',
  slug: '',
  description: '',
  mainImageUrl: '',
  careLevel: 'EASY',
  lightRequirement: 'MEDIUM',
  isPetFriendly: false,
  isAirPurifying: false,
  originRegion: '',
  price: '',
  tags: [],
  defaultWateringIntervalDays: null,
  defaultMistingIntervalDays: null,
  defaultFertilizingIntervalDays: null,
  defaultLeafCleaningIntervalDays: null,
  defaultRepottingIntervalDays: null,
  defaultPruningIntervalDays: null,
  defaultPestCheckIntervalDays: null,
})
const saving = ref(false)
const deleting = ref(false)
const cart = useCartStore()

const imWarenkorb = computed(() =>
  rawPlant.value ? cart.items.some(i => i.plant.id === rawPlant.value.id) : false
)

function addToCart() {
  if (!rawPlant.value) return
  cart.addItem({
    id: rawPlant.value.id,
    name: rawPlant.value.commonName,
    bild: rawPlant.value.mainImageUrl,
    price: rawPlant.value.price,
  })
}

const careMap = {
  EASY:   { stufe: 'leicht',  label: 'Pflegeleicht', icon: 'local_florist' },
  MEDIUM: { stufe: 'mittel',  label: 'Mittel',       icon: 'water_drop' },
  HARD:   { stufe: 'experte', label: 'Experte',      icon: 'psychology' },
}

const lichtMap = {
  LOW:    'Wenig Licht',
  MEDIUM: 'Indirektes Licht',
  BRIGHT: 'Helles, indirektes Licht',
  DIRECT: 'Direkte Sonne',
}

const pflanze = computed(() => {
  if (!rawPlant.value) return null
  const p = rawPlant.value
  const care = careMap[p.careLevel] ?? careMap.EASY
  return {
    id: p.id,
    name: p.commonName,
    latinName: p.botanicalName,
    beschreibung: p.description,
    herkunft: p.originRegion,
    bild: p.mainImageUrl,
    licht: lichtMap[p.lightRequirement] ?? 'Unbekannt',
    haustierfreundlich: p.isPetFriendly,
    luftreinigend: p.isAirPurifying,
    pflegestufe: care.stufe,
    pflegeLabel: care.label,
    pflegeIcon: care.icon,
    tags: (p.tags ?? []).map(t => t.name),
  }
})

async function ladePflanze(id) {
  loading.value = true
  error.value = null
  try {
    rawPlant.value = await plantsApi.getById(id)
  } catch (err) {
    error.value = err.status === 404 ? 'Pflanze nicht gefunden' : err.message
  } finally {
    loading.value = false
  }
}

function startEdit() {
  const p = rawPlant.value
  Object.assign(editForm, {
    botanicalName:    p.botanicalName,
    commonName:       p.commonName,
    slug:             p.slug,
    description:      p.description      ?? '',
    mainImageUrl:     p.mainImageUrl      ?? '',
    careLevel:        p.careLevel,
    lightRequirement: p.lightRequirement,
    isPetFriendly:    p.isPetFriendly,
    isAirPurifying:   p.isAirPurifying,
    originRegion:     p.originRegion      ?? '',
    price:            p.price             ?? '',
    tags:             (p.tags ?? []).map(t => t.name),
    defaultWateringIntervalDays:     p.defaultWateringIntervalDays     ?? null,
    defaultMistingIntervalDays:      p.defaultMistingIntervalDays      ?? null,
    defaultFertilizingIntervalDays:  p.defaultFertilizingIntervalDays  ?? null,
    defaultLeafCleaningIntervalDays: p.defaultLeafCleaningIntervalDays ?? null,
    defaultRepottingIntervalDays:    p.defaultRepottingIntervalDays    ?? null,
    defaultPruningIntervalDays:      p.defaultPruningIntervalDays      ?? null,
    defaultPestCheckIntervalDays:    p.defaultPestCheckIntervalDays    ?? null,
  })
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function speichern() {
  saving.value = true
  try {
    rawPlant.value = await plantsApi.updatePlant(
      route.params.id,
      {
        ...editForm,
        price: editForm.price !== '' ? Number(editForm.price) : null,
        tags: editForm.tags.map(name => ({ name })),
      },
    )
    isEditing.value = false
  } catch (err) {
    alert('Fehler beim Speichern: ' + err.message)
  } finally {
    saving.value = false
  }
}

async function loeschen() {
  if (!confirm(`Pflanze "${pflanze.value.name}" wirklich löschen?`)) return

  deleting.value = true
  try {
    await plantsApi.deletePlant(route.params.id)
    router.push('/katalog')
  } catch (err) {
    alert('Fehler beim Löschen: ' + err.message)
    deleting.value = false
  }
}

onMounted(() => {
  ladePflanze(route.params.id)
})

watch(() => route.params.id, (neueId) => {
  if (neueId) ladePflanze(neueId)
})
</script>

<template>
  <main class="detail-seite">

    <div v-if="loading" class="status-meldung">
      Pflanze wird geladen…
    </div>

    <div v-else-if="error" class="status-meldung fehler">
      <h2>Fehler</h2>
      <p>{{ error }}</p>
      <RouterLink to="/katalog" class="btn-zurueck">Zurück zum Katalog</RouterLink>
    </div>

    <article v-else-if="pflanze" class="detail-inhalt">

      <RouterLink to="/katalog" class="zurueck-link">
        <span class="material-symbols-outlined">arrow_back</span>
        Zurück zum Katalog
      </RouterLink>

      <div class="detail-grid">
        <div class="bild-bereich">
          <img :src="pflanze.bild" :alt="pflanze.name" />
        </div>

        <div class="info-bereich">
          <span class="etikett">{{ pflanze.herkunft }}</span>
          <h1>{{ pflanze.name }}</h1>
          <p class="latein">{{ pflanze.latinName }}</p>

          <p class="beschreibung">{{ pflanze.beschreibung }}</p>

          <div v-if="pflanze.tags.length > 0" class="tag-liste">
            <span v-for="tag in pflanze.tags" :key="tag" class="tag-badge">{{ tag }}</span>
          </div>

          <div class="eigenschaften">
            <div class="eigenschaft">
              <span class="material-symbols-outlined">light_mode</span>
              <div class="eigenschaft-inhalt">
                <span class="eigenschaft-label">Lichtbedarf</span>
                <span class="eigenschaft-wert">{{ pflanze.licht }}</span>
              </div>
            </div>
            <div class="eigenschaft">
              <span class="material-symbols-outlined">{{ pflanze.pflegeIcon }}</span>
              <div class="eigenschaft-inhalt">
                <span class="eigenschaft-label">Pflegelevel</span>
                <span class="eigenschaft-wert">{{ pflanze.pflegeLabel }}</span>
              </div>
            </div>
            <div class="eigenschaft" v-if="pflanze.haustierfreundlich">
              <span class="material-symbols-outlined">pets</span>
              <div class="eigenschaft-inhalt">
                <span class="eigenschaft-label">Haustiere</span>
                <span class="eigenschaft-wert">Unbedenklich</span>
              </div>
            </div>
            <div class="eigenschaft" v-if="pflanze.luftreinigend">
              <span class="material-symbols-outlined">air</span>
              <div class="eigenschaft-inhalt">
                <span class="eigenschaft-label">Luftqualität</span>
                <span class="eigenschaft-wert">Luftreinigend</span>
              </div>
            </div>
          </div>

          <div class="aktionen">
            <button
              class="btn-kaufen"
              :class="{ 'im-warenkorb': imWarenkorb }"
              @click="addToCart"
            >
              {{ imWarenkorb ? 'Im Warenkorb' : 'In den Warenkorb' }}
              <span class="material-symbols-outlined">
                {{ imWarenkorb ? 'shopping_cart' : 'add_shopping_cart' }}
              </span>
            </button>
            <button v-if="isAdmin" class="btn-edit" @click="startEdit">
              <span class="material-symbols-outlined">edit</span>
              Bearbeiten
            </button>
            <button v-if="isAdmin" class="btn-delete" @click="loeschen" :disabled="deleting">
              <span class="material-symbols-outlined">delete</span>
              {{ deleting ? 'Lösche…' : 'Löschen' }}
            </button>
          </div>
        </div>
      </div>

    </article>
  </main>

  <!-- ── Edit Modal ── -->
  <Teleport to="body">
    <div v-if="isEditing" class="modal-overlay" @click.self="cancelEdit">
      <div class="modal">
        <div class="modal-kopf">
          <h2>Pflanze bearbeiten</h2>
          <button class="modal-schliessen" @click="cancelEdit">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="speichern">
          <PflanzeFormular :form="editForm">
            <template #aktionen>
              <div class="form-aktionen">
                <button type="submit" class="btn-speichern" :disabled="saving">
                  {{ saving ? 'Speichere…' : 'Speichern' }}
                </button>
                <button type="button" class="btn-abbrechen" @click="cancelEdit">
                  Abbrechen
                </button>
                <button v-if="isAdmin" type="button" class="btn-delete" @click="loeschen" :disabled="deleting">
                  <span class="material-symbols-outlined">delete</span>
                  {{ deleting ? 'Lösche…' : 'Löschen' }}
                </button>
              </div>
            </template>
          </PflanzeFormular>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.detail-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: var(--max-breite);
  margin: 0 auto;
}

.status-meldung {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-gedimmt);
}

.status-meldung.fehler {
  color: #ba1a1a;
}

.zurueck-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gruen);
  font-size: 0.875rem;
  margin-bottom: 2rem;
  transition: color 0.2s;
}

.zurueck-link:hover {
  color: var(--gruen-dunkel);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: start;
}

@media (min-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
}

.bild-bereich {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: var(--radius);
  background-color: var(--flaeche-hell);
}

.bild-bereich img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-bereich {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-bereich h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--gruen-dunkel);
  margin: 0.5rem 0 0 0;
}

.info-bereich .latein {
  font-family: var(--schrift-serif);
  font-style: italic;
  color: var(--rand);
  font-size: 1.125rem;
  margin: 0;
}

.beschreibung {
  color: var(--text-leise);
  line-height: 1.7;
  font-size: 1rem;
}

.eigenschaften {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--flaeche-hell);
  border-radius: var(--radius);
}

.eigenschaft {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.eigenschaft .material-symbols-outlined {
  color: var(--gruen);
  font-size: 1.5rem;
}

.eigenschaft-inhalt {
  display: flex;
  flex-direction: column;
}

.eigenschaft-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-gedimmt);
}

.eigenschaft-wert {
  font-size: 0.875rem;
  color: var(--gruen-dunkel);
  font-weight: 500;
}

.btn-kaufen {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: var(--radius-rund);
  background-color: var(--gruen);
  color: #fff;
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.btn-kaufen:hover { background-color: var(--gruen-dunkel); }
.btn-kaufen.im-warenkorb { background-color: var(--gruen-dunkel); }

.btn-zurueck {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-rund);
  background-color: var(--gruen);
  color: #fff;
  text-decoration: none;
}
/* ── Aktionen im Anzeige-Modus ── */
.aktionen {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-edit,
.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-rund);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.btn-edit {
  border-color: var(--gruen);
  color: var(--gruen);
}
.btn-edit:hover { background-color: var(--gruen); color: #fff; }

.btn-delete {
  border-color: #ba1a1a;
  color: #ba1a1a;
}
.btn-delete:hover:not(:disabled) { background-color: #ba1a1a; color: #fff; }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Tag-Badges (Detail-Ansicht) ── */
.tag-liste {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-rund);
  background-color: var(--flaeche);
  border: 1px solid var(--flaeche-dunkel);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-aktionen {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.btn-speichern,
.btn-abbrechen {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-rund);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-speichern {
  background-color: var(--gruen);
  color: #fff;
  border: none;
}
.btn-speichern:hover:not(:disabled) { background-color: var(--gruen-dunkel); }
.btn-speichern:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-abbrechen {
  background: transparent;
  color: var(--text-leise);
  border: 1px solid var(--flaeche-dunkel);
}
.btn-abbrechen:hover { background-color: var(--flaeche-dunkel); }

@media (max-width: 640px) {
  .detail-seite {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: calc(var(--header-hoehe) + 1rem);
  }

  .eigenschaften {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .aktionen {
    flex-direction: column;
  }

  .btn-kaufen,
  .btn-edit,
  .btn-delete {
    align-self: stretch;
    justify-content: center;
  }

  .info-bereich {
    gap: 1rem;
  }
}
</style>
