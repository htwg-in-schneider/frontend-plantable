<template>
  <main class="impressum-seite">
    <div class="impressum-innen">
      <h1>Impressum</h1>

      <section class="impressum-section">
        <h2>Projektinformationen</h2>
        <div class="impressum-content">
          <p>
            <strong>Projektname:</strong> Plantable – Botanisches Archiv<br/>
            <strong>Art:</strong> Studentisches Webentwicklungsprojekt<br/>
            <strong>Institution:</strong> Hochschule für Technik<br/>
            <strong>Kurs:</strong> Webentwicklung
          </p>
        </div>
      </section>

      <section class="impressum-section">
        <h2>Entwickler</h2>
        <div class="impressum-content">
          <p>
            Diese Website wurde von Studierenden entwickelt und dient zu Lehr- und Demonstrationszwecken.
          </p>
          <p>
            <strong>Repository:</strong> <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
          </p>
        </div>
      </section>

      <section class="impressum-section">
        <h2>Haftungsausschluss</h2>
        <div class="impressum-content">
          <p>
            Dies ist ein Schulprojekt zu Demonstrationszwecken. Die Inhalte werden ohne Gewährleistung zur Verfügung gestellt. Die Betreiber übernehmen keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität der Inhalte.
          </p>
          <p>
            Die Inhalte und Werke auf dieser Seite unterliegen dem deutschen Urheberrecht. Jede Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedarf der schriftlichen Zustimmung des Autors oder der Autorin.
          </p>
        </div>
      </section>

      <section class="impressum-section">
        <h2>Haftung für Links</h2>
        <div class="impressum-content">
          <p>
            Unser Angebot enthält Links zu externen Webseiten Dritter. Wir übernehmen keine Haftung für die Inhalte externer Websites. Die Betreiber sind verantwortlich für ihre Seiten.
          </p>
        </div>
      </section>

      <section class="impressum-section">
        <h2>Datenschutz</h2>
        <div class="impressum-content">
          <p>
            Weitere Informationen zum Umgang mit Ihren Daten finden Sie in unserer <RouterLink to="/datenschutz">Datenschutzerklärung</RouterLink>.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.impressum-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.impressum-innen h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin-bottom: 2rem;
}

.impressum-section {
  margin-bottom: 3rem;
}

.impressum-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gruen);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--flaeche-dunkel);
  padding-bottom: 0.5rem;
}

.impressum-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
  margin-top: 1rem;
  margin-bottom: 0.75rem;
}

.impressum-content {
  color: var(--text-leise);
  line-height: 1.6;
}

.impressum-content p {
  margin-bottom: 1rem;
}

.impressum-content a {
  color: var(--gruen);
  text-decoration: none;
  transition: color 0.2s;
}

.impressum-content a:hover {
  color: var(--gruen-dunkel);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .impressum-seite {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .impressum-innen h1 {
    font-size: 1.75rem;
  }

  .impressum-section h2 {
    font-size: 1.25rem;
  }
}
</style>
