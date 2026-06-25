<script setup>
import PflegeIntervallModul from './PflegeIntervallModul.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const vordefinierteTagsListe = [
  'Anfänger', 'Experte', 'Luftreinigend', 'Haustierfreundlich',
  'Tropisch', 'Sukkulente', 'Rankpflanze', 'Schattenpflanze',
  'Sonnenliebend', 'Hängepflanze', 'Blühend', 'Heilpflanze', 'Zimmerpflanze',
]

function toggleTag(tag) {
  const idx = props.form.tags.indexOf(tag)
  if (idx >= 0) props.form.tags.splice(idx, 1)
  else props.form.tags.push(tag)
}
</script>

<template>
  <div class="form-grid">
    <label>
      <span>Trivialname *</span>
      <input v-model="form.commonName" required placeholder="z.B. Fensterblatt" />
    </label>
    <label>
      <span>Botanischer Name *</span>
      <input v-model="form.botanicalName" required placeholder="z.B. Monstera deliciosa" />
    </label>
    <label>
      <span>Slug *</span>
      <input v-model="form.slug" required placeholder="z.B. monstera-deliciosa" />
    </label>
    <label>
      <span>Herkunft</span>
      <input v-model="form.originRegion" placeholder="z.B. Mittelamerika" />
    </label>
    <label>
      <span>Preis (€)</span>
      <input v-model="form.price" type="number" min="0" step="0.01" placeholder="z.B. 12.99" />
    </label>
    <label>
      <span>Pflegelevel *</span>
      <select v-model="form.careLevel" required>
        <option value="EASY">Pflegeleicht</option>
        <option value="MEDIUM">Mittel</option>
        <option value="HARD">Experte</option>
      </select>
    </label>
    <label>
      <span>Lichtbedarf *</span>
      <select v-model="form.lightRequirement" required>
        <option value="LOW">Wenig Licht</option>
        <option value="MEDIUM">Indirektes Licht</option>
        <option value="BRIGHT">Helles, indirektes Licht</option>
        <option value="DIRECT">Direkte Sonne</option>
      </select>
    </label>
    <label class="form-full">
      <span>Bild-URL</span>
      <input v-model="form.mainImageUrl" type="url" placeholder="https://…" />
    </label>
    <label class="form-full">
      <span>Beschreibung</span>
      <textarea v-model="form.description" rows="3"></textarea>
    </label>
    <label class="form-checkbox">
      <input type="checkbox" v-model="form.isPetFriendly" />
      <span>Haustierfreundlich</span>
    </label>
    <label class="form-checkbox">
      <input type="checkbox" v-model="form.isAirPurifying" />
      <span>Luftreinigend</span>
    </label>

    <div class="form-full tags-block">
      <span class="tags-label">Tags</span>
      <div class="tags-pillen">
        <button
          v-for="tag in vordefinierteTagsListe"
          :key="tag"
          type="button"
          class="tag-pille"
          :class="{ aktiv: form.tags.includes(tag) }"
          @click="toggleTag(tag)"
        >{{ tag }}</button>
      </div>
    </div>

    <div class="form-full">
      <PflegeIntervallModul :form="form" />
    </div>

    <div class="form-full">
      <slot name="aktionen" />
    </div>
  </div>
</template>

<style scoped>
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

.form-grid label.form-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
.form-checkbox input { width: 1rem; height: 1rem; }

.tags-block { display: flex; flex-direction: column; gap: 0.5rem; }
.tags-label { font-size: 0.875rem; font-weight: 500; color: var(--gruen-dunkel); }
.tags-pillen { display: flex; flex-wrap: wrap; gap: 0.375rem; }

.tag-pille {
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
.tag-pille:hover { background-color: var(--flaeche); }
.tag-pille.aktiv { background-color: var(--gruen); color: #fff; border-color: var(--gruen); }

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
