<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import PflanzenKarte from '@/components/PflanzenKarte.vue'

const { isAdmin } = useAuth()

// Meine Pflanzen
const meineLinien = ref([])

// Verfügbare Pflanzen aus Katalog
const verfuegbarePflanzen = ref([])
const loading = ref(true)
const error = ref(null)

// Modal zum Hinzufügen von Pflanzen
const showAddModal = ref(false)
const searchBegriff = ref('')
const filterPflege = ref(null)
const filterLicht = ref(null)

// Pflegestufen-Übersetzung
const careMap = {
  EASY:   { stufe: 'leicht',  label: 'Pflegeleicht', icon: 'local_florist' },
  MEDIUM: { stufe: 'mittel',  label: 'Mittel',       icon: 'water_drop' },
  HARD:   { stufe: 'experte', label: 'Experte',      icon: 'psychology' },
}

const lichtOptionen = [
  { wert: 'LOW',    label: 'Wenig Licht' },
  { wert: 'MEDIUM', label: 'Indirektes Licht' },
  { wert: 'BRIGHT', label: 'Helles Indirekt' },
  { wert: 'DIRECT', label: 'Direkte Sonne' },
]

const pflegeOptionen = [
  { wert: 'leicht',  label: 'Pflegeleicht' },
  { wert: 'mittel',  label: 'Mittel' },
  { wert: 'experte', label: 'Experte' },
]

// Backend-Format → Frontend-Format
const formatierePflanzen = (plants) =>
  plants.map(p => {
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

const meinePflanzen = computed(() => formatierePflanzen(meineLinien.value))

// Gefilterte Katalog-Pflanzen
const gefiltertePflanzen = computed(() => {
  let result = formatierePflanzen(verfuegbarePflanzen.value)

  const meineIds = new Set(meineLinien.value.map(p => p.id))
  result = result.filter(p => !meineIds.has(p.id))

  const q = searchBegriff.value.toLowerCase().trim()
  if (q) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.latinName.toLowerCase().includes(q)
    )
  }

  if (filterPflege.value) {
    result = result.filter(p => p.pflegestufe === filterPflege.value)
  }

  if (filterLicht.value) {
    result = result.filter(p => p.licht === filterLicht.value)
  }

  return result
})

async function ladePflanzen() {
  try {
    const response = await fetch('http://localhost:8080/api/plants')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    verfuegbarePflanzen.value = await response.json()
    ladeMeinePflanzen()
  } catch (err) {
    error.value = err.message
    console.error('Fehler beim Laden:', err)
  } finally {
    loading.value = false
  }
}

function ladeMeinePflanzen() {
  const gespeichert = localStorage.getItem('meine_pflanzen')
  if (gespeichert) {
    try {
      meineLinien.value = JSON.parse(gespeichert)
    } catch {
      meineLinien.value = []
    }
  }
}

function speichereMeinePflanzen() {
  localStorage.setItem('meine_pflanzen', JSON.stringify(meineLinien.value))
}

function pflanzeHinzufuegen(pflanze) {
  const backendPflanze = verfuegbarePflanzen.value.find(p => p.id === pflanze.id)
  if (backendPflanze && !meineLinien.value.some(p => p.id === backendPflanze.id)) {
    meineLinien.value.push(backendPflanze)
    speichereMeinePflanzen()
  }
}

function pflanzeEntfernen(id) {
  meineLinien.value = meineLinien.value.filter(p => p.id !== id)
  speichereMeinePflanzen()
}

onMounted(ladePflanzen)
</script>

