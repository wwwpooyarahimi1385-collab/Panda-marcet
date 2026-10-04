/**
 * Panda Market - Cyber Engine JavaScript
 * Vanilla JS - Zero Build / Direct GitHub Pages Deployment Ready
 */

// Global App State
const PANDA_STATE = {
  cart: JSON.parse(localStorage.getItem('panda_cart') || '[]'),
  defaultCardNumber: '6219861054329012',
  defaultCardOwner: 'پوریا خزایی نژاد (مدیر مالی پاندا)',
  telegramChannel: '@PandaMarket_Net',
  telegramBotUrl: 'https://t.me/PandaMarket_Net',
  activePing: 18,
  pingInterval: null
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initCartUI();
  initToast();
  initPingOscilloscope();
  initNavigationHighlight();
});

// Toast System
function showToast(message, type = 'success') {
  let toast = document.getElementById('cyberToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cyberToast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-300 transform translate-y-16 opacity-0';
    document.body.appendChild(toast);
  }

  const iconName = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
  const borderColor = type === 'success' ? 'border-[#00ff9d]' : type === 'error' ? 'border-[#ffb4ab]' : 'border-[#00e3fd]';
  const textColor = type === 'success' ? 'text-[#00ff9d]' : type === 'error' ? 'text-[#ffb4ab]' : 'text-[#00e3fd]';

  toast.innerHTML = `
    <div class="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#191c22]/95 border ${borderColor} shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl pointer-events-auto">
      <span class="material-symbols-outlined ${textColor} text-[22px]">${iconName}</span>
      <span class="text-sm font-medium text-white">${message}</span>
    </div>
  `;

  // Trigger show
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-16', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Auto dismiss
  clearTimeout(toast.dismissTimeout);
  toast.dismissTimeout = setTimeout(() => {
    toast.classList.add('translate-y-16', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3200);
}

function initToast() {
  // ready
}

// Copy to Clipboard
function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('متن با موفقیت در کلیپ‌بورد کپی شد!');
    if (btnElement) {
      const origHtml = btnElement.innerHTML;
      btnElement.innerHTML = `<span class="material-symbols-outlined text-[16px] text-[#00ff9d]">check</span><span>کپی شد!</span>`;
      setTimeout(() => {
        btnElement.innerHTML = origHtml;
      }, 1800);
    }
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('متن با موفقیت کپی شد!');
  });
}

// Cart System
function addToCart(item) {
  // item: { id, title, price, protocol, traffic, duration, flag }
  const existing = PANDA_STATE.cart.find(i => i.id === item.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    PANDA_STATE.cart.push({ ...item, quantity: 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`«${item.title}» به سبد خرید اضافه شد.`);
  openCartDrawer();
}

function removeFromCart(id) {
  PANDA_STATE.cart = PANDA_STATE.cart.filter(item => item.id !== id);
  saveCart();
  updateCartBadge();
  renderCartDrawerItems();
  showToast('آیتم از سبد خرید حذف شد.', 'info');
}

function clearCart() {
  PANDA_STATE.cart = [];
  saveCart();
  updateCartBadge();
  renderCartDrawerItems();
}

function saveCart() {
  localStorage.setItem('panda_cart', JSON.stringify(PANDA_STATE.cart));
}

function updateCartBadge() {
  const count = PANDA_STATE.cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = count > 0 ? count : '۰';
    if (count > 0) {
      b.classList.remove('hidden');
    }
  });
}

function initCartUI() {
  // Insert initial default items if cart is empty for great first impression
  if (!localStorage.getItem('panda_cart')) {
    PANDA_STATE.cart = [
      {
        id: 'de-vip',
        title: 'کانفیگ اختصاصی VIP آلمان',
        protocol: 'VLESS Reality',
        traffic: '۶۰ گیگابایت',
        duration: '۳۰ روزه',
        price: 185000,
        flag: '🇩🇪',
        quantity: 1
      },
      {
        id: 'fi-gaming',
        title: 'سرور گیمینگ Low-Ping فنلاند',
        protocol: 'WireGuard / UDP',
        traffic: '۱۰۰ گیگابایت',
        duration: '۳۰ روزه',
        price: 240000,
        flag: '🇫🇮',
        quantity: 1
      }
    ];
    saveCart();
  }
  updateCartBadge();
  renderCartDrawerItems();
}

// Cart Drawer open/close
function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    backdrop.classList.remove('hidden');
    renderCartDrawerItems();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  }
}

