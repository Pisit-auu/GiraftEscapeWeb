// นำเข้าจาก 'vitest/config' ไม่ใช่ 'vite' เพราะคีย์ test เป็นของ vitest
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node' },
});
