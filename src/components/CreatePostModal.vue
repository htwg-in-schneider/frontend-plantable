<script setup>
import { ref, reactive } from 'vue'
import { communityApi } from '@/services/api'

const emit = defineEmits(['created', 'closed'])

const vordefinierteTagsListe = [
  'Pflanzenpflege', 'Vermehrung', 'Anfänger-Tipps', 'Schädlinge',
  'Düngen', 'Gießen', 'Licht', 'Monstera', 'Sukkulenten',
  'Stecklinge', 'Umtopfen', 'Aktualisierung',
]

const saving = ref(false)
const form = reactive({
  title: '',
  content: '',
  tags: [],
  imageUrl: '',
})

//const charCount = ref(0)

function toggleTag(tag) {
  const idx = form.tags.indexOf(tag)
  if (idx >= 0) {
    form.tags.splice(idx, 1)
  } else {
    form.tags.push(tag)
  }
}

async function submitPost() {
  if (!form.title.trim() || !form.content.trim()) {
    alert('Titel und Inhalt sind erforderlich')
    return
  }

  saving.value = true
  try {
    const newPost = await communityApi.createPost({
      title: form.title,
      content: form.content,
      tags: form.tags,
      imageUrl: form.imageUrl || null,
    })
    emit('created', newPost)
  } catch (error) {
    alert('Fehler beim Erstellen des Beitrags: ' + error.message)
  } finally {
    saving.value = false
  }
}

function closeModal() {
  emit('closed')
}
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-kopf">
        <h2>Neuer Beitrag</h2>
        <button class="modal-schliessen" @click="closeModal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <form @submit.prevent="submitPost" class="form">
        <label class="form-group">
          <span class="form-label">Titel *</span>
          <input
            v-model="form.title"
            type="text"
            placeholder="Geben Sie einen aussagekräftigen Titel ein…"
            maxlength="200"
            required
            class="form-input"
          />
          <span class="form-hint">{{ form.title.length }}/200</span>
        </label>

        <label class="form-group">
          <span class="form-label">Inhalt *</span>
          <textarea
            v-model="form.content"
            placeholder="Teilen Sie Ihre Tipps, Fragen oder Erfahrungen…"
            rows="8"
            required
            class="form-textarea"
          ></textarea>
        </label>

        <label class="form-group">
          <span class="form-label">Bild-URL (optional)</span>
          <input
            v-model="form.imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            class="form-input"
          />
        </label>

        <div class="form-group">
          <span class="form-label">Tags</span>
          <div class="tag-selector">
            <button
              v-for="tag in vordefinierteTagsListe"
              :key="tag"
              type="button"
              class="tag-button"
              :class="{ aktiv: form.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-speichern" :disabled="saving">
            {{ saving ? 'Wird gespeichert…' : 'Beitrag erstellen' }}
          </button>
          <button type="button" class="btn-abbrechen" @click="closeModal">
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
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
  max-width: 700px;
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
  background: transparent;
  border: none;
  color: var(--text-gedimmt);
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-schliessen:hover {
  background-color: var(--flaeche-dunkel);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 0.875rem;
  background: #fff;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--gruen);
  box-shadow: 0 0 0 3px rgba(45, 71, 57, 0.1);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-gedimmt);
  text-align: right;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-rund);
  border: 1px solid var(--flaeche-dunkel);
  background: transparent;
  color: var(--text-leise);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.tag-button:hover {
  background-color: var(--flaeche);
}

.tag-button.aktiv {
  background-color: var(--gruen);
  color: #fff;
  border-color: var(--gruen);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--flaeche-dunkel);
}

.btn-speichern,
.btn-abbrechen {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-rund);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}

.btn-speichern {
  background-color: var(--gruen);
  color: #fff;
}

.btn-speichern:hover:not(:disabled) {
  background-color: var(--gruen-dunkel);
}

.btn-speichern:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-abbrechen {
  background: transparent;
  color: var(--text-leise);
  border: 1px solid var(--flaeche-dunkel);
}

.btn-abbrechen:hover {
  background-color: var(--flaeche-dunkel);
}

@media (max-width: 640px) {
  .modal {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-speichern,
  .btn-abbrechen {
    width: 100%;
  }
}
</style>
