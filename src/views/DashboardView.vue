<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { userPlantsApi, dashboardApi, plantsApi } from '@/services/api'

const { isAdmin, isAuthenticated, userId } = useAuth()

// ── Tabs ──────────────────────────────────────────────────────────────────────
const aktiverTab = ref('aufgaben') // 'aufgaben' | 'pflanzen'

// ── Dashboard-Daten ───────────────────────────────────────────────────────────
const meineUserPflanzen = ref([])
const pflegeaufgaben = ref({ OVERDUE: [], DUE: [], UPCOMING: [] })
const ladenDashboard = ref(false)

// Schlüssel "userPlantId-careType" für laufende Aktionen
const inBearbeitung = ref(new Set())

// ── Add-Modal ─────────────────────────────────────────────────────────────────
const showAddModal = ref(false)
const verfuegbarePflanzen = ref([])
const ladenKatalog = ref(false)
const katalogFehler = ref(null)
const searchBegriff = ref('')
const filterPflege = ref(null)
const filterLicht = ref(null)
const hinzufuegenId = ref(null)
const ausgewaehltePflanzeId = ref(null)
const neuerSpitzname = ref('')

// ── Statische Metadaten ───────────────────────────────────────────────────────
const careTypeInfo = {
  WATERING:      { label: 'Gießen',             icon: 'water_drop' },
  MISTING:       { label: 'Besprühen',           icon: 'air' },
  FERTILIZING:   { label: 'Düngen',              icon: 'eco' },
  LEAF_CLEANING: { label: 'Blätter reinigen',    icon: 'mop' },
  REPOTTING:     { label: 'Umtopfen',            icon: 'yard' },
  PRUNING:       { label: 'Zurückschneiden',     icon: 'content_cut' },
  PEST_CHECK:    { label: 'Schädlingskontrolle', icon: 'pest_control' },
}

