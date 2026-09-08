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
- `public/assets/` — รูปทั้งหมดจากเกมต้นฉบับ

## Deploy

เว็บนี้เป็น static site ล้วน

1. เข้า https://vercel.com/new แล้วเลือก repo `Pisit-auu/GiraftEscapeWeb`
2. Framework Preset: Vite (Vercel ตรวจให้เอง) — Root Directory ปล่อยเป็นรากของ repo
3. กด Deploy

หลังจากนั้น push ขึ้น `main` ทุกครั้ง Vercel จะ build และ deploy ให้อัตโนมัติ

## ที่มาของค่าเกม

ค่า HP / damage / attack speed / ความเร็ว ของตัวละครทุกตัวและ config ทั้ง 3 ด่าน
อยู่ใน `src/game/data.ts` ถอดมาจากโค้ด Java ต้นฉบับโดยตรง
ถ้าจะปรับความยาก แก้ `spawnIntervalMs` ของด่านนั้นในไฟล์เดียวกัน
