<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { communityApi } from '@/services/api'
import CommentSection from '@/components/CommentSection.vue'

const route = useRoute()
const { userId } = useAuth()

const post = ref(null)
const loading = ref(true)
const error = ref(null)

async function loadPost() {
  loading.value = true
  error.value = null
  try {
    post.value = await communityApi.getPost(route.params.id)
  } catch (err) {
    error.value = 'Fehler beim Laden des Beitrags: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadPost)
</script>

<template>
  <main class="post-detail-seite">
    <div class="post-detail-wrapper">
      <div v-if="loading" class="status-meldung">
        Beitrag wird geladen…
      </div>

      <div v-else-if="error" class="status-meldung fehler">
        {{ error }}
      </div>

      <article v-else-if="post" class="post-detail">
        <div class="post-kopf">
          <div class="post-author-info">
            <div class="post-avatar">{{ post.author?.name?.[0]?.toUpperCase() || 'U' }}</div>
            <div>
              <div class="post-author-name">{{ post.author?.name || 'Anonym' }}</div>
              <div class="post-datum">{{ formatDate(post.createdAt) }}</div>
              <div v-if="post.updatedAt && post.updatedAt !== post.createdAt" class="post-update">
                Bearbeitet: {{ formatDate(post.updatedAt) }}
              </div>
            </div>
          </div>
        </div>

        <h1 class="post-detail-title">{{ post.title }}</h1>

        <div v-if="post.imageUrl" class="post-image">
          <img :src="post.imageUrl" :alt="post.title" />
        </div>

        <div class="post-detail-content">
          {{ post.content }}
        </div>

        <div v-if="post.tags?.length" class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
        </div>

        <CommentSection :post-id="post.id" :current-user-id="userId" />
      </article>
    </div>
  </main>
</template>

<style scoped>
.post-detail-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
}

.post-detail-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.post-detail {
  background: #fff;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(62, 54, 49, 0.1);
}

.post-kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--flaeche-dunkel);
}

.post-author-info {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
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
  font-size: 1.25rem;
  flex-shrink: 0;
}

.post-author-name {
  font-weight: 600;
  color: var(--gruen-dunkel);
  font-size: 1rem;
}

.post-datum {
  font-size: 0.85rem;
  color: var(--text-gedimmt);
  margin-top: 0.25rem;
}

.post-update {
  font-size: 0.75rem;
  color: var(--text-gedimmt);
  font-style: italic;
  margin-top: 0.25rem;
}

.post-detail-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.post-image {
  margin-bottom: 2rem;
  border-radius: var(--radius);
  overflow: hidden;
}

.post-image img {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
}

.post-detail-content {
  color: var(--text-leise);
  line-height: 1.8;
  font-size: 1rem;
  margin-bottom: 2rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-tags {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--flaeche-dunkel);
}

.post-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--flaeche);
  border-radius: var(--radius-rund);
  font-size: 0.875rem;
  color: var(--gruen-dunkel);
  font-weight: 500;
}

.status-meldung {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--flaeche-hell);
  border-radius: var(--radius);
  color: var(--text-gedimmt);
}

.status-meldung.fehler {
  color: #ba1a1a;
  background-color: #ffdad6;
}

@media (max-width: 640px) {
  .post-detail-seite {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .post-detail {
    padding: 1.5rem;
  }

  .post-detail-title {
    font-size: 1.5rem;
  }

  .post-kopf {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