<template>
  <main class="dashboard-seite">
    <div class="dashboard-kopf">
      <div>
        <h1 class="dashboard-titel">Mein Pflanzen-Dashboard</h1>
        <p class="dashboard-beschreibung">Verwalte deine Pflanzensammlung und füge neue Pflanzen aus unserem Katalog hinzu.</p>
      </div>
      <div class="kopf-aktionen">
        <RouterLink v-if="isAdmin" to="/admin" class="btn-admin">
          <span class="material-symbols-outlined">admin_panel_settings</span>
          <span>Admin-Bereich</span>
        </RouterLink>
        <button class="btn-hinzufuegen" @click="showAddModal = true">
          <span class="material-symbols-outlined">add</span>
          <span>Pflanze hinzufügen</span>
        </button>
      </div>
    </div>

    <!-- Meine Pflanzen Sektion -->
    <section class="meine-pflanzen">
      <div class="sektion-kopf">
        <h2>Meine Pflanzen</h2>
        <span class="count-badge">{{ meinePflanzen.length }}</span>
      </div>

      <div v-if="meinePflanzen.length === 0" class="leer-zustand">
        <span class="material-symbols-outlined leer-icon">local_florist</span>
        <h3>Noch keine Pflanzen hinzugefügt</h3>
        <p>Starten Sie, indem Sie Pflanzen aus unserem Katalog hinzufügen.</p>
      </div>

      <div v-else class="pflanzen-raster">
        <div v-for="pflanze in meinePflanzen" :key="pflanze.id" class="pflanze-wrapper">
          <PflanzenKarte :pflanze="pflanze" />
          <button
            class="btn-entfernen"
            @click="pflanzeEntfernen(pflanze.id)"
            :aria-label="`${pflanze.name} entfernen`"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Modal zum Hinzufügen von Pflanzen -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <div class="modal-kopf">
            <h2>Pflanze hinzufügen</h2>
            <button class="modal-schliessen" @click="showAddModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="modal-filter">
            <div class="such-wrapper">
              <span class="material-symbols-outlined">search</span>
              <input
                v-model="searchBegriff"
                type="search"
                placeholder="Pflanze suchen…"
                class="such-input"
              />
            </div>

            <div class="filter-group">
              <div class="filter-section">
                <span class="filter-label">Pflegestufe</span>
                <div class="filter-pillen">
                  <button
                    v-for="option in pflegeOptionen"
                    :key="option.wert"
                    class="filter-pille"
                    :class="{ aktiv: filterPflege === option.wert }"
                    @click="filterPflege = filterPflege === option.wert ? null : option.wert"
                  >{{ option.label }}</button>
                </div>
              </div>

              <div class="filter-section">
                <span class="filter-label">Lichtbedarf</span>
                <div class="filter-pillen">
                  <button
                    v-for="option in lichtOptionen"
                    :key="option.wert"
                    class="filter-pille"
                    :class="{ aktiv: filterLicht === option.wert }"
                    @click="filterLicht = filterLicht === option.wert ? null : option.wert"
                  >{{ option.label }}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-inhalt">
            <div v-if="loading" class="status-meldung">
              Pflanzen werden geladen…
            </div>

            <div v-else-if="error" class="status-meldung fehler">
              Fehler beim Laden: {{ error }}
            </div>

            <div v-else-if="gefiltertePflanzen.length === 0" class="status-meldung">
              Keine Pflanzen gefunden. Versuchen Sie die Filter zu ändern.
            </div>

            <div v-else class="katalog-raster">
              <div v-for="pflanze in gefiltertePflanzen" :key="pflanze.id" class="katalog-item">
                <div class="pflanze-preview">
                  <img :src="pflanze.bild" :alt="pflanze.name" />
                </div>
                <div class="pflanze-details">
                  <h3>{{ pflanze.name }}</h3>
                  <p class="latin-name">{{ pflanze.latinName }}</p>
                  <div class="pflanze-info">
                    <span class="badge pflege" :class="pflanze.pflegestufe">
                      {{ pflanze.pflegeLabel }}
                    </span>
                    <span class="badge licht">{{ lichtOptionen.find(l => l.wert === pflanze.licht)?.label }}</span>
                  </div>
                  <button
                    class="btn-add"
                    @click="pflanzeHinzufuegen(pflanze)"
                  >
                    <span class="material-symbols-outlined">add_circle</span>
                    Hinzufügen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
/* ── Dashboard Layout ── */
.dashboard-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: var(--max-breite);
  margin: 0 auto;
}

.dashboard-kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.dashboard-titel {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin-bottom: 0.5rem;
}

.dashboard-beschreibung {
  color: var(--text-gedimmt);
  font-weight: 300;
  max-width: 28rem;
}

/* ── Buttons ── */
.kopf-aktionen {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-admin {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-rund);
  background-color: var(--terrakotta);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
  white-space: nowrap;
}
.btn-admin:hover { background-color: #7a3020; }
.btn-admin .material-symbols-outlined { font-size: 1.125rem; }

.btn-hinzufuegen {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-rund);
  background-color: var(--gruen);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}
