<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import PostCard from '@/components/PostCard.vue'
import CreatePostModal from '@/components/CreatePostModal.vue'
import { communityApi } from '@/services/api'

const router = useRouter()
const { isAuthenticated, userId } = useAuth()

const posts = ref([])
const loading = ref(true)
const error = ref(null)
const showCreateModal = ref(false)
const searchQuery = ref('')
const selectedTag = ref(null)

const filteredPosts = computed(() => {
  let result = posts.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    )
  }

  if (selectedTag.value) {
    result = result.filter(p => p.tags.includes(selectedTag.value))
  }

  return result
})

const allTags = computed(() => {
  const tagSet = new Set()
  posts.value.forEach(p => {
    p.tags?.forEach(tag => tagSet.add(tag))
  })
  return [...tagSet].sort()
})

async function loadPosts() {
  loading.value = true
  error.value = null
  try {
    posts.value = await communityApi.getPosts()
  } catch (err) {
    error.value = 'Fehler beim Laden der Posts: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

function handlePostCreated(newPost) {
  posts.value.unshift(newPost)
  showCreateModal.value = false
}

function handlePostDeleted(postId) {
  posts.value = posts.value.filter(p => p.id !== postId)
}

onMounted(loadPosts)
</script>

<template>
  <main class="community-seite">
    <div class="community-kopf">
      <div>
        <h1 class="community-titel">Community</h1>
        <p class="community-beschreibung">Teile deine Pflanzen-Tipps und lerne von anderen Liebhabern.</p>
      </div>
      <button v-if="userId" class="btn-neu-post" @click="showCreateModal = true">
        <span class="material-symbols-outlined">add</span>
        <span>Beitrag erstellen</span>
      </button>
      <div v-else class="nicht-angemeldet">
        Melden Sie sich an, um Beiträge zu erstellen
      </div>
    </div>

    <div class="community-filter">
      <div class="such-wrapper">
        <span class="material-symbols-outlined">search</span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Beiträge durchsuchen…"
          class="such-input"
        />
      </div>

      <div class="tag-filter">
        <button
          :class="{ aktiv: !selectedTag }"
          @click="selectedTag = null"
          class="tag-btn"
        >
          Alle
        </button>
        <button
          v-for="tag in allTags"
          :key="tag"
          :class="{ aktiv: selectedTag === tag }"
          @click="selectedTag = selectedTag === tag ? null : tag"
          class="tag-btn"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="status-meldung">
      Beiträge werden geladen…
    </div>

    <div v-else-if="error" class="status-meldung fehler">
      {{ error }}
    </div>

    <div v-else-if="filteredPosts.length === 0" class="status-meldung">
      <span class="material-symbols-outlined" style="font-size: 3rem; color: var(--gruen); margin-bottom: 1rem;">forum</span>
      <h3>Keine Beiträge gefunden</h3>
      <p v-if="!userId">Melden Sie sich an, um einen Beitrag zu erstellen.</p>
      <p v-else>Seien Sie der erste, der einen Beitrag erstellt!</p>
    </div>

    <div v-else class="posts-list">
      <PostCard
        v-for="post in filteredPosts"
        :key="post.id"
        :post="post"
        :current-user-id="userId"
        @deleted="handlePostDeleted"
      />
    </div>

    <!-- Create Post Modal -->
    <Teleport to="body">
      <CreatePostModal
        v-if="showCreateModal"
        @created="handlePostCreated"
        @closed="showCreateModal = false"
      />
    </Teleport>
  </main>
</template>

<style scoped>
.community-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: var(--max-breite);
  margin: 0 auto;
}

.community-kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.community-titel {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin-bottom: 0.5rem;
}

.community-beschreibung {
  color: var(--text-gedimmt);
  font-weight: 300;
  max-width: 28rem;
}

.btn-neu-post {
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
  border: none;
  cursor: pointer;
}

.btn-neu-post:hover {
  background-color: var(--gruen-dunkel);
}

.btn-neu-post .material-symbols-outlined {
  font-size: 1.125rem;
}

.nicht-angemeldet {
  padding: 1rem 1.5rem;
  background-color: var(--flaeche);
  border-radius: var(--radius-rund);
  color: var(--text-leise);
  font-size: 0.875rem;
}

.community-filter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--flaeche-dunkel);
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

.such-input::placeholder {
  color: var(--text-gedimmt);
}

.tag-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag-btn {
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

.tag-btn:hover {
  background-color: var(--flaeche-dunkel);
}

.tag-btn.aktiv {
  background-color: var(--terrakotta);
  color: #fff;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-meldung {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--flaeche-hell);
  border-radius: var(--radius);
}

.status-meldung h3 {
  font-size: 1.25rem;
  color: var(--gruen-dunkel);
  margin-bottom: 0.5rem;
}

.status-meldung p {
  color: var(--text-gedimmt);
  max-width: 25rem;
}

.status-meldung.fehler {
  color: #ba1a1a;
  background-color: #ffdad6;
}

@media (max-width: 640px) {
  .community-seite {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .community-kopf {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-neu-post {
    width: 100%;
    justify-content: center;
  }

  .tag-filter {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
}
</style>
