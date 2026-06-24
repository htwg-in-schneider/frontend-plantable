<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { communityApi, plantsApi } from '@/services/api'
import PflanzeFormular from '@/components/PflanzeFormular.vue'

const router = useRouter()
const { isAdmin } = useAuth()

if (!isAdmin.value) {
  router.push('/')
}

const activeTab = ref('pflanzen')

// ── PFLANZEN ────────────────────────────────────────────
const rawPlants = ref([])
const plantsLoading = ref(true)
const plantsError = ref(null)
const pflanzeSuche = ref('')
const pflanzeDeleting = ref(null)
const pflanzeSaving = ref(false)
const showPflanzeModal = ref(false)
const modalModus = ref('neu')
const editingId = ref(null)

const careLabels = { EASY: 'Pflegeleicht', MEDIUM: 'Mittel', HARD: 'Experte' }
const lichtLabels = { LOW: 'Wenig Licht', MEDIUM: 'Indirektes Licht', BRIGHT: 'Helles Indirekt', DIRECT: 'Direkte Sonne' }

const pflanzeForm = reactive({
  botanicalName: '', commonName: '', slug: '', description: '',
  mainImageUrl: '', careLevel: 'EASY', lightRequirement: 'MEDIUM',
  isPetFriendly: false, isAirPurifying: false, originRegion: '',
  price: '', tags: [],
  defaultWateringIntervalDays: null,
  defaultMistingIntervalDays: null,
  defaultFertilizingIntervalDays: null,
  defaultLeafCleaningIntervalDays: null,
  defaultRepottingIntervalDays: null,
  defaultPruningIntervalDays: null,
  defaultPestCheckIntervalDays: null,
})

const gefiltertePflanzen = computed(() => {
  const q = pflanzeSuche.value.toLowerCase().trim()
  if (!q) return rawPlants.value
  return rawPlants.value.filter(p =>
    p.commonName?.toLowerCase().includes(q) ||
    p.botanicalName?.toLowerCase().includes(q)
  )
})

async function ladePflanzen() {
  plantsLoading.value = true
  plantsError.value = null
  try {
    rawPlants.value = await plantsApi.getAll()
  } catch (err) {
    plantsError.value = err.message
  } finally {
    plantsLoading.value = false
  }
}

function oeffneNeuModal() {
  Object.assign(pflanzeForm, {
    botanicalName: '', commonName: '', slug: '', description: '',
    mainImageUrl: '', careLevel: 'EASY', lightRequirement: 'MEDIUM',
    isPetFriendly: false, isAirPurifying: false, originRegion: '', price: '', tags: [],
    defaultWateringIntervalDays: null, defaultMistingIntervalDays: null,
    defaultFertilizingIntervalDays: null, defaultLeafCleaningIntervalDays: null,
    defaultRepottingIntervalDays: null, defaultPruningIntervalDays: null,
    defaultPestCheckIntervalDays: null,
  })
  modalModus.value = 'neu'
  editingId.value = null
  showPflanzeModal.value = true
}

function oeffneEditModal(plant) {
  Object.assign(pflanzeForm, {
    botanicalName:    plant.botanicalName,
    commonName:       plant.commonName,
    slug:             plant.slug,
    description:      plant.description      ?? '',
    mainImageUrl:     plant.mainImageUrl      ?? '',
    careLevel:        plant.careLevel,
    lightRequirement: plant.lightRequirement,
    isPetFriendly:    plant.isPetFriendly,
    isAirPurifying:   plant.isAirPurifying,
    originRegion:     plant.originRegion      ?? '',
    price:            plant.price             ?? '',
    tags:             (plant.tags ?? []).map(t => t.name),
    defaultWateringIntervalDays:     plant.defaultWateringIntervalDays     ?? null,
    defaultMistingIntervalDays:      plant.defaultMistingIntervalDays      ?? null,
    defaultFertilizingIntervalDays:  plant.defaultFertilizingIntervalDays  ?? null,
    defaultLeafCleaningIntervalDays: plant.defaultLeafCleaningIntervalDays ?? null,
    defaultRepottingIntervalDays:    plant.defaultRepottingIntervalDays    ?? null,
    defaultPruningIntervalDays:      plant.defaultPruningIntervalDays      ?? null,
    defaultPestCheckIntervalDays:    plant.defaultPestCheckIntervalDays    ?? null,
  })
  modalModus.value = 'bearbeiten'
  editingId.value = plant.id
  showPflanzeModal.value = true
}

