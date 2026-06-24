<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { plantsApi } from '@/services/api'
import PflanzenKarte from '@/components/PflanzenKarte.vue'
import PflanzeFormular from '@/components/PflanzeFormular.vue'

const { isAdmin } = useAuth()

const pflegeOptionen = [
  { wert: 'leicht',  label: 'Pflegeleicht' },
  { wert: 'mittel',  label: 'Mittel' },
  { wert: 'experte', label: 'Experte' },
]
const aktivePflege = ref(null)

const lichtOptionen = [
  { wert: 'LOW',    label: 'Wenig Licht' },
  { wert: 'MEDIUM', label: 'Indirektes Licht' },
  { wert: 'BRIGHT', label: 'Helles Indirekt' },
  { wert: 'DIRECT', label: 'Direkte Sonne' },
]
const aktivesLicht = ref(null)

const preisMax = ref(250)

const aktiveTags = ref([])
const showMobileFilter = ref(false)

// Backend-Daten
const rawPlants = ref([])
const loading = ref(true)
const error = ref(null)

// Pflegestufen-Übersetzung
const careMap = {
  EASY:   { stufe: 'leicht',  label: 'Pflegeleicht', icon: 'local_florist' },
  MEDIUM: { stufe: 'mittel',  label: 'Mittel',       icon: 'water_drop' },
  HARD:   { stufe: 'experte', label: 'Experte',      icon: 'psychology' },
}

// Backend-Format → Frontend-Format
const pflanzen = computed(() =>
  rawPlants.value.map(p => {
    const care = careMap[p.careLevel] ?? careMap.EASY
    return {
      id: p.id,
      name: p.commonName,
      latinName: p.botanicalName,
      kategorie: p.originRegion ?? 'Pflanze',
      bild: p.mainImageUrl,
      pflegestufe: care.stufe,
      pflegeLabel: care.label,
      pflegeIcon: care.icon,
      licht: p.lightRequirement,
      preis: p.price ?? null,
      tags: (p.tags ?? []).map(t => t.name),
    }
  })
)

// Verfügbare Tags aus den geladenen Daten
const verfuegbareTags = computed(() => {
  const tagSet = new Set(pflanzen.value.flatMap(p => p.tags))
  return [...tagSet].sort()
})

// Suche
const suchbegriff = ref('')

const gefiltertePflanzen = computed(() => {
  let result = pflanzen.value

  const q = suchbegriff.value.toLowerCase().trim()
  if (q) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.latinName.toLowerCase().includes(q)
    )
  }

  if (aktivePflege.value) {
    result = result.filter(p => p.pflegestufe === aktivePflege.value)
  }

  if (aktivesLicht.value) {
    result = result.filter(p => p.licht === aktivesLicht.value)
  }

  result = result.filter(p => p.preis === null || p.preis <= preisMax.value)

  if (aktiveTags.value.length > 0) {
    result = result.filter(p =>
      aktiveTags.value.some(tag => p.tags.includes(tag))
    )
  }

  return result
})

// Neues Produkt Modal
const showNeuModal = ref(false)
const saving = ref(false)
const neuForm = reactive({
  botanicalName: '', commonName: '', slug: '', description: '',
  mainImageUrl: '', careLevel: 'EASY', lightRequirement: 'MEDIUM',
  isPetFriendly: false, isAirPurifying: false, originRegion: '',
  price: '', tags: [],
  defaultWateringIntervalDays: null, defaultMistingIntervalDays: null,
  defaultFertilizingIntervalDays: null, defaultLeafCleaningIntervalDays: null,
  defaultRepottingIntervalDays: null, defaultPruningIntervalDays: null,
  defaultPestCheckIntervalDays: null,
})

function oeffneModal() {
  Object.assign(neuForm, {
    botanicalName: '', commonName: '', slug: '', description: '',
    mainImageUrl: '', careLevel: 'EASY', lightRequirement: 'MEDIUM',
    isPetFriendly: false, isAirPurifying: false, originRegion: '', price: '', tags: [],
    defaultWateringIntervalDays: null, defaultMistingIntervalDays: null,
    defaultFertilizingIntervalDays: null, defaultLeafCleaningIntervalDays: null,
    defaultRepottingIntervalDays: null, defaultPruningIntervalDays: null,
    defaultPestCheckIntervalDays: null,
  })
  showNeuModal.value = true
}

