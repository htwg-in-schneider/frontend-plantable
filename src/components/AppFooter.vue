<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer>
    <div class="footer-innen">
      <hr/>
      <div class="footer-raster">

        <div class="footer-marke">
          <p class="logo">Plantable</p>
          <p>Die feinsten botanischen Exemplare für moderne Wohnräume – wissenschaftlich fundiert, ästhetisch gestaltet.</p>
        </div>

        <div>
          <h4>Entdecken</h4>
          <ul>
            <li><RouterLink to="/katalog">Katalog</RouterLink></li>
            <li><a href="#">Raritäten</a></li>
            <li><a href="#">Pflegebibliothek</a></li>
          </ul>
        </div>

        <div>
          <h4>Kontakt</h4>
          <ul>
            <li><a href="#">Nachhaltigkeit</a></li>
            <li><a href="#">Newsletter</a></li>
            <li><a href="#">Kontakt</a></li>
          </ul>
        </div>

        <div>
          <h4>Rechtliches</h4>
          <ul>
            <li><RouterLink to="/impressum">Impressum</RouterLink></li>
            <li><RouterLink to="/datenschutz">Datenschutz</RouterLink></li>
          </ul>
        </div>

      </div>

      <div class="footer-bottom">
        <p class="footer-copyright">© 2026 Plantable Botanisches Archiv. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  </footer>
</template>
