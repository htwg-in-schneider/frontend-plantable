<script setup>
</script>

<template>
  <main class="warenkorb-seite">
    <div class="warenkorb-container">
      <h1>Warenkorb</h1>
      <div class="leer-hinweis">
        <span class="material-symbols-outlined">shopping_cart</span>
        <p>Dein Warenkorb ist noch leer.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.warenkorb-seite {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.warenkorb-container h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.leer-hinweis {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: #999;
}

.leer-hinweis .material-symbols-outlined {
  font-size: 3.5rem;
}

.leer-hinweis p {
  font-size: 1rem;
}
</style>
