# Giraffe Escape (เว็บ)

เวอร์ชันเว็บของเกม Giraffe Escape ต้นฉบับเขียนด้วย Java Swing
อยู่ที่ https://github.com/Pisit-auu/GiraffeEscape

## รัน

```bash
npm install
npm run dev      # เปิด dev server
npm test         # รันเทส
npm run build    # build ลง dist/
```

## โครงสร้าง

- `src/engine/` — loop, โหลด asset, วาด, ตรวจการชน (ไม่ผูกกับเกมนี้)
- `src/game/` — ตรรกะเกมล้วน ไม่แตะ DOM จึงทดสอบได้ด้วย vitest
- `src/screens/` — ต่อตรรกะเข้ากับ DOM/canvas
- `public/assets/` — รูปทั้งหมดของเกม (ชื่อไฟล์ตรงกับเกมต้นฉบับ ดูหัวข้อ "ที่มาของรูป")

ข้อยกเว้นเดียวของกฎ "`src/game/` ไม่แตะ DOM": `src/game/progress.ts` เรียก `localStorage`
ตรงๆ เพื่อจำด่านที่ปลดล็อกไว้ ยอมให้ผิดกฎเพราะเป็นแค่การอ่าน/เขียนค่าเดียวแบบ
try/catch ครอบทุกจุด (โหมดส่วนตัวหรือ storage เต็มก็ไม่ทำให้เกมพัง แค่ปลดล็อกใหม่รอบหน้า)
และมีเทสคลุมพฤติกรรมนี้ครบแล้ว จึงไม่คุ้มที่จะแยกออกเป็น interface เพิ่มเพื่อความบริสุทธิ์ของกฎเฉยๆ

## Deploy

เว็บนี้เป็น static site ล้วน

1. เข้า https://vercel.com/new แล้วเลือก repo `Pisit-auu/GiraftEscapeWeb`
2. Framework Preset: Vite (Vercel ตรวจให้เอง) — Root Directory ปล่อยเป็นรากของ repo
3. กด Deploy

หลังจากนั้น push ขึ้น `main` ทุกครั้ง Vercel จะ build และ deploy ให้อัตโนมัติ

### เรื่อง cache ของ asset

`vercel.json` แยก cache เป็นสองแบบโดยตั้งใจ

- `.js` / `.css` — Vite ใส่ hash ในชื่อไฟล์ให้อยู่แล้ว (`index-BTudJNJh.js`) ชื่อเปลี่ยนทุกครั้งที่เนื้อหาเปลี่ยน จึง cache แบบ `immutable` หนึ่งปีได้ปลอดภัย
- `.png` — รูปเกมถูกคัดลอกจาก `public/assets/` โดยชื่อไม่เปลี่ยน ถ้า cache แบบ `immutable` ด้วย วันที่แก้รูปแล้ว deploy ใหม่ ผู้เล่นเก่าจะเห็นรูปเดิมค้างได้ถึงหนึ่งปี และสั่ง refresh ก็ไม่หาย จึงให้ cache 1 ชั่วโมงแล้ว revalidate เบื้องหลังแทน

## ที่มาของรูป

รูปทั้งหมดใน `public/assets/` วาดด้วยโค้ด Java2D ที่อยู่ใน repo ต้นฉบับ
[`GiraffeEscape/tools/art/`](https://github.com/Pisit-auu/GiraffeEscape/tree/master/tools/art)
ใช้ชุดเดียวกับเวอร์ชัน Java ยกเว้น `startpage.png` ที่เว็บวาดเต็มเวที 1600x800
(เวอร์ชัน Java ใช้ 1000x800) จึงต้องสร้างแยก ถ้าแก้รูปที่ต้นฉบับแล้ว ให้สร้างใหม่สำหรับเว็บแบบนี้:

```bash
# รันในโฟลเดอร์ GiraffeEscape/tools/art (ต้องมี JDK และฟอนต์ Noto Sans Thai)
javac -d build Art.java Scenes.java
java -cp build Art    <path>/GiraftEscapeWeb/public/assets
java -cp build Scenes <path>/GiraftEscapeWeb/public/assets web   # "web" = หน้าเริ่มขนาด 1600x800
```

## ที่มาของค่าเกม

ค่า HP / damage / attack speed / ความเร็ว ของตัวละครทุกตัวและ config ทั้ง 3 ด่าน
อยู่ใน `src/game/data.ts` ถอดมาจากโค้ด Java ต้นฉบับโดยตรง
ถ้าจะปรับความยาก แก้ `spawnIntervalMs` ของด่านนั้นในไฟล์เดียวกัน