async function erstellePflanze() {
  saving.value = true
  try {
    const neu = await plantsApi.createPlant({
      ...neuForm,
      price: neuForm.price !== '' ? Number(neuForm.price) : null,
      tags: neuForm.tags.map(name => ({ name })),
    })
    rawPlants.value.push(neu)
    showNeuModal.value = false
  } catch (err) {
    alert('Fehler beim Erstellen: ' + err.message)
  } finally {
    saving.value = false
  }
}

async function ladePflanzen() {
  try {
    rawPlants.value = await plantsApi.getAll()
  } catch (err) {
    error.value = err.message
    console.error('Fehler beim Laden:', err)
  } finally {
    loading.value = false
  }
}

function pflanzeEntfernt(id) {
  rawPlants.value = rawPlants.value.filter(p => p.id !== id)
}

onMounted(ladePflanzen)
</script>

<template>
  <main class="katalog-seite">

    <div v-if="showMobileFilter" class="mobile-filter-backdrop" @click="showMobileFilter = false"></div>

    <aside class="katalog-sidebar" :class="{ 'mobile-offen': showMobileFilter }">
      <div class="filter-kopf">
        <div>
          <h2>Filter</h2>
          <span class="etikett">Auswahl verfeinern</span>
        </div>
        <button class="mobile-filter-schliessen" @click="showMobileFilter = false">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav class="filter-nav">

        <div class="filter-abschnitt">
          <div class="filter-titel">
            <span class="material-symbols-outlined">psychology_alt</span>
            <span>Pflegestufe</span>
          </div>
          <div class="filter-pillen">
            <button
              v-for="option in pflegeOptionen"
              :key="option.wert"
              class="filter-pille"
              :class="{ aktiv: aktivePflege === option.wert }"
              @click="aktivePflege = aktivePflege === option.wert ? null : option.wert"
            >{{ option.label }}</button>
          </div>
        </div>

        <div class="filter-abschnitt">
          <div class="filter-titel">
            <span class="material-symbols-outlined">light_mode</span>
            <span>Lichtbedarf</span>
          </div>
          <div class="filter-pillen">
            <button
              v-for="option in lichtOptionen"
              :key="option.wert"
              class="filter-pille"
              :class="{ aktiv: aktivesLicht === option.wert }"
              @click="aktivesLicht = aktivesLicht === option.wert ? null : option.wert"
            >{{ option.label }}</button>
          </div>
        </div>

        <div class="filter-abschnitt">
          <div class="filter-titel">
            <span class="material-symbols-outlined">payments</span>
            <span>Preisbereich</span>
          </div>
          <div class="preis-slider">
            <input type="range" v-model="preisMax" min="10" max="250" />
            <div class="preis-bereich">
              <span>10 €</span>
              <span>bis {{ preisMax }} €</span>
            </div>
          </div>
        </div>

        <div class="filter-abschnitt">
          <div class="filter-titel">
            <span class="material-symbols-outlined">label</span>
            <span>Tags</span>
          </div>
          <div class="filter-checkbox-liste">
            <label v-for="tag in verfuegbareTags" :key="tag" class="filter-checkbox-option">
              <input type="checkbox" :value="tag" v-model="aktiveTags" />
              {{ tag }}
            </label>
          </div>
        </div>

      </nav>
    </aside>

    <section class="katalog-inhalt">

      <div class="katalog-kopf">
        <div class="katalog-kopf-oben">
          <div>
            <h1 class="katalog-titel">Botanisches Archiv</h1>
            <p class="katalog-beschreibung">

            </p>
          </div>


        </div>
        <div class="katalog-kopf-unten">
          <button class="btn-mobile-filter" @click="showMobileFilter = true">
            <span class="material-symbols-outlined">tune</span>
          </button>
          <div class="such-wrapper">
            <span class="material-symbols-outlined">search</span>
            <input
              v-model="suchbegriff"
              type="search"
              placeholder="Pflanze oder lat. Name suchen…"
              class="such-input"
            />
          </div>
          <button class="btn-neu" v-if="isAdmin" @click="oeffneModal">
            <span class="material-symbols-outlined">add</span>
            <span class="btn-neu-text">Neue Pflanze</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="status-meldung">
        Pflanzen werden geladen…
      </div>

      <div v-else-if="error" class="status-meldung fehler">
        Fehler beim Laden: {{ error }}
      </div>

      <div v-else class="pflanzen-raster">
        <PflanzenKarte
          v-for="pflanze in gefiltertePflanzen"
          :key="pflanze.id"
          :pflanze="pflanze"
          @deleted="pflanzeEntfernt"
        />
      </div>

    </section>
  </main>

  <!-- ── Neues Produkt Modal ── -->
  <Teleport to="body">
    <div v-if="showNeuModal" class="modal-overlay" @click.self="showNeuModal = false">
      <div class="modal">
        <div class="modal-kopf">
          <h2>Neue Pflanze anlegen</h2>
          <button class="modal-schliessen" @click="showNeuModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="erstellePflanze">
          <PflanzeFormular :form="neuForm">
            <template #aktionen>
              <div class="form-aktionen">
                <button type="submit" class="btn-speichern" :disabled="saving">
                  {{ saving ? 'Speichere…' : 'Anlegen' }}
                </button>
                <button type="button" class="btn-abbrechen" @click="showNeuModal = false">
                  Abbrechen
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
/* ── Layout ── */
.katalog-seite {
  display: flex;
  gap: 3rem;
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: var(--max-breite);
  margin: 0 auto;
  align-items: flex-start;
}

