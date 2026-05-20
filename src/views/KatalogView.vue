<script setup>
import { ref, onMounted, computed } from 'vue'
import PflanzenKarte from '@/components/PflanzenKarte.vue'

const pflegeOptionen = ['Anfänger', 'Fortgeschritten', 'Experte']
const aktivePflege = ref('Anfänger')

const lichtOptionen = ['Wenig Licht', 'Helles Indirekt']
const aktivesLicht = ref('Helles Indirekt')

const preisMax = ref(150)

const kategorien = ref([
  { id: 'aroids', label: 'Aroids', aktiv: false },
  { id: 'sukkulenten', label: 'Sukkulenten', aktiv: false },
  { id: 'farne', label: 'Farne', aktiv: false },
  { id: 'furz', label: 'furz', aktiv: false },

])

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
      preis: null,
    }
  })
)

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/api/plants')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    rawPlants.value = await response.json()
  } catch (err) {
    error.value = err.message
    console.error('Fehler beim Laden:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="katalog-seite">

    <aside class="katalog-sidebar">
      <div class="filter-kopf">
        <h2>Filter</h2>
        <span class="etikett">Auswahl verfeinern</span>
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
              :key="option"
              class="filter-pille"
              :class="{ aktiv: aktivePflege === option }"
              @click="aktivePflege = option"
            >{{ option }}</button>
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
              :key="option"
              class="filter-pille"
              :class="{ aktiv: aktivesLicht === option }"
              @click="aktivesLicht = option"
            >{{ option }}</button>
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
              <span>250 € +</span>
            </div>
          </div>
        </div>

        <div class="filter-abschnitt">
          <div class="filter-titel">
            <span class="material-symbols-outlined">potted_plant</span>
            <span>Kategorien</span>
          </div>
          <div class="kategorien-liste">
            <label v-for="kat in kategorien" :key="kat.id" class="kategorie-option">
              <input type="checkbox" v-model="kat.aktiv" />
              {{ kat.label }}
            </label>
          </div>
        </div>

      </nav>
    </aside>

    <section class="katalog-inhalt">

      <div class="katalog-kopf">
        <div>
          <h1 class="katalog-titel">Botanisches Archiv</h1>
          <p class="katalog-beschreibung">
            Entdecke seltene Exemplare und beliebte Klassiker, kategorisiert für dein Wohnumfeld.
          </p>
        </div>
        <div class="sortier-bereich">
          <span class="sortier-label">Sortieren nach:</span>
          <button class="sortier-button">
            Neueste Ankünfte
            <span class="material-symbols-outlined">expand_more</span>
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
  <PflanzenKarte v-for="pflanze in pflanzen" :key="pflanze.id" :pflanze="pflanze" />
</div>

      <div class="mehr-laden">
        <button class="btn-mehr">Weitere Exemplare laden</button>
      </div>

    </section>
  </main>
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

.kategorien-liste {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kategorie-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-leise);
  cursor: pointer;
  transition: color 0.2s;
}

.kategorie-option:hover { color: var(--gruen); }

.kategorie-option input[type="checkbox"] {
  accent-color: var(--terrakotta);
  width: 0.875rem;
  height: 0.875rem;
}

/* ── Katalog Inhalt ── */
.katalog-inhalt { flex: 1; min-width: 0; }

.katalog-kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

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

.sortier-bereich {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.sortier-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-gedimmt);
}

.sortier-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gruen);
  background-color: var(--flaeche);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-rund);
  transition: background-color 0.2s;
}

.sortier-button:hover { background-color: var(--flaeche-dunkel); }
.sortier-button .material-symbols-outlined { font-size: 1rem; }

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

/* ── Mehr laden ── */
.mehr-laden {
  display: flex;
  justify-content: center;
  margin-top: 4rem;
}

.btn-mehr {
  padding: 0.875rem 2.5rem;
  border-radius: var(--radius-rund);
  border: 1px solid var(--gruen);
  color: var(--gruen);
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.3s, color 0.3s;
}

.btn-mehr:hover { background-color: var(--gruen); color: #fff; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .katalog-sidebar { display: none; }
  .katalog-seite { padding-left: 1rem; padding-right: 1rem; }
}
</style>