const careMap = {
  EASY:   { stufe: 'leicht',  label: 'Pflegeleicht' },
  MEDIUM: { stufe: 'mittel',  label: 'Mittel' },
  HARD:   { stufe: 'experte', label: 'Experte' },
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

// ── Computed ──────────────────────────────────────────────────────────────────
const ueberfaelligCount = computed(() => pflegeaufgaben.value.OVERDUE?.length ?? 0)
const heuteCount = computed(() => pflegeaufgaben.value.DUE?.length ?? 0)
const demnachstCount = computed(() => pflegeaufgaben.value.UPCOMING?.length ?? 0)

const hatAufgaben = computed(() =>
  ueberfaelligCount.value + heuteCount.value + demnachstCount.value > 0
)

const gefiltertePflanzen = computed(() => {
  let result = verfuegbarePflanzen.value.map(p => ({
    id: p.id,
    name: p.commonName,
    latinName: p.botanicalName,
    bild: p.mainImageUrl,
    pflegestufe: (careMap[p.careLevel] ?? careMap.EASY).stufe,
    pflegeLabel: (careMap[p.careLevel] ?? careMap.EASY).label,
    licht: p.lightRequirement,
  }))

  const q = searchBegriff.value.toLowerCase().trim()
  if (q) result = result.filter(p =>
    p.name.toLowerCase().includes(q) || p.latinName.toLowerCase().includes(q)
  )
  if (filterPflege.value) result = result.filter(p => p.pflegestufe === filterPflege.value)
  if (filterLicht.value) result = result.filter(p => p.licht === filterLicht.value)
  return result
})

// ── API-Funktionen ────────────────────────────────────────────────────────────
async function ladeDashboard() {
  if (!isAuthenticated.value || !userId.value) return
  ladenDashboard.value = true
  try {
    const [pflanzen, aufgaben] = await Promise.all([
      userPlantsApi.getMyPlants(),
      dashboardApi.getCareItems(),
    ])
    meineUserPflanzen.value = pflanzen
    pflegeaufgaben.value = aufgaben
  } catch (err) {
    console.error('Dashboard-Ladefehler:', err)
  } finally {
    ladenDashboard.value = false
  }
}

async function ladeKatalog() {
  ladenKatalog.value = true
  katalogFehler.value = null
  try {
    verfuegbarePflanzen.value = await plantsApi.getAll()
  } catch (err) {
    katalogFehler.value = err.message
  } finally {
    ladenKatalog.value = false
  }
}

function waehleAus(pflanze) {
  if (ausgewaehltePflanzeId.value === pflanze.id) {
    ausgewaehltePflanzeId.value = null
    neuerSpitzname.value = ''
  } else {
    ausgewaehltePflanzeId.value = pflanze.id
    neuerSpitzname.value = ''
  }
}

async function pflanzeHinzufuegen(pflanze) {
  hinzufuegenId.value = pflanze.id
  try {
    await userPlantsApi.add(pflanze.id, neuerSpitzname.value || null)
    await ladeDashboard()
    showAddModal.value = false
    aktiverTab.value = 'pflanzen'
  } catch (err) {
    console.error('Fehler beim Hinzufügen:', err)
  } finally {
    hinzufuegenId.value = null
  }
}

async function pflanzeEntfernen(userPlantId) {
  try {
    await userPlantsApi.delete(userPlantId)
    meineUserPflanzen.value = meineUserPflanzen.value.filter(up => up.id !== userPlantId)
    pflegeaufgaben.value = await dashboardApi.getCareItems()
  } catch (err) {
    console.error('Fehler beim Entfernen:', err)
  }
}

async function aufgabeErledigen(userPlantId, careType, action) {
  const key = `${userPlantId}-${careType}`
  inBearbeitung.value = new Set([...inBearbeitung.value, key])
  try {
    await userPlantsApi.logCare(userPlantId, careType, action)
    pflegeaufgaben.value = await dashboardApi.getCareItems()
  } catch (err) {
    console.error('Fehler beim Abhaken:', err)
  } finally {
    const neu = new Set(inBearbeitung.value)
    neu.delete(key)
    inBearbeitung.value = neu
  }
}

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────
function formatFaellig(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  const heute = new Date()
  heute.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diff = Math.round((date - heute) / 86400000)
  if (diff === 0) return 'Heute'
  if (diff === 1) return 'Morgen'
  if (diff === -1) return 'Gestern'
  if (diff < -1) return `Vor ${Math.abs(diff)} Tagen`
  if (diff <= 7) return `In ${diff} Tagen`
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })
}

