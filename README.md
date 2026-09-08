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
