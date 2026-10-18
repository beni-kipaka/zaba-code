'use strict';
(() => {
if (top !== self) { try { top.location = self.location; } catch { document.documentElement.remove(); } }
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const WA = '243824775595', MAIL = 'benikipaka243@gmail.com';
// SHA-256 de "email:motdepasse" (le mot de passe n'apparaît jamais en clair dans le code)
const AUTH = '43579b45d9bbcc5729bb6273a1bc93e2a5141f0a6382c00868f66a1a5b9f6b17';
const db = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('zc_' + k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('zc_' + k, JSON.stringify(v)); return true; } catch { return false; } }
};
function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) k === 'class' ? e.className = v : k.startsWith('on') ? e.addEventListener(k.slice(2), v) : e.setAttribute(k, v);
  kids.forEach(c => e.append(c)); return e;
}
const clean = (s, n = 300) => String(s || '').replace(/[<>]/g, '').trim().slice(0, n);
const okMail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const fmt = t => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3200); };

/* Thème clair / sombre */
const root = document.documentElement;
root.dataset.theme = localStorage.getItem('zc_theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
$('#theme').onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('zc_theme', root.dataset.theme); };

/* Navigation */
const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
const setMenu = o => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); };
burger.onclick = () => setMenu(!menu.classList.contains('open'));
$$('a', menu).forEach(a => a.onclick = () => setMenu(false));
addEventListener('scroll', () => {
  nav.classList.toggle('s', scrollY > 30); $('#mbar').classList.toggle('show', scrollY > 520);
  const h = document.documentElement; $('#progress').style.width = (scrollY / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive: true });
$('#yr').textContent = new Date().getFullYear();
const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('a', menu).forEach(a => a.classList.toggle('act', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
['services', 'process', 'blog', 'faq', 'contact'].forEach(id => spy.observe($('#' + id)));

/* Animations d'apparition + compteurs */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
  $$('[data-n]', e.target).forEach(c => { const n = +c.dataset.n; let i = 0; const s = setInterval(() => { i += Math.ceil(n / 30); if (i >= n) { i = n; clearInterval(s); } c.textContent = i; }, 35); });
}), { threshold: .15 });
$$('.rv').forEach(e => io.observe(e));