/* ── Sidebar ── */
.katalog-sidebar {
  width: 16rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--hintergrund);
  border-right: 1px solid var(--flaeche-dunkel);
  border-radius: 0 var(--radius) var(--radius) 0;
  box-shadow: 20px 0 80px rgba(62, 54, 49, 0.06);
  position: sticky;
  top: calc(var(--header-hoehe) + 1rem);
  max-height: calc(100vh - var(--header-hoehe) - 2rem);
  overflow-y: auto;
}

.filter-kopf h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gruen);
  margin-bottom: 0.25rem;
}

.filter-nav {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.filter-abschnitt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-titel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--gruen);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.filter-titel .material-symbols-outlined { font-size: 1.125rem; }

.filter-pillen {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-pille {
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-rund);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-leise);
  transition: background-color 0.2s, color 0.2s;
}

.filter-pille:hover { background-color: var(--flaeche); }
.filter-pille.aktiv { background-color: var(--terrakotta); color: #fff; }

.preis-slider { padding: 0 0.25rem; }

.preis-slider input[type="range"] {
  width: 100%;
  accent-color: var(--terrakotta);
}

.preis-bereich {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  color: var(--text-gedimmt);
  margin-top: 0.5rem;
}

.filter-checkbox-liste {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-leise);
  cursor: pointer;
  transition: color 0.2s;
}

.filter-checkbox-option:hover { color: var(--gruen); }

.filter-checkbox-option input[type="checkbox"] {
  accent-color: var(--terrakotta);
  width: 0.875rem;
  height: 0.875rem;
}

/* ── Katalog Inhalt ── */
.katalog-inhalt { flex: 1; min-width: 0; }

