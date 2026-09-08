import './style.css';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('ไม่พบ canvas #game');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('เบราว์เซอร์นี้ไม่รองรับ canvas 2d');

ctx.fillStyle = '#264d1f';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#fff';
ctx.font = 'bold 48px system-ui, sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Giraffe Escape', canvas.width / 2, canvas.height / 2);