/* Partage */
const url = location.origin.startsWith('http') ? location.origin + location.pathname : 'https://zabacode.com/';
function shareBtns(box, link, title) {
  const u = encodeURIComponent(link), t = encodeURIComponent(title); box.textContent = '';
  [['WhatsApp', `https://wa.me/?text=${t}%20${u}`], ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`], ['X', `https://twitter.com/intent/tweet?text=${t}&url=${u}`], ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`]]
    .forEach(([n, h]) => box.append(el('a', { href: h, target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Partager sur ' + n }, n)));
  box.append(el('button', { type: 'button', onclick: async () => { try { navigator.share ? await navigator.share({ title, url: link }) : (await navigator.clipboard.writeText(link), toast('Lien copié ✓')); } catch {} } }, 'Copier / Partager'));
}
shareBtns($('#shareBtns'), url, 'ZabaCode – Coder pour durer');

/* Articles */
const seed = [
  { id: 'a1', title: '5 raisons de faire créer votre site par une agence', cat: 'Développement', excerpt: 'Un site professionnel est votre meilleur commercial, ouvert 24h/24.', body: 'Un site web n’est pas une simple vitrine : c’est un outil de vente.\n\nUne agence vous apporte une conception sur mesure, un code propre, un référencement soigné et une sécurité maîtrisée.\n\nRésultat : plus de crédibilité, plus de clients et un site qui dure.', date: Date.now() - 6e8 },
  { id: 'a2', title: 'Identité visuelle : pourquoi la cohérence rapporte', cat: 'Design', excerpt: 'Logo, couleurs, typographie : les bases d’une marque mémorable.', body: 'Une marque cohérente est reconnue en quelques secondes.\n\nDéfinissez une palette, deux typographies et des règles d’usage, puis appliquez-les partout : site, réseaux sociaux, documents.', date: Date.now() - 3e8 },
  { id: 'a3', title: 'Sécurité web : les réflexes essentiels', cat: 'Sécurité', excerpt: 'HTTPS, mises à jour, mots de passe forts : protégez votre présence en ligne.', body: 'La majorité des attaques exploitent des failles simples : logiciels non mis à jour, mots de passe faibles, formulaires non validés.\n\nActivez HTTPS, sauvegardez régulièrement et faites auditer votre site.', date: Date.now() - 1e8 }
];
if (!db.get('posts')) db.set('posts', seed);
const si = s => /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s || '') ? s : '';
const posts = () => db.get('posts', []).sort((a, b) => b.date - a.date);
function renderPosts() {
  const box = $('#posts'); box.textContent = ''; const l = posts();
  if (!l.length) box.append(el('p', { class: 'empty' }, 'Aucun article pour le moment.'));
  l.forEach((p, i) => box.append(el('button', { class: 'post rv in', type: 'button', onclick: () => openPost(p) },
    el('div', { class: 'cover' }, si(p.img) ? el('img', { src: si(p.img), alt: p.title, loading: 'lazy' }) : p.cat[0]), el('div', { class: 'pb' }, el('span', { class: 'tag' }, p.cat), el('h3', {}, p.title), el('p', {}, p.excerpt), el('small', {}, fmt(p.date) + ' · Lire →')))));
}
const openM = m => { m.hidden = false; document.body.style.overflow = 'hidden'; };
const closeM = () => { $$('.modal').forEach(m => m.hidden = true); if ($('#dash').hidden) document.body.style.overflow = ''; };
function openPost(p) {
  $('#rCover').className = 'r-cover cover'; const rc = $('#rCover'); rc.textContent = ''; si(p.img) ? rc.append(el('img', { src: si(p.img), alt: p.title })) : rc.textContent = p.cat[0];
  $('#rCat').textContent = p.cat; $('#rTitle').textContent = p.title; $('#rMeta').textContent = fmt(p.date) + ' · ZabaCode';
  const t = $('#rText'); t.textContent = ''; p.body.split(/\n\s*\n/).forEach(x => t.append(el('p', {}, x)));
  shareBtns($('#rShare'), url + '#blog', p.title); openM($('#reader'));
}
$$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.hasAttribute('data-close')) closeM(); }));
addEventListener('keydown', e => e.key === 'Escape' && closeM());
renderPosts();

/* Anti-spam simple : honeypot + délai */
const rate = (k, ms) => { const l = db.get('rl_' + k, 0); if (Date.now() - l < ms) return false; db.set('rl_' + k, Date.now()); return true; };

