<script setup>
import monsteraImg from '@/assets/images/Monstera.png'
import hangingPlantImg from '@/assets/images/hangingPlant.png'
import succulentsImg from '@/assets/images/succulents.png'
import palmImg from '@/assets/images/palm.png'
</script>

<template>
  <main>

    <section class="hero">
      <div class="hero-innen">

        <div class="hero-text">
          <span class="etikett">Pflanze der Woche</span>
          <h1>Monstera <br/><em>Deliciosa</em></h1>
          <p>Ein lebendiges Kunstwerk – mit ihren großen, gefensterten Blättern bringt sie tropisches Flair in jeden Raum.</p>
          <div class="hero-kaufen">
            <RouterLink to="/product/1" class="btn-kaufen">
              Jetzt kaufen
              <span class="material-symbols-outlined">arrow_forward</span>
            </RouterLink>
            <div class="preis-block">
              <span class="preis">34,99 €</span>
              <span class="preis-hinweis">inkl. Keramiktopf</span>
            </div>  
          </div>
        </div>

        <div class="hero-bild-bereich">
          <div class="hintergrund-glow"></div>
          <img :src="monsteraImg" alt="Monstera Deliciosa Pflanze" class="hero-pflanzenbild"/>
          <div class="pflegekarte">
            <div class="pflegekarte-zeile">
              <div class="pflege-icon">
                <span class="material-symbols-outlined">light_mode</span>
              </div>
              <div>
                <span class="pflege-label">Lichtbedarf</span>
                <span class="pflege-wert">Helles, indirektes Licht</span>
              </div>
            </div>
            <div class="pflegekarte-zeile">
              <div class="pflege-icon">
                <span class="material-symbols-outlined">water_drop</span>
              </div>
              <div>
                <span class="pflege-label">Gießrhythmus</span>
                <span class="pflege-wert">Alle 7–10 Tage</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <section class="journal">
      <div class="journal-innen">
        <div class="journal-text">
          <h2>Dein persönliches <br/>botanisches Tagebuch</h2>
          <p class="journal-beschreibung">
            Verwandle deine Pflanzensammlung in ein lebendiges Archiv. Verfolge das Wachstum, erhalte saisonale Erinnerungen und tausche dich mit Gleichgesinnten aus.
          </p>

          <div class="journal-features">
            <div class="journal-feature">
              <span class="material-symbols-outlined feature-icon">water_drop</span>
              <div class="feature-inhalt">
                <h4>Gießerinnerungen</h4>
                <p>Individuelle Pläne, abgestimmt auf dein lokales Klima.</p>
              </div>
            </div>
            <div class="journal-feature">
              <span class="material-symbols-outlined feature-icon">school</span>
              <div class="feature-inhalt">
                <h4>Expertenwissen</h4>
                <p>Fundierte Pflegeinfos auf Enzyklopädie-Niveau.</p>
              </div>
            </div>
            <div class="journal-feature">
              <span class="material-symbols-outlined feature-icon">calendar_today</span>
              <div class="feature-inhalt">
                <h4>Düngepläne</h4>
                <p>Nährstoffe im Blick für optimales Wachstum.</p>
              </div>
            </div>
            <div class="journal-feature">
              <span class="material-symbols-outlined feature-icon">groups</span>
              <div class="feature-inhalt">
                <h4>Community</h4>
                <p>Erfahrungen teilen mit anderen Pflanzenliebhabern.</p>
              </div>
            </div>
          </div>

          <button class="btn-journal">Jetzt dem Archiv beitreten</button>
        </div>

        <div class="journal-visual">
          <div class="journal-visual-wrapper">
            <div class="journal-glow journal-glow-1"></div>
            <div class="journal-glow journal-glow-2"></div>

            <div class="journal-karte">
              <div class="journal-karte-header">
                <span>Tagebuch-Vorschau</span>
                <span class="material-symbols-outlined">more_horiz</span>
              </div>

              <div class="journal-tasks">
                <div class="journal-task aktiv">
                  <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">potted_plant</span>
                  <div>
                    <p class="task-label">Aktive Aufgabe</p>
                    <p class="task-title">Geigenblattfeige einsprühen</p>
                  </div>
                  <span class="material-symbols-outlined chevron">chevron_right</span>
                </div>

                <div class="journal-task notiz">
                  <span class="material-symbols-outlined">eco</span>
                  <div>
                    <p class="task-label">Wachstumsnotiz</p>
                    <p class="task-title">Neues Blatt entfaltet!</p>
                  </div>
                </div>
              </div>

              <div class="journal-users">
                <div class="user-avatars">
                  <img src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=" alt="Portrait"/>
                  <img src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=" alt="Portrait"/>
                  <img src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=" alt="Portrait"/>
                  <div class="user-more">+2k</div>
                </div>
                <p>Schließ dich tausenden Pflanzeneltern an, die ihre Reise dokumentieren.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="kategorien">
      <div class="kategorien-innen">
        <div class="kategorien-kopf">
          <div>
            <span class="etikett">ENTDECKEN</span>
            <h2>Kategorien</h2>
          </div>
          <p class="kategorien-beschreibung"></p>
        </div>

        <div class="kategorien-raster">
          <div class="kategorie-karte">
            <img :src="hangingPlantImg" alt="Hängepflanzen"/>
            <div class="kategorie-overlay"></div>
            <div class="kategorie-text">
              <h3>Hängepflanzen</h3>
              <p class="kategorie-untertitel">Schwebende Eleganz</p>
            </div>
          </div>

          <div class="kategorie-karte">
            <img :src="succulentsImg" alt="Sukkulenten"/>
            <div class="kategorie-overlay"></div>
            <div class="kategorie-text">
              <h3>Sukkulenten</h3>
              <p class="kategorie-untertitel">Wunder der Wüste</p>
            </div>
          </div>

          <div class="kategorie-karte">
            <img :src="palmImg" alt="Palmen"/>
            <div class="kategorie-overlay"></div>
            <div class="kategorie-text">
              <h3>Palmen</h3>
              <p class="kategorie-untertitel">Tropisches Lebensgefühl</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bewertungen">
      <div class="bewertungen-innen">
        <div class="bewertungen-kopf">
          <h2>Geliebt von unserer Community</h2>
          <p>Echte Erfahrungen von echten Pflanzenliebhabern. Werde Teil unserer botanischen Gemeinschaft.</p>
        </div>

        <div class="bewertungen-raster">
          <div class="bewertungskarte">
            <div class="sterne">
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
            </div>
            <p class="bewertungstext">„Die Monstera war noch beeindruckender als auf den Fotos. Sie kam perfekt gepflegt an und ist jetzt das Herzstück meines Wohnzimmers."</p>
            <div class="bewertungs-autor">
              <img src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=" alt="Elena G."/>
              <div>
                <strong>Elena G.</strong>
                <span>Verifizierte Käuferin</span>
              </div>
            </div>
          </div>

          <div class="bewertungskarte">
            <div class="sterne">
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined">star</span>
            </div>
            <p class="bewertungstext">„Die Pflegeanleitungen von Plantable sind Gold wert. Meine Sukkulenten-Sammlung hat noch nie so gut ausgesehen. Das Starter-Archiv kann ich nur empfehlen."</p>
            <div class="bewertungs-autor">
              <img src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=" alt="Marcus W."/>
              <div>
                <strong>Marcus W.</strong>
                <span>Community-Mitglied</span>
              </div>
            </div>
          </div>

          <div class="bewertungskarte">
            <div class="sterne">
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
              <span class="material-symbols-outlined gefallt">star</span>
            </div>
            <p class="bewertungstext">„Wissenschaftliche Genauigkeit trifft auf ästhetische Schönheit. Endlich ein Shop, der Pflanzen als das behandelt, was sie sind – lebendige Kunstwerke."</p>
            <div class="bewertungs-autor">
              <img src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=" alt="Sarah J."/>
              <div>
                <strong>Sarah J.</strong>
                <span>Botanik-Enthusiastin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="newsletter">
      <div class="newsletter-box">
        <img src="" alt="" class="newsletter-hintergrundbild" aria-hidden="true"/>
        <div class="newsletter-inhalt">
          <h2><em>Schreib uns eine Nachricht.</em></h2>
          <p>Fragen zu Pflanzen, Pflege oder unserer Community? Wir freuen uns auf deine E-Mail und antworten dir persönlich.</p>
          <div class="newsletter-formular">
            <a href="mailto:kontakt@plantable.de?subject=Kontakt%20%C3%BCber%20Plantable" class="btn-kontakt">
              <span class="material-symbols-outlined">mail</span>
              kontakt@plantable.de
            </a>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>