async function speicherePflanze() {
  pflanzeSaving.value = true
  const body = {
    ...pflanzeForm,
    price: pflanzeForm.price !== '' ? Number(pflanzeForm.price) : null,
    tags: pflanzeForm.tags.map(name => ({ name })),
  }
  try {
    const saved = modalModus.value === 'neu'
      ? await plantsApi.createPlant(body)
      : await plantsApi.updatePlant(editingId.value, body)
    if (modalModus.value === 'neu') {
      rawPlants.value.push(saved)
    } else {
      const idx = rawPlants.value.findIndex(p => p.id === editingId.value)
      if (idx >= 0) rawPlants.value[idx] = saved
    }
    showPflanzeModal.value = false
  } catch (err) {
    alert('Fehler beim Speichern: ' + err.message)
  } finally {
    pflanzeSaving.value = false
  }
}

async function loeschePflanze(id) {
  if (!confirm('Pflanze wirklich löschen?')) return
  pflanzeDeleting.value = id
  try {
    await plantsApi.deletePlant(id)
    rawPlants.value = rawPlants.value.filter(p => p.id !== id)
  } catch (err) {
    alert('Fehler beim Löschen: ' + err.message)
  } finally {
    pflanzeDeleting.value = null
  }
}

// ── COMMUNITY ────────────────────────────────────────────
const posts = ref([])
const postsLoading = ref(false)
const postsError = ref(null)
const postSuche = ref('')
const postDeleting = ref(null)

const gefilteertePostsAdmin = computed(() => {
  const q = postSuche.value.toLowerCase().trim()
  if (!q) return posts.value
  return posts.value.filter(p =>
    p.title?.toLowerCase().includes(q) ||
    p.author?.name?.toLowerCase().includes(q)
  )
})

async function ladePosts() {
  postsLoading.value = true
  postsError.value = null
  try {
    posts.value = await communityApi.getPosts()
  } catch (err) {
    postsError.value = err.message
  } finally {
    postsLoading.value = false
  }
}

