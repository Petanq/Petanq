# Petanque13 / Match13 — werkafspraken

## Altijd op de gsm controleren (vast, op vraag van Frederic)

Elke wijziging die op een telefoon zichtbaar is, wordt vóór "klaar", commit of push gecontroleerd op **zowel iPhone- als Android-formaten**:

- iPhone SE 320x568 en 375x667, iPhone 12-15 390x844, iPhone Pro Max 430x932
- Android 360x800 en 412x915
- plus tablet 768 en pc 1024/1440

Per formaat en pagina: geen zijwaarts scrollen (`scrollWidth === clientWidth`), geen console-fouten, geen afgesneden knoppen of tekst, uitklaplijsten blijven binnen het scherm.

- Invoervelden op de gsm: lettergrootte minstens 16px, anders zoomt iOS Safari in.
- Let op `100vh` (iOS-adresbalk), `backdrop-filter`/`mask-image` (webkit-prefix) en safe-area bij vaste balken.
- Tikdoelen minstens ongeveer 44px hoog.
- De Browser pane is Chromium: echt Safari/WebKit en een echt toestel kunnen we niet testen. Zeg dat eerlijk en vraag Frederic wat enkel op een echte iPhone te zien is (adresbalk, zoomen, tikken, locatie).
- In het verslag aan Frederic zet je welke formaten gecontroleerd zijn en wat niet.

## Overige afspraken

- Frederic pusht zelf via GitHub Desktop en draait SQL zelf in Supabase (niet op een speeldag). Toon eerst, zet pas daarna live.
- Match13, Petanque13 en de andere projecten op de Desktop (WK Pétanque 2028, Teambuilding13, enz.) nooit door elkaar halen.
- `npm run build` overschrijft de `.next`-map van een draaiende dev-server: liever niet bouwen terwijl hij draait, of zeg het erbij.