/* Commande → WhatsApp + sauvegarde */
$$('[data-svc]').forEach(a => a.addEventListener('click', () => { $('#orderForm').service.value = a.dataset.svc; }));
$('#orderForm').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, n = $('#orderNote'); if (f.website.value) return;
  const d = { name: clean(f.name.value, 80), phone: clean(f.phone.value, 20), email: clean(f.email.value, 100), service: f.service.value, budget: f.budget.value, msg: clean(f.msg.value, 1200) };
  let bad = false; [['name', d.name.length < 2], ['phone', d.phone.replace(/\D/g, '').length < 8], ['email', !okMail(d.email)], ['msg', d.msg.length < 10]].forEach(([k, b]) => { f[k].classList.toggle('bad', b); bad = bad || b; });
  if (bad) { n.textContent = 'Merci de compléter correctement les champs en surbrillance.'; return; }
  if (!rate('order', 15000)) { n.textContent = 'Veuillez patienter quelques secondes.'; return; }
  const o = db.get('orders', []); o.push({ ...d, id: 'o' + Date.now(), date: Date.now() }); db.set('orders', o);
  const txt = `Bonjour ZabaCode, nouvelle commande :\n• Nom : ${d.name}\n• Tél : ${d.phone}\n• E-mail : ${d.email}\n• Service : ${d.service}\n• Budget : ${d.budget}\n• Projet : ${d.msg}`;
  open(`https://wa.me/${WA}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
  n.innerHTML = ''; n.append('Commande enregistrée ✓ Pas de WhatsApp ? ', el('a', { href: `mailto:${MAIL}?subject=${encodeURIComponent('Commande ' + d.service)}&body=${encodeURIComponent(txt)}` }, 'envoyer par e-mail'));
  f.reset(); toast('Merci ! Nous vous répondons sous 24 h.');
});

/* Contact */
const cf = $('#contactForm');
const cRead = () => { const d = { name: clean(cf.name.value, 80), email: clean(cf.email.value, 100), topic: cf.topic.value, msg: clean(cf.msg.value, 1200) }; let bad = false;
  [['name', d.name.length < 2], ['email', !okMail(d.email)], ['msg', d.msg.length < 10]].forEach(([k, b]) => { cf[k].classList.toggle('bad', b); bad = bad || b; });
  $('#contactNote').textContent = bad ? 'Merci de compléter les champs en surbrillance.' : ''; return bad || cf.website.value ? null : d; };
const cTxt = d => `Bonjour ZabaCode,\n• Nom : ${d.name}\n• E-mail : ${d.email}\n• Sujet : ${d.topic}\n\n${d.msg}`;
cf.addEventListener('submit', e => { e.preventDefault(); const d = cRead(); if (!d || !rate('contact', 10000)) return; open(`https://wa.me/${WA}?text=${encodeURIComponent(cTxt(d))}`, '_blank', 'noopener'); cf.reset(); toast('Message prêt dans WhatsApp ✓'); });
$('#contactMail').onclick = () => { const d = cRead(); if (d) location.href = `mailto:${MAIL}?subject=${encodeURIComponent(d.topic + ' – ' + d.name)}&body=${encodeURIComponent(cTxt(d))}`; };

/* Newsletter */
$('#newsForm').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, n = $('#newsNote'), m = clean(f.email.value, 100).toLowerCase(); if (f.website.value) return;
  if (!okMail(m)) { n.textContent = 'E-mail invalide.'; return; }
  const s = db.get('subs', []); if (s.some(x => x.email === m)) { n.textContent = 'Vous êtes déjà abonné(e) ✓'; return; }
  s.push({ email: m, date: Date.now() }); db.set('subs', s); f.reset(); n.textContent = 'Merci ! Inscription confirmée ✓'; toast('Bienvenue dans la newsletter ZabaCode');
});