async function loeschePost(id) {
  if (!confirm('Beitrag wirklich löschen?')) return
  postDeleting.value = id
  try {
    await communityApi.deletePost(id)
    posts.value = posts.value.filter(p => p.id !== id)
  } catch (err) {
    alert('Fehler beim Löschen: ' + err.message)
  } finally {
    postDeleting.value = null
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function onTabChange(tab) {
  activeTab.value = tab
  if (tab === 'pflanzen' && rawPlants.value.length === 0) ladePflanzen()
  if (tab === 'community' && posts.value.length === 0) ladePosts()
}

onMounted(ladePflanzen)
</script>

<template>
  <main class="admin-seite">
    <div class="admin-kopf">
      <div>
        <h1 class="admin-titel">Admin-Dashboard</h1>
        <p class="admin-beschreibung">Verwaltung von Shop-Einträgen und Community-Inhalten.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-leiste">
      <button
        class="tab-btn"
        :class="{ aktiv: activeTab === 'pflanzen' }"
        @click="onTabChange('pflanzen')"
      >
        <span class="material-symbols-outlined">local_florist</span>
        Shop-Einträge
      </button>
      <button
        class="tab-btn"
        :class="{ aktiv: activeTab === 'community' }"
        @click="onTabChange('community')"
      >
        <span class="material-symbols-outlined">forum</span>
        Community-Beiträge
      </button>
      <button
        class="tab-btn"
        :class="{ aktiv: activeTab === 'benutzer' }"
        @click="onTabChange('benutzer')"
      >
        <span class="material-symbols-outlined">group</span>
        Benutzer
      </button>
    </div>

    <!-- ── TAB: PFLANZEN ── -->
    <section v-if="activeTab === 'pflanzen'" class="tab-inhalt">
      <div class="tab-kopf">
        <div class="such-wrapper">
          <span class="material-symbols-outlined">search</span>
          <input v-model="pflanzeSuche" type="search" placeholder="Name oder lat. Name suchen…" class="such-input" />
        </div>
        <button class="btn-neu" @click="oeffneNeuModal">
          <span class="material-symbols-outlined">add</span>
          Neue Pflanze
        </button>
      </div>

      <div v-if="plantsLoading" class="status-meldung">Pflanzen werden geladen…</div>
      <div v-else-if="plantsError" class="status-meldung fehler">{{ plantsError }}</div>

      <div v-else class="liste">
        <div v-if="gefiltertePflanzen.length === 0" class="leer">Keine Einträge gefunden.</div>
        <div
          v-for="plant in gefiltertePflanzen"
          :key="plant.id"
          class="liste-zeile"
        >
          <img
            :src="plant.mainImageUrl"
            :alt="plant.commonName"
            class="liste-bild"
          />
          <div class="liste-info">
            <span class="liste-name">{{ plant.commonName }}</span>
            <span class="liste-latin">{{ plant.botanicalName }}</span>
          </div>
          <div class="liste-badges">
            <span class="badge badge-pflege">{{ careLabels[plant.careLevel] }}</span>
            <span class="badge badge-licht">{{ lichtLabels[plant.lightRequirement] }}</span>
          </div>
          <span class="liste-preis">
            {{ plant.price != null ? plant.price.toFixed(2).replace('.', ',') + ' €' : '—' }}
          </span>
          <div class="liste-aktionen">
            <button class="btn-aktion bearbeiten" @click="oeffneEditModal(plant)" title="Bearbeiten">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button
              class="btn-aktion loeschen"
              @click="loeschePflanze(plant.id)"
              :disabled="pflanzeDeleting === plant.id"
              title="Löschen"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── TAB: COMMUNITY ── -->
    <section v-else-if="activeTab === 'community'" class="tab-inhalt">
      <div class="tab-kopf">
        <div class="such-wrapper">
          <span class="material-symbols-outlined">search</span>
          <input v-model="postSuche" type="search" placeholder="Titel oder Autor suchen…" class="such-input" />
        </div>
        <span class="zaehler">{{ gefilteertePostsAdmin.length }} Beiträge</span>
      </div>

      <div v-if="postsLoading" class="status-meldung">Beiträge werden geladen…</div>
      <div v-else-if="postsError" class="status-meldung fehler">{{ postsError }}</div>

      <div v-else class="liste">
        <div v-if="gefilteertePostsAdmin.length === 0" class="leer">Keine Beiträge gefunden.</div>
        <div
          v-for="post in gefilteertePostsAdmin"
          :key="post.id"
          class="liste-zeile"
        >
          <div class="post-avatar">{{ post.author?.name?.[0]?.toUpperCase() || 'U' }}</div>
          <div class="liste-info">
            <span class="liste-name">{{ post.title }}</span>
            <span class="liste-latin">{{ post.author?.name || 'Anonym' }} · {{ formatDate(post.createdAt) }}</span>
          </div>
          <div class="liste-badges">
            <span v-for="tag in (post.tags ?? []).slice(0, 3)" :key="tag" class="badge badge-tag">{{ tag }}</span>
          </div>
          <span class="liste-preis">{{ post.comments?.length || 0 }} Komm.</span>
          <div class="liste-aktionen">
            <button
              class="btn-aktion loeschen"
              @click="loeschePost(post.id)"
              :disabled="postDeleting === post.id"
              title="Löschen"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── TAB: BENUTZER ── -->
    <section v-else-if="activeTab === 'benutzer'" class="tab-inhalt">
      <div class="placeholder">
        <span class="material-symbols-outlined placeholder-icon">group</span>
        <h3>Benutzerverwaltung</h3>
        <p>Wird implementiert sobald die Benutzer-Authentifizierung eingerichtet ist.</p>
      </div>
    </section>
  </main>

  <!-- ── PFLANZE MODAL ── -->
  <Teleport to="body">
    <div v-if="showPflanzeModal" class="modal-overlay" @click.self="showPflanzeModal = false">
      <div class="modal">
        <div class="modal-kopf">
          <h2>{{ modalModus === 'neu' ? 'Neue Pflanze anlegen' : 'Pflanze bearbeiten' }}</h2>
          <button class="modal-schliessen" @click="showPflanzeModal = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="speicherePflanze">
          <PflanzeFormular :form="pflanzeForm">
            <template #aktionen>
              <div class="form-aktionen">
                <button type="submit" class="btn-speichern" :disabled="pflanzeSaving">
                  {{ pflanzeSaving ? 'Speichere…' : (modalModus === 'neu' ? 'Anlegen' : 'Speichern') }}
                </button>
                <button type="button" class="btn-abbrechen" @click="showPflanzeModal = false">Abbrechen</button>
              </div>
            </template>
          </PflanzeFormular>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.admin-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: var(--max-breite);
  margin: 0 auto;
}

.admin-kopf {
  margin-bottom: 2rem;
}

.admin-titel {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin-bottom: 0.5rem;
}

.admin-beschreibung {
  color: var(--text-gedimmt);
  font-weight: 300;
}

/* ── Tabs ── */
.tab-leiste {
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid var(--flaeche-dunkel);
  margin-bottom: 2rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-gedimmt);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-btn .material-symbols-outlined { font-size: 1.1rem; }
.tab-btn:hover { color: var(--gruen); }
.tab-btn.aktiv { color: var(--gruen); border-bottom-color: var(--gruen); }

/* ── Tab-Inhalt ── */
.tab-inhalt { animation: fade-in 0.15s ease; }

@keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

.tab-kopf {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.such-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--flaeche);
  border-radius: var(--radius-rund);
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.such-wrapper:focus-within { border-color: var(--gruen); background-color: #fff; }
.such-wrapper .material-symbols-outlined { font-size: 1.1rem; color: var(--text-gedimmt); flex-shrink: 0; }

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

.btn-neu {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-rund);
  background-color: var(--gruen);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}
.btn-neu:hover { background-color: var(--gruen-dunkel); }
.btn-neu .material-symbols-outlined { font-size: 1rem; }

.zaehler {
  font-size: 0.8rem;
  color: var(--text-gedimmt);
  white-space: nowrap;
}

/* ── Liste ── */
.liste {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.leer {
  padding: 3rem;
  text-align: center;
  color: var(--text-gedimmt);
  background: var(--flaeche-hell);
  border-radius: var(--radius);
}

.liste-zeile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  transition: box-shadow 0.15s;
}

.liste-zeile:hover { box-shadow: 0 4px 12px rgba(62, 54, 49, 0.08); }

.liste-bild {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius);
  object-fit: cover;
  background: var(--flaeche);
  flex-shrink: 0;
}

