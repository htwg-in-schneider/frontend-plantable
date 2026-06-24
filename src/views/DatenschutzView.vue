<template>
  <main class="datenschutz-seite">
    <div class="datenschutz-innen">
      <h1>Datenschutzerklärung</h1>
      <p class="letzter-update">Zuletzt aktualisiert: Juni 2026</p>

      <section class="datenschutz-section">
        <h2>1. Einleitung</h2>
        <div class="datenschutz-content">
          <p>
            Plantable ist ein nicht-kommerzielles Studentenprojekt der Hochschule für Technik. Wir behandeln Ihre Daten mit Sorgfalt und teilen mit Ihnen transparent, wie wir damit umgehen.
          </p>
        </div>
      </section>

      <section class="datenschutz-section">
        <h2>2. Speicherung im Browser (LocalStorage)</h2>
        <div class="datenschutz-content">
          <p>
            Unsere Website speichert Ihre Daten ausschließlich lokal auf Ihrem Gerät im Browser. Es findet keine Übertragung zu Servern statt.
          </p>
          <p>
            <strong>Gespeicherte Daten:</strong>
          </p>
          <ul>
            <li>Ihre persönliche Pflanzensammlung (Meine Pflanzen)</li>
            <li>Anzeigeeinstellungen</li>
          </ul>
          <p>
            <strong>Löschung:</strong> Die Daten bleiben bis zur manuellen Löschung oder zum Löschen des Browser-Speichers erhalten. Sie können diese jederzeit manuell löschen.
          </p>
        </div>
      </section>

      <section class="datenschutz-section">
        <h2>3. Cookies und externe Tracker</h2>
        <div class="datenschutz-content">
          <p>
            Diese Website verwendet weder Cookies noch externe Analyse- oder Tracking-Tools.
          </p>
        </div>
      </section>

      <section class="datenschutz-section">
        <h2>4. Ihre Rechte</h2>
        <div class="datenschutz-content">
          <p>
            Da wir keine personenbezogenen Daten auf Servern speichern, haben Sie vollständige Kontrolle über Ihre Daten:
          </p>
          <ul>
            <li>Sie können Ihre Daten jederzeit in den Browser-Einstellungen löschen</li>
            <li>Sie können jederzeit den Browser-Speicher (LocalStorage) löschen</li>
            <li>Keine Daten werden von uns gesammelt oder analysiert</li>
          </ul>
        </div>
      </section>

      <section class="datenschutz-section">
        <h2>5. Sicherheit</h2>
        <div class="datenschutz-content">
          <p>
            Da sämtliche Daten lokal auf Ihrem Gerät gespeichert werden und nicht über das Internet übertragen werden, bietet dies einen hohen Grad an Sicherheit und Datenschutz.
          </p>
        </div>
      </section>

      <section class="datenschutz-section">
        <h2>6. Kontakt</h2>
        <div class="datenschutz-content">
          <p>
            Falls Sie Fragen zu dieser Datenschutzerklärung haben, besuchen Sie bitte das <a href="https://github.com" target="_blank" rel="noopener">GitHub-Repository</a> dieses Projekts.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
</script>

<style scoped>
.datenschutz-seite {
  padding-top: calc(var(--header-hoehe) + 2rem);
  padding-bottom: 4rem;
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.datenschutz-innen h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gruen-dunkel);
  margin-bottom: 0.5rem;
}

.letzter-update {
  color: var(--text-gedimmt);
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.datenschutz-section {
  margin-bottom: 3rem;
}

.datenschutz-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gruen);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--flaeche-dunkel);
  padding-bottom: 0.5rem;
}

.datenschutz-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gruen-dunkel);
  margin-top: 1rem;
  margin-bottom: 0.75rem;
}

.datenschutz-content {
  color: var(--text-leise);
  line-height: 1.6;
}

.datenschutz-content p {
  margin-bottom: 1rem;
}

.datenschutz-content ul {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.datenschutz-content li {
  margin-bottom: 0.5rem;
}

.datenschutz-content a {
  color: var(--gruen);
  text-decoration: none;
  transition: color 0.2s;
}

.datenschutz-content a:hover {
  color: var(--gruen-dunkel);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .datenschutz-seite {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .datenschutz-innen h1 {
    font-size: 1.75rem;
  }

  .datenschutz-section h2 {
    font-size: 1.25rem;
  }
}
</style>