.katalog-kopf {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.katalog-kopf-oben {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
}

.katalog-kopf-unten {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.such-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 1rem;
  background-color: var(--flaeche);
  border-radius: var(--radius-rund);
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.such-wrapper:focus-within {
  border-color: var(--gruen);
  background-color: #fff;
}

.such-wrapper .material-symbols-outlined {
  font-size: 1.125rem;
  color: var(--text-gedimmt);
  flex-shrink: 0;
}

.such-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: var(--gruen-dunkel);
  font-family: inherit;
}

.such-input::placeholder { color: var(--text-gedimmt); }

.katalog-titel {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin-bottom: 0.5rem;
}

.katalog-beschreibung {
  color: var(--text-gedimmt);
  font-weight: 300;
  max-width: 28rem;
}

/* ── Pflanzen-Raster ── */
.pflanzen-raster {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 640px) {
  .pflanzen-raster { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1280px) {
  .pflanzen-raster { grid-template-columns: repeat(3, 1fr); }
}


/* ── Neue Pflanze Button ── */
.btn-neu {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-rund);
  background-color: var(--gruen);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-neu:hover { background-color: var(--gruen-dunkel); }
.btn-neu .material-symbols-outlined { font-size: 1rem; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: var(--hintergrund);
  border-radius: var(--radius);
  padding: 2rem;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(62, 54, 49, 0.2);
}

.modal-kopf {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-kopf h2 {
  font-size: 1.25rem;
  color: var(--gruen-dunkel);
  margin: 0;
}

.modal-schliessen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: var(--text-gedimmt);
  transition: background-color 0.2s;
}
.modal-schliessen:hover { background-color: var(--flaeche-dunkel); }
.modal-schliessen .material-symbols-outlined { font-size: 1.25rem; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-full { grid-column: 1 / -1; }

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--gruen-dunkel);
  font-weight: 500;
}

.form-grid input,
.form-grid textarea,
.form-grid select {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  background: #fff;
  font-size: 0.875rem;
  font-family: inherit;
}

.form-grid input:focus,
.form-grid textarea:focus,
.form-grid select:focus {
  outline: none;
  border-color: var(--gruen);
}

.form-checkbox {
  flex-direction: row !important;
  align-items: center !important;
  gap: 0.5rem !important;
}
.form-checkbox input { width: 1rem; height: 1rem; }

.form-aktionen {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
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

/* ── Tag-Auswahl im Formular ── */
.form-tags-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-tags-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gruen-dunkel);
}

.form-tags-pillen {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.form-tag-pille {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-rund);
  border: 1px solid var(--flaeche-dunkel);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-leise);
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.form-tag-pille:hover { background-color: var(--flaeche); }
.form-tag-pille.aktiv { background-color: var(--gruen); color: #fff; border-color: var(--gruen); }

/* ── Filter-Kopf ── */
.filter-kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* ── Mobile Filter Button (nur auf Mobile sichtbar) ── */
.btn-mobile-filter {
  display: none;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-rund);
  background-color: var(--flaeche);
  color: var(--gruen-dunkel);
  flex-shrink: 0;
  transition: background-color 0.2s;
}
.btn-mobile-filter:hover { background-color: var(--flaeche-dunkel); }
.btn-mobile-filter .material-symbols-outlined { font-size: 1.25rem; }

.mobile-filter-schliessen {
  display: none;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: var(--text-gedimmt);
  flex-shrink: 0;
  transition: background-color 0.2s;
}
.mobile-filter-schliessen:hover { background-color: var(--flaeche-dunkel); }
.mobile-filter-schliessen .material-symbols-outlined { font-size: 1.25rem; }

.mobile-filter-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 199;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .katalog-seite {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .form-grid { grid-template-columns: 1fr; }

  .katalog-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-110%);
    width: min(18rem, 85vw);
    max-height: 100dvh;
    border-radius: 0 var(--radius) var(--radius) 0;
    z-index: 200;
    transition: transform 0.3s ease;
    padding-top: calc(var(--header-hoehe) + 1.5rem);
    box-shadow: 4px 0 32px rgba(62, 54, 49, 0.18);
  }

  .katalog-sidebar.mobile-offen {
    transform: translateX(0);
  }

  .mobile-filter-backdrop { display: block; }
  .btn-mobile-filter { display: inline-flex; }
  .mobile-filter-schliessen { display: inline-flex; }

  .katalog-kopf-unten { gap: 0.5rem; }

  .btn-neu-text { display: none; }
  .btn-neu { padding: 0.5rem 0.75rem; }
}
</style>