.post-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--gruen);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.liste-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.liste-name {
  font-weight: 600;
  color: var(--gruen-dunkel);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.liste-latin {
  font-size: 0.75rem;
  color: var(--text-gedimmt);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.liste-badges {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-rund);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.badge-pflege { background-color: rgba(45, 71, 57, 0.1); color: var(--gruen); }
.badge-licht  { background-color: rgba(255, 181, 155, 0.15); color: var(--terrakotta); }
.badge-tag    { background-color: var(--flaeche); color: var(--text-leise); }

.liste-preis {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
  white-space: nowrap;
  min-width: 4rem;
  text-align: right;
  flex-shrink: 0;
}

.liste-aktionen {
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;
}

.btn-aktion {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius);
  border: 1px solid;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.btn-aktion .material-symbols-outlined { font-size: 1rem; }

.btn-aktion.bearbeiten { border-color: var(--gruen); color: var(--gruen); }
.btn-aktion.bearbeiten:hover { background-color: var(--gruen); color: #fff; }
.btn-aktion.loeschen { border-color: #ba1a1a; color: #ba1a1a; }
.btn-aktion.loeschen:hover:not(:disabled) { background-color: #ba1a1a; color: #fff; }
.btn-aktion.loeschen:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Status ── */
.status-meldung {
  padding: 3rem;
  text-align: center;
  color: var(--text-gedimmt);
  background: var(--flaeche-hell);
  border-radius: var(--radius);
}
.status-meldung.fehler { color: #ba1a1a; background: #ffdad6; }

/* ── Placeholder ── */
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  background: var(--flaeche-hell);
  border-radius: var(--radius);
  gap: 0.75rem;
}

.placeholder-icon { font-size: 3rem; color: var(--gruen); opacity: 0.5; }
.placeholder h3 { font-size: 1.25rem; color: var(--gruen-dunkel); margin: 0; }
.placeholder p { color: var(--text-gedimmt); max-width: 28rem; margin: 0; }

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
  max-width: 680px;
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

.modal-kopf h2 { font-size: 1.25rem; color: var(--gruen-dunkel); margin: 0; }

.modal-schliessen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-gedimmt);
  cursor: pointer;
  transition: background-color 0.2s;
}
.modal-schliessen:hover { background-color: var(--flaeche-dunkel); }
.modal-schliessen .material-symbols-outlined { font-size: 1.25rem; }

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

.btn-speichern { background-color: var(--gruen); color: #fff; border: none; }
.btn-speichern:hover:not(:disabled) { background-color: var(--gruen-dunkel); }
.btn-speichern:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-abbrechen { background: transparent; color: var(--text-leise); border: 1px solid var(--flaeche-dunkel); }
.btn-abbrechen:hover { background-color: var(--flaeche-dunkel); }

@media (max-width: 768px) {
  .admin-seite { padding-left: 1rem; padding-right: 1rem; }
  .form-grid { grid-template-columns: 1fr; }
  .liste-badges { display: none; }
  .tab-btn span.material-symbols-outlined { display: none; }
}
</style>