/* ===== Admin ===== */
const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
const sess = () => Date.now() < +sessionStorage.getItem('zc_s');
$('#adminOpen').onclick = () => sess() ? showDash() : openM($('#login'));
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, n = $('#loginNote'), lock = db.get('lock', 0);
  if (Date.now() < lock) { n.textContent = 'Trop de tentatives. Réessayez dans ' + Math.ceil((lock - Date.now()) / 60000) + ' min.'; return; }
  if (!crypto.subtle) { n.textContent = 'Connexion HTTPS requise.'; return; }
  const h = await sha(f.email.value.trim().toLowerCase() + ':' + f.pw.value); f.pw.value = '';
  if (h === AUTH) { db.set('fails', 0); sessionStorage.setItem('zc_s', Date.now() + 30 * 60000); n.textContent = ''; closeM(); showDash(); return; }
  const k = db.get('fails', 0) + 1; db.set('fails', k); if (k >= 5) { db.set('lock', Date.now() + 5 * 60000); db.set('fails', 0); }
  n.textContent = 'Identifiants incorrects.';
});
function showDash() { $('#dash').hidden = false; document.body.style.overflow = 'hidden'; renderDash(); }
$('#logout').onclick = () => { sessionStorage.removeItem('zc_s'); $('#dash').hidden = true; document.body.style.overflow = ''; };
$$('.side nav button').forEach(b => b.onclick = () => { $$('.side nav button,.tab').forEach(x => x.classList.remove('on')); b.classList.add('on'); $('#' + b.dataset.tab).classList.add('on'); });
function renderDash() {
  if (!sess()) { $('#logout').click(); return; }
  const P = $('#dPosts'), O = $('#dOrders'), S = $('#dSubs'); [P, O, S].forEach(x => x.textContent = '');
  posts().forEach(p => P.append(el('div', { class: 'item' }, si(p.img) ? el('img', { src: si(p.img), alt: '', class: 'th' }) : '', el('div', {}, el('b', {}, p.title), el('small', {}, p.cat + ' · ' + fmt(p.date))),
    el('div', { class: 'acts' }, el('button', { onclick: () => { const f = $('#postForm'); ['id', 'title', 'cat', 'excerpt', 'body'].forEach(k => f[k].value = p[k]); setImg(si(p.img)); scrollTo(0, 0); $('.d-main').scrollTo({ top: 0, behavior: 'smooth' }); } }, 'Modifier'),
      el('button', { onclick: () => { if (confirm('Supprimer cet article ?')) { db.set('posts', db.get('posts', []).filter(x => x.id !== p.id)); renderPosts(); renderDash(); toast('Article supprimé'); } } }, 'Supprimer')))));
  const o = db.get('orders', []).sort((a, b) => b.date - a.date);
  o.forEach(x => O.append(el('div', { class: 'item' }, el('div', {}, el('b', {}, x.name + ' — ' + x.service), el('small', {}, `${x.phone} · ${x.email} · ${x.budget} · ${fmt(x.date)}`), el('small', {}, x.msg)),
    el('div', { class: 'acts' }, el('button', { onclick: () => open('https://wa.me/' + x.phone.replace(/\D/g, ''), '_blank', 'noopener') }, 'WhatsApp'), el('button', { onclick: () => { db.set('orders', db.get('orders', []).filter(y => y.id !== x.id)); renderDash(); } }, 'Supprimer')))));
  const s = db.get('subs', []); s.forEach(x => S.append(el('div', { class: 'item' }, el('div', {}, el('b', {}, x.email), el('small', {}, fmt(x.date))))));
  if (!o.length) O.append(el('p', { class: 'muted' }, 'Aucune commande.')); if (!s.length) S.append(el('p', { class: 'muted' }, 'Aucun abonné.'));
  $('#cO').textContent = o.length; $('#cS').textContent = s.length;
}
$('#postForm').addEventListener('submit', e => {
  e.preventDefault(); const f = e.target; if (!sess()) return renderDash();
  const l = db.get('posts', []), id = f.id.value || 'a' + Date.now(), old = l.find(x => x.id === id);
  const p = { id, title: clean(f.title.value, 120), cat: f.cat.value, excerpt: clean(f.excerpt.value, 200), body: String(f.body.value).replace(/[<>]/g, '').slice(0, 12000), date: old ? old.date : Date.now(), img: curImg };
  if (!db.set('posts', old ? l.map(x => x.id === id ? p : x) : [...l, p])) { toast('Stockage plein : utilisez une image plus légère.'); return; } f.reset(); setImg(''); f.id.value = ''; renderPosts(); renderDash(); toast(old ? 'Article mis à jour ✓' : 'Article publié ✓');
});
let curImg = '';
function setImg(v) { curImg = v; const p = $('#imgPrev'); p.textContent = ''; if (v) p.append(el('img', { src: v, alt: 'Aperçu' }), el('button', { type: 'button', onclick: () => setImg('') }, 'Retirer')); }
$('#postReset').addEventListener('click', () => setImg(''));
$('#postImg').addEventListener('change', e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8e6) { toast('Image JPG, PNG ou WebP (8 Mo max).'); return; }
  const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => {
    const s = Math.min(1, 1100 / im.width), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); setImg(c.toDataURL('image/jpeg', .78)); toast('Image ajoutée ✓'); };
    im.onerror = () => toast('Image illisible.'); im.src = r.result; }; r.readAsDataURL(file);
});
$('#exportBtn').onclick = () => {
  const b = new Blob([JSON.stringify({ posts: db.get('posts', []), orders: db.get('orders', []), subs: db.get('subs', []) }, null, 2)], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(b), download: 'zabacode-export.json' }); a.click(); URL.revokeObjectURL(a.href);
};
setInterval(() => { if (!$('#dash').hidden && !sess()) { toast('Session expirée'); $('#logout').click(); } }, 30000);
})();
