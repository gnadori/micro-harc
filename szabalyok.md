# micro:harc

## A játék célja

A lehető legjobb robotok vívjanak meg egymással egy arénában.

## A robotokra vonatkozó szabályok

- **Méret:** Maximum 160 mm x 160 mm x 160 mm  
- **Hardver:** micro:Bit mikrokontroller, Drive:Bit motorvezérlővel  
  - Más, a bírók által jóváhagyott vezérlő is használható  
- **Motorok:** Bármilyen és bármennyi motor használható  
- **Távirányítás:**
  - A robotot egy másik micro:Bittel kell irányítani
  - Az irányításhoz más elektronika nem használható
  - A két micro:Bit között a megadott csatornán kell folynia a kommunikációnak
  - A verseny során nem válthatnak csatornát
  - Az irányításnak képesnek kell lennie a robot indítására és leállítására
- **Tiltott eszközök:**
  - Folyadékok
  - Nyílt láng
  - Halálsugár
- **Energiaellátás:**  
  - A robotoknak bolti forgalomban kapható elemekkel kell működniük

---

## A pálya felépítése

- **A pálya mérete:** 100 cm × 100 cm-es négyzet alakú aréna (3–5 cm magas dobogó, alatta puha felülettel a robotok védelmére).
- **Falak és nyitott oldalak:** Két szemközti oldalon 8–10 cm magas fal határolja, a másik két szemközti oldal nyitott (**kieső zóna**).
- **Indítóterületek:** A két fallal határolt oldal mentén, egymással szemben helyezkednek el (így rajtnál a két nyitott oldal balra és jobbra esik).

```text
      =========== FAL ===========
     :           [R1]            :
  NYITOTT                     NYITOTT
     :           [R2]            :
      =========== FAL ===========
```

---

## A mérkőzés menete

1. **Robot és rádiós kommunikáció ellenőrzés:**  
   A két versenyző bemutatja a robotját a bíróknak, valamint azt, hogy miként tudja irányítani.

2. **A robotok elhelyezése** az indítóterületen (a két szemközti fal mellett).

3. **Rajtjelre** a robotok elindulhatnak az indítóterületről.

4. **A mérkőzés hossza és menetek:**  
   - Legfeljebb **3 percig** tart, vagy addig, amíg valamelyik robot **2 menetet megnyer**, illetve tartósan mozgásképtelenné válik.
   - **Kiesés (kilökés):** Ha egy robot leesik a pálya nyitott oldalán (akár kilökték, akár magától hajtott le), az ellenfél nyeri az adott menetet, majd a robotok visszaállnak az indítóterületre.

5. **Pontozás:**  
   - Ha a 3 perc végén egyik robot sem szerzett 2 nyert menetet és a menetek állása döntetlen (pl. 0–0 vagy 1–1), a bírók pontozása dönt.
   - Ha a 3 perc végén valamelyik robot 1–0-ra vezet menetben, az a robot nyer.

---

## Pontozás

- **Aktív ütközés:** 1 pont  
  *Egyértelműen az egyik robot ment neki a másiknak; egy akció = egy pont*

- **Emelés:** 3 pont  
  *Ha az egyik robot legalább részben felemeli a másikat*

- **Sérülés okozása:** 2 pont  
  *Ha az egyik robot tevékenysége miatt a másik része leesik vagy jól láthatóan megrongálódik*

---

## Mozgásképtelenség

- Akkor áll fenn, ha a robot **tartósan nem képes helyváltoztatásra**.
- A bíró **rászámolhat** a robotra, hogy megállapítsa a mozgásképtelenséget.