function formatSeit(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function lichtLabel(wert) {
  return lichtOptionen.find(l => l.wert === wert)?.label ?? wert
}

watch(userId, (id) => {
  if (id) ladeDashboard()
})

watch(showAddModal, (val) => {
  if (!val) {
    ausgewaehltePflanzeId.value = null
    neuerSpitzname.value = ''
  }
})

onMounted(() => {
  ladeDashboard()
  ladeKatalog()
})
</script>

<template>
  <main class="dashboard-seite">

    <!-- ── Nicht eingeloggt ──────────────────────────────────────────────── -->
    <div v-if="!isAuthenticated" class="leer-zustand">
      <span class="material-symbols-outlined leer-icon">lock</span>
      <h3>Anmeldung erforderlich</h3>
      <p>Melde dich an, um dein persönliches Pflanzen-Dashboard zu nutzen.</p>
    </div>

    <template v-else>
      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <div class="dashboard-kopf">
        <div>
          <h1 class="dashboard-titel">Mein Dashboard</h1>
          <p class="dashboard-beschreibung">Verwalte deine Pflanzen und behalte die Pflege im Blick.</p>
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

      <!-- ── Tabs ────────────────────────────────────────────────────────── -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ aktiv: aktiverTab === 'aufgaben' }"
          @click="aktiverTab = 'aufgaben'"
        >
          <span class="material-symbols-outlined">task_alt</span>
          Pflegeaufgaben
          <span v-if="ueberfaelligCount > 0" class="tab-badge ueberfaellig">{{ ueberfaelligCount }}</span>
          <span v-else-if="heuteCount > 0" class="tab-badge heute">{{ heuteCount }}</span>
        </button>
        <button
          class="tab"
          :class="{ aktiv: aktiverTab === 'pflanzen' }"
          @click="aktiverTab = 'pflanzen'"
        >
          <span class="material-symbols-outlined">local_florist</span>
          Meine Pflanzen
          <span class="tab-badge neutral">{{ meineUserPflanzen.length }}</span>
        </button>
      </div>

      <!-- ── Pflegeaufgaben-Tab ───────────────────────────────────────────── -->
      <section v-if="aktiverTab === 'aufgaben'" class="tab-inhalt">

        <div v-if="ladenDashboard" class="status-meldung">
          Aufgaben werden geladen…
        </div>

        <template v-else-if="meineUserPflanzen.length === 0">
          <div class="leer-zustand">
            <span class="material-symbols-outlined leer-icon">local_florist</span>
            <h3>Noch keine Pflanzen</h3>
            <p>Füge Pflanzen aus dem Katalog hinzu, damit hier deine Pflegeaufgaben erscheinen.</p>
            <button class="btn-hinzufuegen" @click="showAddModal = true">
              <span class="material-symbols-outlined">add</span>
              Erste Pflanze hinzufügen
            </button>
          </div>
        </template>

        <template v-else-if="!hatAufgaben">
          <div class="leer-zustand">
            <span class="material-symbols-outlined leer-icon" style="color: var(--gruen)">check_circle</span>
            <h3>Alles erledigt!</h3>
            <p>Aktuell gibt es keine fälligen Pflegeaufgaben.</p>
          </div>
        </template>

        <template v-else>
          <!-- OVERDUE -->
          <div v-if="pflegeaufgaben.OVERDUE?.length > 0" class="aufgaben-gruppe">
            <div class="gruppe-kopf ueberfaellig-kopf">
              <span class="material-symbols-outlined">warning</span>
              <h2>Überfällig</h2>
              <span class="gruppe-count">{{ pflegeaufgaben.OVERDUE.length }}</span>
            </div>
            <div class="aufgaben-liste">
              <div
                v-for="item in pflegeaufgaben.OVERDUE"
                :key="`${item.userPlantId}-${item.type}`"
                class="aufgaben-karte ueberfaellig-karte"
              >
                <img
                  :src="item.plantImageUrl"
                  :alt="item.plantCommonName"
                  class="aufgabe-bild"
                />
                <div class="aufgabe-info">
                  <div class="aufgabe-pflanze">
                    {{ item.plantCommonName }}
                    <span v-if="item.nickname" class="spitzname">„{{ item.nickname }}"</span>
                  </div>
                  <div class="aufgabe-typ">
                    <span class="material-symbols-outlined typ-icon">{{ careTypeInfo[item.type]?.icon }}</span>
                    {{ careTypeInfo[item.type]?.label }}
                    <span class="faellig-label ueberfaellig-label">{{ formatFaellig(item.dueDate) }}</span>
                  </div>
                </div>
                <div class="aufgabe-aktionen">
                  <button
                    class="btn-erledigt"
                    :disabled="inBearbeitung.has(`${item.userPlantId}-${item.type}`)"
                    @click="aufgabeErledigen(item.userPlantId, item.type, 'DONE')"
                  >
                    <span class="material-symbols-outlined">check</span>
                    Erledigt
                  </button>
                  <button
                    v-if="item.category === 'REMINDER'"
                    class="btn-ueberspringen"
                    :disabled="inBearbeitung.has(`${item.userPlantId}-${item.type}`)"
                    @click="aufgabeErledigen(item.userPlantId, item.type, 'SKIPPED')"
                  >
                    <span class="material-symbols-outlined">skip_next</span>
                    Überspringen
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- DUE TODAY -->
          <div v-if="pflegeaufgaben.DUE?.length > 0" class="aufgaben-gruppe">
            <div class="gruppe-kopf heute-kopf">
              <span class="material-symbols-outlined">today</span>
              <h2>Heute fällig</h2>
              <span class="gruppe-count">{{ pflegeaufgaben.DUE.length }}</span>
            </div>
            <div class="aufgaben-liste">
              <div
                v-for="item in pflegeaufgaben.DUE"
                :key="`${item.userPlantId}-${item.type}`"
                class="aufgaben-karte heute-karte"
              >
                <img
                  :src="item.plantImageUrl"
                  :alt="item.plantCommonName"
                  class="aufgabe-bild"
                />
                <div class="aufgabe-info">
                  <div class="aufgabe-pflanze">
                    {{ item.plantCommonName }}
                    <span v-if="item.nickname" class="spitzname">„{{ item.nickname }}"</span>
                  </div>
                  <div class="aufgabe-typ">
                    <span class="material-symbols-outlined typ-icon">{{ careTypeInfo[item.type]?.icon }}</span>
                    {{ careTypeInfo[item.type]?.label }}
                    <span class="faellig-label heute-label">Heute</span>
                  </div>
                </div>
                <div class="aufgabe-aktionen">
                  <button
                    class="btn-erledigt"
                    :disabled="inBearbeitung.has(`${item.userPlantId}-${item.type}`)"
                    @click="aufgabeErledigen(item.userPlantId, item.type, 'DONE')"
                  >
                    <span class="material-symbols-outlined">check</span>
                    Erledigt
                  </button>
                  <button
                    v-if="item.category === 'REMINDER'"
                    class="btn-ueberspringen"
                    :disabled="inBearbeitung.has(`${item.userPlantId}-${item.type}`)"
                    @click="aufgabeErledigen(item.userPlantId, item.type, 'SKIPPED')"
                  >
                    <span class="material-symbols-outlined">skip_next</span>
                    Überspringen
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- UPCOMING -->
          <div v-if="pflegeaufgaben.UPCOMING?.length > 0" class="aufgaben-gruppe">
            <div class="gruppe-kopf upcoming-kopf">
              <span class="material-symbols-outlined">schedule</span>
              <h2>Demnächst</h2>
              <span class="gruppe-count">{{ pflegeaufgaben.UPCOMING.length }}</span>
            </div>
            <div class="aufgaben-liste">
              <div
                v-for="item in pflegeaufgaben.UPCOMING"
                :key="`${item.userPlantId}-${item.type}`"
                class="aufgaben-karte upcoming-karte"
              >
                <img
                  :src="item.plantImageUrl"
                  :alt="item.plantCommonName"
                  class="aufgabe-bild"
                />
                <div class="aufgabe-info">
                  <div class="aufgabe-pflanze">
                    {{ item.plantCommonName }}
                    <span v-if="item.nickname" class="spitzname">„{{ item.nickname }}"</span>
                  </div>
                  <div class="aufgabe-typ">
                    <span class="material-symbols-outlined typ-icon">{{ careTypeInfo[item.type]?.icon }}</span>
                    {{ careTypeInfo[item.type]?.label }}
                    <span class="faellig-label upcoming-label">{{ formatFaellig(item.dueDate) }}</span>
                  </div>
                </div>
                <div class="aufgabe-aktionen">
                  <button
                    class="btn-erledigt btn-klein"
                    :disabled="inBearbeitung.has(`${item.userPlantId}-${item.type}`)"
                    @click="aufgabeErledigen(item.userPlantId, item.type, 'DONE')"
                  >
                    <span class="material-symbols-outlined">check</span>
                    Erledigt
                  </button>
                  <button
                    v-if="item.category === 'REMINDER'"
                    class="btn-ueberspringen btn-klein"
                    :disabled="inBearbeitung.has(`${item.userPlantId}-${item.type}`)"
                    @click="aufgabeErledigen(item.userPlantId, item.type, 'SKIPPED')"
                  >
                    <span class="material-symbols-outlined">skip_next</span>
                    Überspringen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- ── Meine-Pflanzen-Tab ──────────────────────────────────────────── -->
      <section v-else-if="aktiverTab === 'pflanzen'" class="tab-inhalt">

        <div v-if="ladenDashboard" class="status-meldung">
          Pflanzen werden geladen…
        </div>

        <div v-else-if="meineUserPflanzen.length === 0" class="leer-zustand">
          <span class="material-symbols-outlined leer-icon">local_florist</span>
          <h3>Noch keine Pflanzen hinzugefügt</h3>
          <p>Starte deine Sammlung, indem du Pflanzen aus dem Katalog hinzufügst.</p>
          <button class="btn-hinzufuegen" @click="showAddModal = true">
            <span class="material-symbols-outlined">add</span>
            Erste Pflanze hinzufügen
          </button>
        </div>

        <div v-else class="pflanzen-raster">
          <div
            v-for="up in meineUserPflanzen"
            :key="up.id"
            class="up-karte"
          >
            <div class="up-bild-wrapper">
              <img
                :src="up.plant?.mainImageUrl"
                :alt="up.plant?.commonName"
                class="up-bild"
              />
            </div>
            <div class="up-info">
              <h3 class="up-name">{{ up.plant?.commonName }}</h3>
              <p v-if="up.nickname" class="up-spitzname">„{{ up.nickname }}"</p>
              <p class="up-seit">Seit {{ formatSeit(up.acquiredAt) }}</p>
              <div class="up-intervalle">
                <span class="intervall-chip">
                  <span class="material-symbols-outlined">water_drop</span>
                  {{ up.wateringIntervalDays }}d
                </span>
                <span v-if="up.fertilizingIntervalDays" class="intervall-chip">
                  <span class="material-symbols-outlined">eco</span>
                  {{ up.fertilizingIntervalDays }}d
                </span>
                <span v-if="up.repottingIntervalDays" class="intervall-chip">
                  <span class="material-symbols-outlined">yard</span>
                  {{ up.repottingIntervalDays }}d
                </span>
              </div>
            </div>
            <button
              class="up-entfernen"
              :aria-label="`${up.plant?.commonName} entfernen`"
              @click="pflanzeEntfernen(up.id)"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </section>
    </template>

    <!-- ── Add-Modal ──────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <div class="modal-kopf">
            <h2>Pflanze hinzufügen</h2>
            <button class="modal-schliessen" @click="showAddModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Filter -->
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

          <!-- Pflanzenliste -->
          <div class="modal-inhalt">
            <div v-if="ladenKatalog" class="status-meldung">Katalog wird geladen…</div>
            <div v-else-if="katalogFehler" class="status-meldung fehler">Fehler: {{ katalogFehler }}</div>
            <div v-else-if="gefiltertePflanzen.length === 0" class="status-meldung">
              Keine Pflanzen gefunden. Alle Pflanzen sind bereits in deinem Dashboard.
            </div>
            <div v-else class="katalog-raster">
              <div
                v-for="pflanze in gefiltertePflanzen"
                :key="pflanze.id"
                class="katalog-item"
              >
                <div class="pflanze-preview">
                  <img :src="pflanze.bild" :alt="pflanze.name" />
                </div>
                <div class="pflanze-details">
                  <h3>{{ pflanze.name }}</h3>
                  <p class="latin-name">{{ pflanze.latinName }}</p>
                  <div class="pflanze-info">
                    <span class="badge pflege" :class="pflanze.pflegestufe">{{ pflanze.pflegeLabel }}</span>
                    <span class="badge licht">{{ lichtLabel(pflanze.licht) }}</span>
                  </div>
                  <div v-if="ausgewaehltePflanzeId === pflanze.id" class="spitzname-eingabe">
                    <input
                      v-model="neuerSpitzname"
                      type="text"
                      placeholder="Spitzname (optional)"
                      class="spitzname-input"
                      @keydown.enter.prevent="pflanzeHinzufuegen(pflanze)"
                      @keydown.escape="ausgewaehltePflanzeId = null"
                    />
                    <div class="spitzname-aktionen">
                      <button
                        class="btn-bestaetigen"
                        :disabled="hinzufuegenId === pflanze.id"
                        @click="pflanzeHinzufuegen(pflanze)"
                      >
                        <span class="material-symbols-outlined">
                          {{ hinzufuegenId === pflanze.id ? 'hourglass_empty' : 'check' }}
                        </span>
                        {{ hinzufuegenId === pflanze.id ? 'Lädt…' : 'Bestätigen' }}
                      </button>
                      <button class="btn-abbruch-klein" @click="ausgewaehltePflanzeId = null">
                        <span class="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </div>
                  <button
                    v-else
                    class="btn-add"
                    @click="waehleAus(pflanze)"
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
/* ── Layout ────────────────────────────────────────────────────────────────── */
.dashboard-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: var(--max-breite);
  margin: 0 auto;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.dashboard-kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 2.5rem;
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

