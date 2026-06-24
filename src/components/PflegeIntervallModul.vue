<script setup>
import { ref } from 'vue'

defineProps({
  form: { type: Object, required: true },
})

const offen = ref(false)

const felder = [
  { key: 'defaultWateringIntervalDays',     label: 'Gießen',              icon: 'water_drop' },
  { key: 'defaultMistingIntervalDays',      label: 'Besprühen',           icon: 'air' },
  { key: 'defaultFertilizingIntervalDays',  label: 'Düngen',              icon: 'eco' },
  { key: 'defaultLeafCleaningIntervalDays', label: 'Blätter reinigen',    icon: 'mop' },
  { key: 'defaultRepottingIntervalDays',    label: 'Umtopfen',            icon: 'yard' },
  { key: 'defaultPruningIntervalDays',      label: 'Zurückschneiden',     icon: 'content_cut' },
  { key: 'defaultPestCheckIntervalDays',    label: 'Schädlingskontrolle', icon: 'pest_control' },
]
</script>

<template>
  <div class="pflege-modul">
    <button type="button" class="pflege-kopf" @click="offen = !offen">
      <span class="pflege-kopf-links">
        <span class="material-symbols-outlined">spa</span>
        <span class="pflege-titel">Pflegeintervalle</span>
        <span class="pflege-optional-badge">optional</span>
      </span>
      <span class="material-symbols-outlined pflege-arrow" :class="{ gedreht: offen }">
        expand_more
      </span>
    </button>

    <Transition name="ausklappen">
      <div v-if="offen" class="pflege-inhalt">
        <p class="pflege-info">
          Wie oft (in Tagen) soll diese Pflege-Maßnahme durchgeführt werden?
          Wird als Standard beim Hinzufügen ins Dashboard übernommen. Leer lassen = deaktiviert.
        </p>
        <div class="pflege-grid">
          <label v-for="feld in felder" :key="feld.key" class="pflege-feld">
            <span class="pflege-feld-label">
              <span class="material-symbols-outlined">{{ feld.icon }}</span>
              {{ feld.label }}
            </span>
            <div class="pflege-input-row">
              <input
                :value="form[feld.key]"
                @input="form[feld.key] = $event.target.value !== '' ? Number($event.target.value) : null"
                type="number"
                min="1"
                max="3650"
                placeholder="—"
                class="pflege-input"
              />
              <span class="pflege-einheit">Tage</span>
            </div>
          </label>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pflege-modul {
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  overflow: hidden;
}

.pflege-kopf {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--flaeche);
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: background-color 0.15s;
}
.pflege-kopf:hover { background: var(--flaeche-dunkel); }

.pflege-kopf-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.pflege-kopf-links > .material-symbols-outlined {
  font-size: 1.125rem;
  color: var(--gruen);
}

.pflege-titel {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
}

.pflege-optional-badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-gedimmt);
  background: var(--flaeche-dunkel);
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}

.pflege-arrow {
  font-size: 1.25rem;
  color: var(--text-gedimmt);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.pflege-arrow.gedreht { transform: rotate(180deg); }

.pflege-inhalt {
  padding: 1rem;
  border-top: 1px solid var(--flaeche-dunkel);
  background: #fff;
}

.pflege-info {
  font-size: 0.75rem;
  color: var(--text-gedimmt);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.pflege-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.75rem;
}

.pflege-feld {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.pflege-feld-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--gruen-dunkel);
}
.pflege-feld-label .material-symbols-outlined {
  font-size: 1rem;
  color: var(--gruen);
}

.pflege-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pflege-input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-family: inherit;
  background: #fff;
}
.pflege-input:focus {
  outline: none;
  border-color: var(--gruen);
}

.pflege-einheit {
  font-size: 0.75rem;
  color: var(--text-gedimmt);
  white-space: nowrap;
}

/* Transition */
.ausklappen-enter-active,
.ausklappen-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
  transform-origin: top;
}
.ausklappen-enter-from,
.ausklappen-leave-to {
  opacity: 0;
  transform: scaleY(0.94);
}
</style>