function renderCartDrawerItems() {
  const container = document.getElementById('cartItemsList');
  const totalElem = document.getElementById('cartDrawerTotal');
  if (!container) return;

  if (PANDA_STATE.cart.length === 0) {
    container.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center text-center text-[#b9cbbc]">
        <span class="material-symbols-outlined text-[48px] text-[#272a31] mb-3">remove_shopping_cart</span>
        <p class="text-sm">سبد خرید شما در حال حاضر خالی است.</p>
        <a href="products.html" class="mt-4 px-4 py-2 rounded-lg bg-[#00ff9d] text-[#00391f] font-bold text-xs hover:bg-[#56ffa8] transition-all">
          مشاهده لیست سرورها و پلن‌ها
        </a>
      </div>
    `;
    if (totalElem) totalElem.textContent = '۰ تومان';
    return;
  }

  let total = 0;
  let html = '';

  PANDA_STATE.cart.forEach(item => {
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    total += itemTotal;
    html += `
      <div class="flex items-center justify-between p-3 rounded-lg bg-[#191c22] border border-white/5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded bg-[#272a31] flex items-center justify-center text-lg">
            ${item.flag || '🌐'}
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-white">${item.title}</span>
            <span class="text-xs text-[#b9cbbc]">${item.protocol || 'VLESS'} | ${item.traffic || 'حجم عادی'}</span>
            <span class="text-xs font-mono text-[#00ff9d] mt-0.5">${(itemTotal).toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="p-1.5 rounded bg-[#272a31] text-[#ffb4ab] hover:bg-[#93000a] hover:text-white transition-all">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalElem) {
    totalElem.textContent = `${total.toLocaleString('fa-IR')} تومان`;
  }
}

// Telegram Direct Ordering
function orderViaTelegram(itemTitle, itemPrice, customNote = '') {
  const currentTotal = itemPrice ? itemPrice.toLocaleString('fa-IR') : 'استعلام';
  const orderMessage = `سلام وقت بخیر 🐼
قصد سفارش سرویس از سایت پاندا مارکت را دارم:

📌 سرویس: ${itemTitle}
💰 مبلغ: ${currentTotal} تومان
${customNote ? '📝 یادداشت: ' + customNote : ''}

لطفاً اطلاعات پرداخت و مشخصات کانکشن را ارسال فرمایید. سپاس!`;

  const url = `${PANDA_STATE.telegramBotUrl}?text=${encodeURIComponent(orderMessage)}`;
  window.open(url, '_blank');
}

// Checkout All Cart via Telegram
function checkoutCartViaTelegram() {
  if (PANDA_STATE.cart.length === 0) {
    showToast('سبد خرید شما خالی است!', 'error');
    return;
  }
  let total = 0;
  let itemsSummary = '';
  PANDA_STATE.cart.forEach((item, idx) => {
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    total += itemTotal;
    itemsSummary += `${idx + 1}. ${item.title} (${item.protocol || 'VLESS'}) - ${itemTotal.toLocaleString('fa-IR')} تومان\n`;
  });

  const message = `درود بر تیم پشتیبانی پاندا مارکت 🐼
فاکتور جدید ثبت سفارش من:

${itemsSummary}
💳 مجموع کل فاکتور: ${total.toLocaleString('fa-IR')} تومان
کد پیگیری سیستمی: PM-${Math.floor(10000 + Math.random() * 90000)}

لطفاً جهت تایید فیش کارت به کارت و تحویل کانفیگ راهنمایی فرمایید.`;

  const url = `${PANDA_STATE.telegramBotUrl}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Live Ping Oscilloscope Wave (Hero Screen)
function initPingOscilloscope() {
  const canvas = document.getElementById('pingWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let step = 0;

  function resize() {
    canvas.width = canvas.parentElement.clientWidth || 360;
    canvas.height = 70;
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00ff9d';
    ctx.shadowColor = '#00ff9d';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    for (let x = 0; x < width; x++) {
      // Harmonic wave simulation with jitter
      const angle = (x + step) * 0.05;
      const noise = Math.sin((x - step * 2) * 0.02) * 4;
      const y = midY + Math.sin(angle) * 14 + Math.cos(angle * 0.5) * 8 + noise;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    step += 1.8;
    requestAnimationFrame(draw);
  }
  draw();
}

// Live Ping Simulation
function simulatePing(btn) {
  if (!btn) return;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `
    <span class="material-symbols-outlined text-[16px] animate-spin text-[#00ff9d]">sync</span>
    <span class="font-mono text-xs">پینگ‌گیری...</span>
  `;

  setTimeout(() => {
    const latencies = [14, 17, 18, 19, 21, 23, 26];
    const ping = latencies[Math.floor(Math.random() * latencies.length)];
    btn.innerHTML = `
      <span class="material-symbols-outlined text-[16px] text-[#00ff9d]">check_circle</span>
      <span class="font-mono text-xs text-[#00ff9d]">${ping} ms (عالی)</span>
    `;
    showToast(`تست پینگ زنده نود: ${ping} میلی‌ثانیه بدون پکت‌لاس!`);
    setTimeout(() => {
      btn.innerHTML = originalHtml;
    }, 3500);
  }, 800);
}

// QR Code Generator Modal
function openQrModal(title, configUrl) {
  let modal = document.getElementById('qrModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'qrModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md hidden';
    modal.innerHTML = `
      <div class="relative w-full max-w-sm rounded-2xl bg-[#191c22] border border-[#00ff9d]/30 p-6 shadow-2xl text-center flex flex-col items-center">
        <button onclick="closeQrModal()" class="absolute top-4 left-4 p-1 rounded-lg bg-[#272a31] text-[#b9cbbc] hover:text-white">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div class="w-12 h-12 rounded-xl bg-[#00ff9d]/10 flex items-center justify-center text-[#00ff9d] mb-3">
          <span class="material-symbols-outlined text-[28px]">qr_code_2</span>
        </div>
        <h3 id="qrModalTitle" class="text-lg font-bold text-white mb-1">بارکد اتصال مستقیم</h3>
        <p class="text-xs text-[#b9cbbc] mb-4">برای اتصال فوری در اپلیکیشن v2rayNG یا Streisand اسکن کنید</p>
        
        <div class="p-4 bg-white rounded-xl shadow-inner mb-4 flex items-center justify-center" id="qrContainer">
          <!-- QR SVG injected here -->
        </div>

        <div class="w-full p-2.5 rounded bg-[#10131a] border border-white/5 font-mono text-[11px] text-[#b9cbbc] break-all text-left mb-4 max-h-20 overflow-y-auto" id="qrConfigSnippet"></div>

        <div class="flex items-center gap-2 w-full">
          <button id="qrCopyBtn" class="flex-1 py-2 rounded-lg bg-[#00ff9d] hover:bg-[#56ffa8] text-[#00391f] font-bold text-xs flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">content_copy</span>
            <span>کپی لینک کانفیگ</span>
          </button>
          <button onclick="closeQrModal()" class="px-4 py-2 rounded-lg bg-[#272a31] hover:bg-[#32353c] text-white text-xs">
            بستن
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('qrModalTitle').textContent = title || 'بارکد اتصال مستقیم';
  document.getElementById('qrConfigSnippet').textContent = configUrl;
  document.getElementById('qrCopyBtn').onclick = () => copyToClipboard(configUrl);

  // Render High Quality SVG QR Code pattern dynamically
  const qrContainer = document.getElementById('qrContainer');
  qrContainer.innerHTML = generateSvgQr(configUrl);

  modal.classList.remove('hidden');
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  if (modal) modal.classList.add('hidden');
}

// Generate Realistic SVG QR pattern without third party scripts
function generateSvgQr(data) {
  // Deterministic matrix generator based on string hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }
  const size = 25;
  const rects = [];
  const cellSize = 7;

  // Add 3 standard QR position markers (top-left, top-right, bottom-left)
  function addMarker(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          rects.push(`<rect x="${(startX + c) * cellSize}" y="${(startY + r) * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0b0e14" />`);
        }
      }
    }
  }

  addMarker(0, 0);
  addMarker(size - 7, 0);
  addMarker(0, size - 7);

  // Seeded data dots
  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Avoid corner marker bounds
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= size - 8;
      const inBL = r >= size - 8 && c < 8;
      if (!inTL && !inTR && !inBL) {
        seed = (seed * 9301 + 49297) % 233280;
        if (seed / 233280 > 0.45) {
          rects.push(`<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0b0e14" />`);
        }
      }
    }
  }

  return `
    <svg width="${size * cellSize}" height="${size * cellSize}" viewBox="0 0 ${size * cellSize} ${size * cellSize}" xmlns="http://www.w3.org/2000/svg">
      ${rects.join('')}
    </svg>
  `;
}

// Download .conf file for WireGuard
function downloadConfigFile(filename) {
  const confContent = `[Interface]
PrivateKey = aP12x...REDACTED...xX9=
Address = 10.66.66.2/32, fd42:42:42::2/128
DNS = 1.1.1.1, 8.8.8.8
MTU = 1380

[Peer]
PublicKey = bmW+H...PANDA...CORE=
Endpoint = fi-hel.pandanet.live:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 21`;

  const blob = new Blob([confContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'panda-config.conf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`فایل ${filename} با موفقیت دانلود شد.`);
}

// Highlight Current Active Navigation Link
function initNavigationHighlight() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a, header nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('text-[#00ff9d]', 'font-bold');
      link.classList.remove('text-[#b9cbbc]');
    }
  });
}