/* ── Tabs ──────────────────────────────────────────────────────────────────── */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--flaeche-dunkel);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-gedimmt);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
  cursor: pointer;
  white-space: nowrap;
}
.tab:hover { color: var(--gruen-dunkel); }
.tab.aktiv {
  color: var(--gruen-dunkel);
  border-bottom-color: var(--gruen);
  font-weight: 600;
}
.tab .material-symbols-outlined { font-size: 1.125rem; }

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.tab-badge.ueberfaellig { background: #ffdad6; color: #ba1a1a; }
.tab-badge.heute        { background: rgba(149, 72, 43, 0.15); color: var(--terrakotta); }
.tab-badge.neutral      { background: var(--flaeche-dunkel); color: var(--text-gedimmt); }

/* ── Tab-Inhalt ────────────────────────────────────────────────────────────── */
.tab-inhalt { min-height: 20rem; }

/* ── Status ────────────────────────────────────────────────────────────────── */
.status-meldung {
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-gedimmt);
}
.status-meldung.fehler { color: #ba1a1a; }

/* ── Leer-Zustand ──────────────────────────────────────────────────────────── */
.leer-zustand {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--flaeche);
  border-radius: var(--radius);
  gap: 0.75rem;
}
.leer-icon {
  font-size: 3rem;
  color: var(--gruen);
  opacity: 0.7;
}
.leer-zustand h3 { font-size: 1.25rem; color: var(--gruen-dunkel); margin: 0; }
.leer-zustand p  { color: var(--text-gedimmt); max-width: 24rem; margin: 0; }

