<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

function formatPreis(price) {
  if (price == null) return 'Preis auf Anfrage'
  return price.toFixed(2).replace('.', ',') + ' €'
}
</script>

<template>
  <main class="warenkorb-seite">
    <div class="warenkorb-container">

      <div class="page-kopf">
        <h1>Warenkorb</h1>
        <span v-if="!cart.isEmpty" class="item-count">{{ cart.totalItems }} Artikel</span>
      </div>

      <!-- Leer -->
      <div v-if="cart.isEmpty" class="leer-zustand">
        <span class="material-symbols-outlined leer-icon">shopping_cart</span>
        <h3>Dein Warenkorb ist leer</h3>
        <p>Stöbere im Katalog und füge Pflanzen hinzu.</p>
        <RouterLink to="/katalog" class="btn-katalog">Zum Katalog</RouterLink>
      </div>

      <!-- Gefüllt -->
      <div v-else class="warenkorb-layout">

        <!-- Artikel-Liste -->
        <div class="warenkorb-items">
          <div v-for="item in cart.items" :key="item.plant.id" class="warenkorb-zeile">
            <img :src="item.plant.bild" :alt="item.plant.name" class="item-bild" />
            <div class="item-info">
              <p class="item-name">{{ item.plant.name }}</p>
              <span class="item-einzelpreis">{{ formatPreis(item.plant.price) }}</span>
            </div>
            <div class="item-menge">
              <button class="menge-btn" @click="cart.updateQuantity(item.plant.id, item.quantity - 1)">
                <span class="material-symbols-outlined">remove</span>
              </button>
              <span class="menge-zahl">{{ item.quantity }}</span>
              <button class="menge-btn" @click="cart.updateQuantity(item.plant.id, item.quantity + 1)">
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
            <span class="item-gesamt">
              {{ item.plant.price != null ? formatPreis(item.plant.price * item.quantity) : '—' }}
            </span>
            <button class="item-entfernen" @click="cart.removeItem(item.plant.id)" aria-label="Entfernen">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <!-- Zusammenfassung -->
        <aside class="zusammenfassung">
          <h2>Zusammenfassung</h2>
          <div class="zusammenfassung-zeile">
            <span>Zwischensumme</span>
            <span>{{ formatPreis(cart.totalPrice) }}</span>
          </div>
          <div class="zusammenfassung-zeile">
            <span>Versand</span>
            <span class="versand-gratis">Gratis</span>
          </div>
          <div class="zusammenfassung-summe">
            <span>Gesamt</span>
            <span>{{ formatPreis(cart.totalPrice) }}</span>
          </div>
          <button class="btn-kasse">
            Zur Kasse
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          <RouterLink to="/katalog" class="btn-weiter">Weiter einkaufen</RouterLink>
          <button class="btn-leeren" @click="cart.clear()">Warenkorb leeren</button>
        </aside>

      </div>
    </div>
  </main>
</template>

<style scoped>
.warenkorb-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: var(--max-breite);
  margin: 0 auto;
}

.page-kopf {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-kopf h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin: 0;
}

.item-count {
  font-size: 0.875rem;
  color: var(--text-gedimmt);
}

/* ── Leer-Zustand ── */
.leer-zustand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem 2rem;
  text-align: center;
  background: var(--flaeche);
  border-radius: var(--radius);
}

.leer-icon {
  font-size: 3.5rem;
  color: var(--gruen);
  opacity: 0.5;
}

.leer-zustand h3 {
  font-size: 1.25rem;
  color: var(--gruen-dunkel);
  margin: 0;
}

.leer-zustand p {
  color: var(--text-gedimmt);
  margin: 0;
}

.btn-katalog {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius-rund);
  background: var(--gruen);
  color: #fff;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}
.btn-katalog:hover { background: var(--gruen-dunkel); }

/* ── Layout ── */
.warenkorb-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

/* ── Artikel ── */
.warenkorb-items {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  overflow: hidden;
}

.warenkorb-zeile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border-bottom: 1px solid var(--flaeche-dunkel);
}
.warenkorb-zeile:last-child { border-bottom: none; }

.item-bild {
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  border-radius: calc(var(--radius) * 0.75);
  background: var(--flaeche);
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-einzelpreis {
  font-size: 0.8125rem;
  color: var(--text-gedimmt);
}

/* ── Mengen-Stepper ── */
.item-menge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.menge-btn {
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 50%;
  border: 1px solid var(--flaeche-dunkel);
  background: var(--flaeche);
  color: var(--gruen-dunkel);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}
.menge-btn:hover { background: var(--flaeche-dunkel); }
.menge-btn .material-symbols-outlined { font-size: 1rem; }

.menge-zahl {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--gruen-dunkel);
}

.item-gesamt {
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--gruen-dunkel);
  min-width: 5rem;
  text-align: right;
  flex-shrink: 0;
}

.item-entfernen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: var(--text-gedimmt);
  background: transparent;
  border: none;
  flex-shrink: 0;
  transition: background-color 0.15s, color 0.15s;
}
.item-entfernen:hover { background: #ffdad6; color: #ba1a1a; }
.item-entfernen .material-symbols-outlined { font-size: 1.1rem; }

/* ── Zusammenfassung ── */
.zusammenfassung {
  background: #fff;
  border: 1px solid var(--flaeche-dunkel);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.zusammenfassung h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin: 0 0 0.25rem;
}

.zusammenfassung-zeile {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-gedimmt);
}

.versand-gratis {
  color: var(--gruen);
  font-weight: 600;
}

.zusammenfassung-summe {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gruen-dunkel);
  padding-top: 0.75rem;
  border-top: 1px solid var(--flaeche-dunkel);
}

.btn-kasse {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  border-radius: var(--radius-rund);
  background: var(--gruen);
  color: #fff;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: background-color 0.2s;
  margin-top: 0.25rem;
}
.btn-kasse:hover { background: var(--gruen-dunkel); }
.btn-kasse .material-symbols-outlined { font-size: 1.1rem; }

.btn-weiter {
  display: block;
  text-align: center;
  padding: 0.625rem;
  border-radius: var(--radius-rund);
  border: 1px solid var(--flaeche-dunkel);
  color: var(--text-leise);
  font-size: 0.875rem;
  text-decoration: none;
  transition: background-color 0.15s;
}
.btn-weiter:hover { background: var(--flaeche); }

.btn-leeren {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-gedimmt);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  transition: color 0.15s;
}
.btn-leeren:hover { color: #ba1a1a; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .warenkorb-seite { padding-left: 1rem; padding-right: 1rem; }
  .warenkorb-layout { grid-template-columns: 1fr; }
  .item-gesamt { display: none; }
  .warenkorb-zeile { gap: 0.75rem; padding: 0.875rem 1rem; }
}
</style>
