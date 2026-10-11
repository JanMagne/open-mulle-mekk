# Open Mulle Mekk – Bygg biler!

En fan-laget nettleserhyllest til klassikeren «Bygg biler med Mulle Mekk» (1997).
All grafikk tegnes med kode (canvas) og all lyd lages med WebAudio, så spillet
bruker ingen filer fra originalspillet.

## Kjøre spillet

ES-moduler krever en enkel webserver (det holder ikke å åpne `index.html` direkte):

```bash
python3 -m http.server 8123
```

Åpne deretter <http://localhost:8123>.

## Slik spiller du

- **Gården** – gå inn i garasjen, til skraphaugen, se medaljer i postkassa, eller klikk på bilen for å kjøre.
- **Skraphaugen** – tre hauger med deler. Dra en del til skiltet «Garasjen».
- **Garasjen** – dra deler fra gulvet til chassiset. Ledige festepunkter lyser opp mens du drar.
  Dra en del av bilen for å ta den av. Tavla viser bilens egenskaper.
  Bilen trenger motor, batteri, girkasse, bensintank, sete, ratt og to hjul for å kjøre.
- **Kartet** – kjør med piltastene/WASD, eller hold musa der du vil kjøre. `H` tuter (hvis bilen har horn).
  Venstre/høyre snur bilen også når den står stille. Som i originalen kjører man fra skjermbilde til
  skjermbilde: kjører du ut av kanten, kommer neste bilde (kartet er 3 × 4 bilder, se minikartet).
  Kjør inn til et sted for å besøke det. Følg med på bensinmåleren!

### Hindringer på kartet

| Hindring    | Krav                                         |
|-------------|----------------------------------------------|
| Humpete vei | Sterk bil (karosseri og/eller støtfanger)    |
| Gjørme      | Hjul med mye grep (traktorhjul)              |
| Bratt bakke | Mye kraft i forhold til vekten               |
| Tunnel      | Lykter                                       |

### Oppdrag

1. Kjør melk fra Olas gård til bakeriet (krever lasteplan).
2. Frakt kaken fra bakeriet til hagefesten (krever en myk bil).
3. Besøk Sigurd innerst i skogen (gjennom gjørma).
4. Besøk fyret (gjennom den mørke tunnelen).
5. Kjør opp til fjelltoppen (bratt bakke).
6. Vinn gull på bilutstillingen på torget.

Etter hvert oppdrag ringer skraphandler Figge og leverer nye deler i skraphaugen.

Spillet lagres automatisk i nettleseren (localStorage).

## Kodeoversikt

```
js/
  main.js            oppstart, hovedløkke, inndata
  game.js            sceneskifte og felles tilstand
  engine/            tegnehjelpere (håndtegnet stil), lyd, tale, snakkebobler
  data/parts.js      alle bildeler: egenskaper + tegning
  game/              bilmodell, lagring, figurer, landskap, kart, oppdrag
  scenes/            tittel, gården, garasjen, skraphaugen, kartet, steder, album
```

Nye deler legges til i `js/data/parts.js`, nye steder og oppdrag i
`js/game/world.js` og `js/game/missions.js`.