/* ── Aufgaben-Gruppen ──────────────────────────────────────────────────────── */
.aufgaben-gruppe { margin-bottom: 2.5rem; }

.gruppe-kopf {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.625rem 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
}
.gruppe-kopf h2 { font-size: 1rem; font-weight: 700; margin: 0; }
.gruppe-count {
  margin-left: auto;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.ueberfaellig-kopf { background: #fff0ee; color: #ba1a1a; }
.ueberfaellig-kopf .gruppe-count { background: #ffdad6; color: #ba1a1a; }

.heute-kopf { background: rgba(149, 72, 43, 0.08); color: var(--terrakotta); }
.heute-kopf .gruppe-count { background: rgba(149, 72, 43, 0.15); color: var(--terrakotta); }

.upcoming-kopf { background: rgba(45, 71, 57, 0.06); color: var(--gruen); }
.upcoming-kopf .gruppe-count { background: rgba(45, 71, 57, 0.12); color: var(--gruen); }

/* ── Aufgaben-Karten ───────────────────────────────────────────────────────── */
.aufgaben-liste {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.aufgaben-karte {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius);
  border: 1px solid transparent;
  transition: box-shadow 0.2s;
}
.aufgaben-karte:hover { box-shadow: 0 4px 16px rgba(62, 54, 49, 0.08); }

.ueberfaellig-karte { background: #fff8f7; border-color: #ffdad6; }
.heute-karte        { background: rgba(149, 72, 43, 0.04); border-color: rgba(149, 72, 43, 0.2); }
.upcoming-karte     { background: var(--flaeche); border-color: transparent; }

.aufgabe-bild {
  width: 3.5rem;
  height: 3.5rem;
  object-fit: cover;
  border-radius: calc(var(--radius) * 0.5);
  flex-shrink: 0;
}

.aufgabe-info {
  flex: 1;
  min-width: 0;
}

.aufgabe-pflanze {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--gruen-dunkel);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.spitzname {
  font-weight: 400;
  font-style: italic;
  color: var(--text-gedimmt);
  font-size: 0.875rem;
}

.aufgabe-typ {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-gedimmt);
  margin-top: 0.25rem;
}
.typ-icon { font-size: 1rem; }

.faellig-label {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
.ueberfaellig-label { background: #ffdad6; color: #ba1a1a; }
.heute-label        { background: rgba(149, 72, 43, 0.15); color: var(--terrakotta); }
.upcoming-label     { background: rgba(45, 71, 57, 0.1); color: var(--gruen); }

/* ── Aufgaben-Buttons ──────────────────────────────────────────────────────── */
.aufgabe-aktionen {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-erledigt,
.btn-ueberspringen {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-rund);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background-color 0.2s, opacity 0.2s;
  white-space: nowrap;
}
.btn-erledigt:disabled,
.btn-ueberspringen:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-erledigt .material-symbols-outlined,
.btn-ueberspringen .material-symbols-outlined { font-size: 1rem; }

.btn-erledigt {
  background-color: var(--gruen);
  color: #fff;
}
.btn-erledigt:not(:disabled):hover { background-color: var(--gruen-dunkel); }

.btn-ueberspringen {
  background-color: var(--flaeche);
  color: var(--text-gedimmt);
}
.btn-ueberspringen:not(:disabled):hover { background-color: var(--flaeche-dunkel); }

.btn-klein {
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
}

/* ── Meine-Pflanzen-Raster ─────────────────────────────────────────────────── */
.pflanzen-raster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.up-karte {
  position: relative;
  background: var(--flaeche);
  border-radius: var(--radius);
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.up-karte:hover { box-shadow: 0 8px 24px rgba(62, 54, 49, 0.1); }

.up-bild-wrapper {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--flaeche-dunkel);
}
.up-bild {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.up-karte:hover .up-bild { transform: scale(1.04); }

.up-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.up-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin: 0;
}
.up-spitzname {
  font-style: italic;
  color: var(--text-gedimmt);
  font-size: 0.875rem;
  margin: 0;
}
.up-seit {
  font-size: 0.75rem;
  color: var(--text-leise);
  margin: 0;
}

.up-intervalle {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}
.intervall-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background: var(--flaeche-dunkel);
  color: var(--gruen);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}
.intervall-chip .material-symbols-outlined { font-size: 0.875rem; }

.up-entfernen {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(186, 26, 26, 0.85);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.up-karte:hover .up-entfernen { opacity: 1; }
.up-entfernen:hover { background: #ba1a1a; }
.up-entfernen .material-symbols-outlined { font-size: 1.125rem; }

/* ── Modal ─────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
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
.modal-kopf h2 { font-size: 1.5rem; color: var(--gruen-dunkel); margin: 0; }

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
  background: var(--flaeche);
  border-radius: var(--radius-rund);
  border: 1px solid transparent;
  transition: border-color 0.2s;
}
.such-wrapper:focus-within { border-color: var(--gruen); background: #fff; }
.such-wrapper .material-symbols-outlined { font-size: 1.125rem; color: var(--text-gedimmt); }

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

.filter-group { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.filter-section { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gruen);
  letter-spacing: 0.1em;
}
.filter-pillen { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-pille {
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-rund);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-leise);
  background: var(--flaeche);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.filter-pille:hover { background-color: var(--flaeche-dunkel); }
.filter-pille.aktiv { background-color: var(--terrakotta); color: #fff; }

.modal-inhalt { flex: 1; overflow-y: auto; min-height: 0; }

.katalog-raster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding-bottom: 1rem;
}

.katalog-item {
  display: flex;
  flex-direction: column;
  background: var(--flaeche);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.katalog-item:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(62, 54, 49, 0.1); }

.pflanze-preview { aspect-ratio: 4/3; overflow: hidden; background: var(--flaeche-dunkel); }
.pflanze-preview img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.katalog-item:hover .pflanze-preview img { transform: scale(1.05); }

.pflanze-details { padding: 1rem; display: flex; flex-direction: column; gap: 0.625rem; }
.pflanze-details h3 {
  font-size: 0.9375rem;
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

.pflanze-info { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-rund);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.badge.leicht  { background: #3a4711; color: #d9eaa3; }
.badge.mittel  { background: rgba(255, 181, 155, 0.2); color: var(--terrakotta); }
.badge.experte { background: #ffdad6; color: #ba1a1a; }
.badge.licht   { background: rgba(76, 175, 80, 0.1); color: var(--gruen); }

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-rund);
  background: var(--gruen);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background-color 0.2s, opacity 0.2s;
  margin-top: auto;
}
.btn-add:not(:disabled):hover { background: var(--gruen-dunkel); }
.btn-add:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-add .material-symbols-outlined { font-size: 1rem; }

/* ── Spitzname-Eingabe ─────────────────────────────────────────────────────── */
.spitzname-eingabe {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
}

.spitzname-input {
  width: 100%;
  padding: 0.4rem 0.625rem;
  border: 1px solid var(--gruen);
  border-radius: var(--radius);
  font-size: 0.8125rem;
  font-family: inherit;
  outline: none;
  background: #fff;
  color: var(--gruen-dunkel);
}
.spitzname-input::placeholder { color: var(--text-gedimmt); }

.spitzname-aktionen {
  display: flex;
  gap: 0.375rem;
}

.btn-bestaetigen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.4rem 0.5rem;
  border-radius: var(--radius-rund);
  background: var(--gruen);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 0.2s, opacity 0.2s;
}
.btn-bestaetigen:not(:disabled):hover { background: var(--gruen-dunkel); }
.btn-bestaetigen:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-bestaetigen .material-symbols-outlined { font-size: 0.9rem; }

.btn-abbruch-klein {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius);
  border: 1px solid var(--flaeche-dunkel);
  color: var(--text-gedimmt);
  background: transparent;
  flex-shrink: 0;
  transition: background-color 0.15s;
}
.btn-abbruch-klein:hover { background: var(--flaeche-dunkel); }
.btn-abbruch-klein .material-symbols-outlined { font-size: 1rem; }

/* ── Mobile ────────────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .dashboard-seite { padding-left: 1rem; padding-right: 1rem; }
  .dashboard-kopf { flex-direction: column; align-items: flex-start; }
  .kopf-aktionen { width: 100%; flex-direction: column; }
  .btn-admin, .btn-hinzufuegen { width: 100%; justify-content: center; }
  .tabs { overflow-x: auto; }
  .tab { padding: 0.75rem 1rem; font-size: 0.875rem; }

  .aufgaben-karte {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .aufgabe-aktionen {
    width: 100%;
    justify-content: flex-end;
  }
  .pflanzen-raster { grid-template-columns: 1fr; }
  .modal { padding: 1.25rem; max-width: 95vw; }
  .katalog-raster { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
  .filter-group { flex-direction: column; gap: 1rem; }
}
</style>
