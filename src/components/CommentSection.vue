<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { communityApi } from '@/services/api'

const { isAdmin: authIsAdmin } = useAuth()

const props = defineProps({
  postId: {
    type: [Number, String],
    required: true,
  },
  currentUserId: {
    type: [Number, String],
    default: null,
  },
})

const comments = ref([])
const commentContent = ref('')
const loading = ref(false)
const posting = ref(false)

async function loadComments() {
  loading.value = true
  try {
    comments.value = await communityApi.getComments(props.postId)
  } catch (error) {
    console.error('Fehler beim Laden der Kommentare:', error)
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  if (!commentContent.value.trim()) return
  if (!props.currentUserId) {
    alert('Sie müssen angemeldet sein, um einen Kommentar zu verfassen')
    return
  }

  posting.value = true
  try {
    const newComment = await communityApi.createComment(props.postId, commentContent.value)
    comments.value.push(newComment)
    commentContent.value = ''
  } catch (error) {
    alert('Fehler beim Posten des Kommentars: ' + error.message)
  } finally {
    posting.value = false
  }
}

async function deleteComment(commentId) {
  if (!window.confirm('Kommentar wirklich löschen?')) return

  try {
    await communityApi.deleteComment(props.postId, commentId)
    comments.value = comments.value.filter(c => c.id !== commentId)
  } catch (error) {
    alert('Fehler beim Löschen: ' + error.message)
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

function canDeleteComment(commentAuthorId) {
  return props.currentUserId && (
    commentAuthorId == props.currentUserId ||
    authIsAdmin.value
  )
}

onMounted(loadComments)
</script>

<template>
  <section class="comments-section">
    <h2 class="comments-titel">Kommentare ({{ comments.length }})</h2>

    <div v-if="!currentUserId" class="comment-hinweis">
      <span class="material-symbols-outlined">lock</span>
      Melden Sie sich an, um einen Kommentar zu verfassen.
    </div>

    <form v-else @submit.prevent="submitComment" class="comment-form">
      <textarea
        v-model="commentContent"
        placeholder="Schreiben Sie einen Kommentar…"
        rows="3"
        class="comment-textarea"
      ></textarea>
      <button type="submit" :disabled="posting || !commentContent.trim()" class="btn-submit">
        {{ posting ? 'Wird gepostet…' : 'Kommentar posten' }}
      </button>
    </form>

    <div v-if="loading" class="loading">
      Kommentare werden geladen…
    </div>

    <div v-else-if="comments.length === 0" class="no-comments">
      Noch keine Kommentare. Seien Sie der Erste!
    </div>

    <div v-else class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-avatar">{{ comment.author?.name?.[0]?.toUpperCase() || 'U' }}</div>
        <div class="comment-content">
          <div class="comment-header">
            <div class="comment-author">{{ comment.author?.name || 'Anonym' }}</div>
            <div class="comment-datum">{{ formatDate(comment.createdAt) }}</div>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
          <button
            v-if="canDeleteComment(comment.author?.id)"
            @click="deleteComment(comment.id)"
            class="comment-delete-btn"
          >
            <span class="material-symbols-outlined">delete</span>
            Löschen
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comments-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--flaeche-dunkel);
}

.comments-titel {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
  margin-bottom: 1.5rem;
}

.comment-hinweis {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--flaeche);
  border-radius: var(--radius);
  color: var(--text-leise);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.comment-hinweis .material-symbols-outlined {
  font-size: 1.25rem;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--flaeche-hell);
  border-radius: var(--radius);
}

.comment-textarea {
  padding: 0.75rem;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  background: #fff;
  transition: border-color 0.2s;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--gruen);
  box-shadow: 0 0 0 3px rgba(45, 71, 57, 0.1);
}

.btn-submit {
  padding: 0.625rem 1rem;
  border-radius: var(--radius-rund);
  background-color: var(--gruen);
  color: #fff;
  border: none;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--gruen-dunkel);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-gedimmt);
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: var(--text-gedimmt);
  background-color: var(--flaeche-hell);
  border-radius: var(--radius);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--flaeche-hell);
  border-radius: var(--radius);
}

.comment-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--terrakotta);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.comment-author {
  font-weight: 600;
  color: var(--gruen-dunkel);
  font-size: 0.95rem;
}

.comment-datum {
  font-size: 0.75rem;
  color: var(--text-gedimmt);
}

.comment-text {
  color: var(--text-leise);
  line-height: 1.6;
  margin: 0 0 0.5rem 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-rund);
  background: transparent;
  border: 1px solid var(--flaeche-dunkel);
  color: #ba1a1a;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.comment-delete-btn:hover {
  background-color: #ffdad6;
}

.comment-delete-btn .material-symbols-outlined {
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .comment-item {
    gap: 0.75rem;
  }

  .comment-avatar {
    width: 2rem;
    height: 2rem;
  }

  .comment-textarea {
    font-size: 16px;
  }
}
</style>