.btn-hinzufuegen:hover { background-color: var(--gruen-dunkel); }
.btn-hinzufuegen .material-symbols-outlined { font-size: 1.125rem; }

/* ── Meine Pflanzen Sektion ── */
.meine-pflanzen {
  margin-bottom: 4rem;
}

.sektion-kopf {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.sektion-kopf h2 {
  font-size: 1.75rem;
  color: var(--gruen-dunkel);
  margin: 0;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--terrakotta);
  color: #fff;
  font-weight: 600;
  font-size: 0.875rem;
}

/* ── Leerer Zustand ── */
.leer-zustand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--flaeche-hell);
  border-radius: var(--radius);
}

.leer-icon {
  font-size: 3.5rem;
  color: var(--gruen);
  margin-bottom: 1rem;
  opacity: 0.7;
}

.leer-zustand h3 {
  font-size: 1.25rem;
  color: var(--gruen-dunkel);
  margin-bottom: 0.5rem;
}

.leer-zustand p {
  color: var(--text-gedimmt);
  max-width: 25rem;
}

/* ── Pflanzen Raster ── */
.pflanzen-raster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.pflanze-wrapper {
  position: relative;
}

.btn-entfernen {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: rgba(186, 26, 26, 0.9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 10;
}

.pflanze-wrapper:hover .btn-entfernen {
  opacity: 1;
}

.btn-entfernen:hover {
  background-color: #ba1a1a;
}

.btn-entfernen .material-symbols-outlined { font-size: 1.125rem; }

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
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(62, 54, 49, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-kopf {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.modal-kopf h2 {
  font-size: 1.5rem;
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
  flex-shrink: 0;
}
.modal-schliessen:hover { background-color: var(--flaeche-dunkel); }
.modal-schliessen .material-symbols-outlined { font-size: 1.25rem; }

/* ── Modal Filter ── */
.modal-filter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--flaeche-dunkel);
  flex-shrink: 0;
}

.such-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
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

.filter-group {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gruen);
  letter-spacing: 0.1em;
}

.filter-pillen {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-pille {
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-rund);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-leise);
  background: var(--flaeche);
  border: none;
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;
}

.filter-pille:hover { background-color: var(--flaeche-dunkel); }
.filter-pille.aktiv { background-color: var(--terrakotta); color: #fff; }

/* ── Modal Inhalt ── */
.modal-inhalt {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.status-meldung {
  padding: 2rem;
  text-align: center;
  color: var(--text-gedimmt);
}

.status-meldung.fehler { color: #ba1a1a; }

.katalog-raster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding-bottom: 1rem;
}

.katalog-item {
  display: flex;
  flex-direction: column;
  background: var(--flaeche-hell);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.katalog-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(62, 54, 49, 0.1);
}

.pflanze-preview {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--flaeche);
}

.pflanze-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.katalog-item:hover .pflanze-preview img {
  transform: scale(1.05);
}

.pflanze-details {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pflanze-details h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.latin-name {
  font-family: var(--schrift-serif);
  font-style: italic;
  font-size: 0.75rem;
  color: var(--text-gedimmt);
  margin: 0;
}

.pflanze-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-rund);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.leicht  { background-color: #3a4711; color: #d9eaa3; }
.badge.mittel  { background-color: rgba(255, 181, 155, 0.2); color: var(--terrakotta); }
.badge.experte { background-color: #ffdad6; color: #ba1a1a; }

.badge.licht {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--gruen);
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-rund);
  background-color: var(--gruen);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-top: auto;
}

.btn-add:hover {
  background-color: var(--gruen-dunkel);
}

.btn-add .material-symbols-outlined { font-size: 0.95rem; }

/* ── Mobile ── */
@media (max-width: 640px) {
  .dashboard-kopf {
    flex-direction: column;
    align-items: flex-start;
  }

  .kopf-aktionen {
    width: 100%;
    flex-direction: column;
  }

  .btn-admin,
  .btn-hinzufuegen {
    width: 100%;
    justify-content: center;
  }

  .pflanzen-raster {
    grid-template-columns: 1fr;
  }

  .modal {
    padding: 1.5rem;
    max-width: 95vw;
  }

  .katalog-raster {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .filter-group {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
