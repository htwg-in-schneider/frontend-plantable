<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { communityApi } from '@/services/api'

const { isAdmin: authIsAdmin } = useAuth()

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  currentUserId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['deleted'])
const showDeleteMenu = ref(false)
const deleting = ref(false)

const isAuthor = () => props.currentUserId && props.post.author?.id == props.currentUserId
const isAdmin = () => authIsAdmin.value
const canDelete = () => isAuthor() || isAdmin()

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

async function deletePost() {
  if (!window.confirm('Beitrag wirklich löschen?')) return

  deleting.value = true
  try {
    await communityApi.deletePost(props.post.id)
    emit('deleted', props.post.id)
  } catch (error) {
    alert('Fehler beim Löschen: ' + error.message)
  } finally {
    deleting.value = false
    showDeleteMenu.value = false
  }
}
</script>

<template>
  <article class="post-card">
    <div class="post-kopf">
      <div class="post-author-info">
        <div class="post-avatar">{{ post.author?.name?.[0]?.toUpperCase() || 'U' }}</div>
        <div>
          <div class="post-author-name">{{ post.author?.name || 'Anonym' }}</div>
          <div class="post-datum">{{ formatDate(post.createdAt) }}</div>
        </div>
      </div>

      <div v-if="canDelete()" class="post-menu">
        <button class="menu-btn" @click="showDeleteMenu = !showDeleteMenu">
          <span class="material-symbols-outlined">more_vert</span>
        </button>
        <div v-if="showDeleteMenu" class="menu-dropdown">
          <button @click="deletePost" :disabled="deleting" class="menu-item-delete">
            <span class="material-symbols-outlined">delete</span>
            {{ deleting ? 'Löschen…' : 'Löschen' }}
          </button>
        </div>
      </div>
    </div>

    <RouterLink :to="`/community/${post.id}`" class="post-title-link">
      <h3 class="post-title">{{ post.title }}</h3>
    </RouterLink>

    <p class="post-content">{{ post.content.substring(0, 300) }}{{ post.content.length > 300 ? '...' : '' }}</p>

    <div class="post-tags">
      <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
    </div>

    <div class="post-footer">
      <RouterLink :to="`/community/${post.id}`" class="post-link-kommentare">
        <span class="material-symbols-outlined">forum</span>
        {{ post.comments?.length || 0 }} Kommentare
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.post-card {
  background: #fff;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: box-shadow 0.2s, transform 0.2s;
}

.post-card:hover {
  box-shadow: 0 8px 24px rgba(62, 54, 49, 0.1);
  transform: translateY(-2px);
}

.post-kopf {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.post-author-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.post-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--gruen);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.post-author-name {
  font-weight: 600;
  color: var(--gruen-dunkel);
  font-size: 0.95rem;
}

.post-datum {
  font-size: 0.75rem;
  color: var(--text-gedimmt);
  margin-top: 0.25rem;
}

.post-menu {
  position: relative;
}

.menu-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-gedimmt);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.menu-btn:hover {
  background-color: var(--flaeche);
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(62, 54, 49, 0.15);
  z-index: 10;
  min-width: 150px;
}

.menu-item-delete {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #ba1a1a;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  justify-content: flex-start;
}

.menu-item-delete:hover:not(:disabled) {
  background-color: #ffdad6;
}

.menu-item-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-title-link {
  text-decoration: none;
  display: block;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
  margin: 0 0 0.75rem 0;
  transition: color 0.2s;
}

.post-title-link:hover .post-title {
  color: var(--gruen);
}

.post-content {
  color: var(--text-leise);
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.post-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.post-tag {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background-color: var(--flaeche);
  border-radius: var(--radius-rund);
  font-size: 0.7rem;
  color: var(--text-leise);
  font-weight: 500;
}

.post-footer {
  display: flex;
  justify-content: flex-start;
  border-top: 1px solid var(--flaeche-dunkel);
  padding-top: 1rem;
}

.post-link-kommentare {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--gruen);
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}

.post-link-kommentare:hover {
  color: var(--gruen-dunkel);
}

.post-link-kommentare .material-symbols-outlined {
  font-size: 1rem;
}
</style>
