(() => {
  'use strict';

  const settings = window.LEEACH_SETTINGS;
  const products = Array.isArray(window.LEEACH_CATALOG) ? window.LEEACH_CATALOG : [];
  const routes = [...document.querySelectorAll('[data-route]')];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const lineNames = {arabe:'Perfumería árabe',disenador:'De diseñador',nicho:'Perfumería nicho'};
  const audienceNames = {masculino:'Masculino',femenino:'Femenino',unisex:'Unisex'};
  const storageKey = 'leeach_inspiration_selection_v1';
  const toText = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeRead = () => { try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; } };
  const safeWrite = value => { try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* private mode: in-memory selection */ } };
  let cart = Array.isArray(safeRead()) ? safeRead().filter(row => products.some(p => p.id === row.id) && settings.decantSizes.includes(row.size) && Number.isInteger(row.qty) && row.qty > 0) : [];
  let selectedSize = 3;
  let routeName = '';
  let toastTimer;
  let quizStep = 0;
  let quizAnswers = {};
  let lastFocus = null;

  const toast = message => {
    const element = $('#toast');
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 3200);
  };

  const productCard = product => `
    <article class="product-card">
      <a class="product-media" href="#/producto/${encodeURIComponent(product.id)}" aria-label="Ver perfil ${toText(product.name)}">
        <img loading="lazy" src="${toText(product.image)}" alt="Fotografía editorial ilustrativa para el perfil ${toText(product.name)}" style="object-position:${toText(product.imagePosition)}" width="1024" height="1536">
        <span class="product-badge">Perfil de ejemplo</span>
      </a>
      <div class="product-body"><div class="product-overline">${toText(lineNames[product.category])} / ${toText(audienceNames[product.audience])}</div>
        <h3>${toText(product.name)}</h3><p>${product.notes.map(toText).join(' · ')}</p>
        <div class="product-bottom"><span>Sin precio ni stock</span><a href="#/producto/${encodeURIComponent(product.id)}">Ver perfil ↗</a></div>
      </div>
    </article>`;

  const renderHome = () => {
    $('#home-preview').innerHTML = products.slice(0,3).map(productCard).join('');
  };

  const filterElements = {
    search:$('#search-input'), line:$('#line-filter'), audience:$('#audience-filter'),
    family:$('#family-filter'), sort:$('#sort-filter')
  };

  const resetFilters = () => {
    filterElements.search.value = '';
    filterElements.line.value = 'todos';
    filterElements.audience.value = 'todos';
    filterElements.family.value = 'todos';
    filterElements.sort.value = 'relevancia';
    renderCatalog();
  };

  const renderCatalog = () => {
    const term = filterElements.search.value.trim().toLocaleLowerCase('es');
    const line = filterElements.line.value;
    const audience = filterElements.audience.value;
    const family = filterElements.family.value;
    const matches = products.filter(p =>
      (line === 'todos' || p.category === line) &&
      (audience === 'todos' || p.audience === audience) &&
      (family === 'todos' || p.family === family) &&
      (!term || [p.name,p.description,lineNames[p.category],audienceNames[p.audience],...p.notes].join(' ').toLocaleLowerCase('es').includes(term))
    );
    if (filterElements.sort.value === 'nombre') matches.sort((a,b) => a.name.localeCompare(b.name,'es'));
    if (filterElements.sort.value === 'linea') matches.sort((a,b) => a.category.localeCompare(b.category,'es'));
    $('#catalog-grid').innerHTML = matches.map(productCard).join('');
    $('#result-count').textContent = `${matches.length} ${matches.length === 1 ? 'perfil ilustrativo' : 'perfiles ilustrativos'}`;
    $('#catalog-empty').hidden = matches.length > 0;
  };

  const detailMarkup = product => `
    <div class="detail-media"><img src="${toText(product.image)}" alt="Fotografía editorial ilustrativa para ${toText(product.name)}" style="object-position:${toText(product.imagePosition)}" width="1024" height="1536"></div>
    <div class="detail-copy"><div class="detail-breadcrumb"><a href="#/catalogo">Fragancias</a> / ${toText(product.name)}</div>
      <div class="eyebrow">PERFIL DE INSPIRACIÓN · NO COMERCIAL</div><h1>${toText(product.name)}</h1>
      <p>${toText(product.description)}</p>
      <div class="detail-meta"><span>${toText(lineNames[product.category])}</span><span>${toText(audienceNames[product.audience])}</span><span>${toText(product.family)}</span></div>
      <div class="detail-label">Notas que inspiran este perfil</div><p class="detail-notes">${product.notes.map(toText).join(' · ')}</p>
      <div class="detail-label">¿Qué tamaño te interesaría?</div>
      <div class="variant-options" role="group" aria-label="Seleccionar tamaño de decant">${settings.decantSizes.map(size => `<button type="button" class="variant-btn ${size === selectedSize ? 'selected' : ''}" data-action="size" data-size="${size}" aria-pressed="${size === selectedSize}">${size} ml</button>`).join('')}</div>
      <div class="detail-price">Precio y disponibilidad pendientes de confirmar para cada presentación.</div>
      <div class="detail-actions"><button class="button button-dark" type="button" data-action="add" data-id="${toText(product.id)}">Añadir a mi selección <span>+</span></button></div>
      <p class="detail-disclaimer">Este es un perfil conceptual, no un perfume real en venta. Añadirlo guarda únicamente una preferencia local; no genera una compra ni reserva.</p>
    </div>`;

  const renderDetail = id => {
    const product = products.find(p => p.id === id);
    if (!product) return false;
    selectedSize = settings.decantSizes[0];
    $('#product-detail').innerHTML = detailMarkup(product);
    document.title = `${product.name} · Inspiración | LEE-ACH`;
    return true;
  };

  const parseRoute = () => {
    const hash = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
    const [path,query = ''] = hash.split('?');
    if (!path) return {name:'home',query:new URLSearchParams()};
    if (path.startsWith('producto/')) return {name:'producto',id:decodeURIComponent(path.slice(9)),query:new URLSearchParams(query)};
    if (['catalogo','decants','recomendador','guia','nosotros','contacto'].includes(path)) return {name:path,query:new URLSearchParams(query)};
    return {name:'notfound',query:new URLSearchParams()};
  };

  const closeMenu = () => {
    $('#mobile-nav').hidden = true;
    $('#menu-trigger').setAttribute('aria-expanded','false');
    $('#menu-trigger').setAttribute('aria-label','Abrir menú');
  };

  const navigate = () => {
    const route = parseRoute();
    if (route.name === 'producto' && !renderDetail(route.id)) route.name = 'notfound';
    routes.forEach(view => { view.hidden = view.dataset.route !== route.name; });
    $$('.desktop-nav a').forEach(link => {
      const active = link.dataset.nav === route.name || (route.name === 'producto' && link.dataset.nav === 'catalogo');
      link.classList.toggle('active',active);
      if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
    });
    if (route.name === 'catalogo') {
      if (routeName !== 'catalogo' || route.query.has('linea')) {
        resetFilters();
        const line = route.query.get('linea');
        if (['arabe','disenador','nicho'].includes(line)) filterElements.line.value = line;
      }
      renderCatalog();
    }
    if (route.name === 'recomendador' && routeName !== 'recomendador') { quizStep = 0; quizAnswers = {}; renderQuiz(); }
    if (route.name !== 'producto') document.title = `${route.name === 'home' ? 'Tu esencia, tu sello' : ({catalogo:'Fragancias',decants:'Decants',recomendador:'Descubre tu aroma',guia:'Journal',nosotros:'Nuestra esencia',contacto:'Contacto',notfound:'Página no encontrada'}[route.name] || '')} | LEE-ACH`;
    routeName = route.name;
    closeMenu();
    closeCart();
    window.scrollTo({top:0,behavior:'instant'});
    $('#contenido').focus({preventScroll:true});
  };

  const saveCart = () => {
    safeWrite(cart);
    renderCart();
  };

  const openCart = () => {
    lastFocus = document.activeElement;
    $('#drawer-backdrop').hidden = false;
    $('#cart-drawer').hidden = false;
    document.body.classList.add('no-scroll');
    $('#close-cart').focus();
  };

  function closeCart() {
    const wasOpen = !$('#cart-drawer').hidden;
    $('#drawer-backdrop').hidden = true;
    $('#cart-drawer').hidden = true;
    document.body.classList.remove('no-scroll');
    if (wasOpen && lastFocus instanceof HTMLElement && lastFocus.isConnected) lastFocus.focus();
  }

  const renderCart = () => {
    const count = cart.reduce((sum,item) => sum + item.qty, 0);
    $('#cart-count').textContent = count;
    $('#cart-count').hidden = count === 0;
    $('#drawer-count').textContent = `(${count})`;
    $('#copy-selection').disabled = count === 0;
    $('#clear-cart').disabled = count === 0;
    $('#cart-items').innerHTML = cart.length ? cart.map(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return '';
      const key = `${item.id}|${item.size}`;
      return `<div class="cart-row"><img src="${toText(product.image)}" alt="" width="75" height="100" loading="lazy"><div><h3>${toText(product.name)}</h3><p>Perfil ilustrativo · ${item.size} ml</p><p>Sin precio confirmado</p><div class="cart-qty"><button data-action="dec" data-key="${toText(key)}" aria-label="Reducir cantidad">−</button><span>${item.qty}</span><button data-action="inc" data-key="${toText(key)}" aria-label="Aumentar cantidad">+</button></div></div><button data-action="remove" data-key="${toText(key)}" aria-label="Eliminar ${toText(product.name)}">×</button></div>`;
    }).join('') : `<div class="cart-empty"><div><h3>Tu selección está vacía.</h3><p>Guarda los perfiles que despiertan tu curiosidad.</p><a class="text-link" href="#/catalogo">Explorar perfiles ↗</a></div></div>`;
  };

  const addToCart = id => {
    const product = products.find(p => p.id === id);
    if (!product || !settings.decantSizes.includes(selectedSize)) return;
    const row = cart.find(item => item.id === id && item.size === selectedSize);
    if (row) row.qty = Math.min(row.qty + 1, 99);
    else cart.push({id,size:selectedSize,qty:1});
    saveCart();
    toast('Añadido a tu selección de inspiración. No es una reserva.');
    openCart();
  };

  const updateCart = (action,key) => {
    const [id,sizeText] = key.split('|');
    const size = Number(sizeText);
    const index = cart.findIndex(item => item.id === id && item.size === size);
    if (index < 0) return;
    if (action === 'remove') cart.splice(index,1);
    else if (action === 'inc') cart[index].qty = Math.min(99,cart[index].qty + 1);
    else if (action === 'dec') { cart[index].qty -= 1; if (cart[index].qty <= 0) cart.splice(index,1); }
    saveCart();
  };

  const copySelection = async () => {
    if (!cart.length) return;
    const lines = ['Mi selección de inspiración LEE-ACH (no es un pedido):',...cart.map(item => {
      const p = products.find(product => product.id === item.id);
      return `• ${p?.name || item.id} — ${item.size} ml × ${item.qty}`;
    }),'','Perfiles ilustrativos. No representan productos disponibles ni precios confirmados.'];
    const text = lines.join('\n');
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else { const textarea = document.createElement('textarea'); textarea.value = text; textarea.style.position = 'fixed'; textarea.style.opacity = '0'; document.body.appendChild(textarea); textarea.select(); if (!document.execCommand('copy')) throw new Error('Copy failed'); textarea.remove(); }
      toast('Selección copiada.');
    } catch { toast('No se pudo copiar. Revisa los permisos del navegador.'); }
  };

  const quizQuestions = [
    {id:'family',title:'¿Qué universo aromático te atrae?',options:[['citrica','Fresco y cítrico'],['floral','Floral y delicado'],['oriental','Ámbar y especias'],['amaderada','Maderas y profundidad'],['gourmand','Dulce y gourmand'],['aromatica','Aromático y versátil']]},
    {id:'intensity',title:'¿Qué presencia prefieres?',options:[['suave','Sutil y cercana'],['media','Equilibrada'],['intensa','Intensa y memorable'],['todos','Me gusta explorar']]},
    {id:'occasion',title:'¿En qué momento lo imaginas?',options:[['dia','Para el día'],['oficina','En mi rutina'],['noche','Para la noche'],['especial','Ocasiones especiales']]},
    {id:'audience',title:'¿Qué colección quieres explorar?',options:[['masculino','Masculina'],['femenino','Femenina'],['unisex','Unisex'],['todos','Sin preferencia']]}
  ];

  const renderQuiz = () => {
    if (quizStep >= quizQuestions.length) return renderQuizResults();
    const q = quizQuestions[quizStep];
    $('#quiz-app').innerHTML = `<div class="quiz-progress"><span>DESCUBRE TU AROMA</span><span>${quizStep + 1} / ${quizQuestions.length}</span></div><div class="quiz-progress-bar"><span style="width:${((quizStep+1)/quizQuestions.length)*100}%"></span></div><h2>${toText(q.title)}</h2><div class="quiz-options">${q.options.map(([value,label]) => `<button type="button" class="quiz-option" data-action="quiz" data-value="${toText(value)}">${toText(label)}</button>`).join('')}</div>${quizStep > 0 ? '<button class="link-button" data-action="quiz-back" style="margin-top:24px" type="button">← Volver</button>' : ''}`;
  };

  const renderQuizResults = () => {
    const ranked = products.map(product => {
      let score = 0;
      if (product.family === quizAnswers.family) score += 5;
      if (product.intensity === quizAnswers.intensity) score += 2;
      if (product.occasions.includes(quizAnswers.occasion)) score += 2;
      if (product.audience === quizAnswers.audience) score += 2;
      return {product,score};
    }).sort((a,b) => b.score - a.score || a.product.name.localeCompare(b.product.name,'es')).slice(0,3);
    $('#quiz-app').innerHTML = `<div class="quiz-result-heading"><div class="eyebrow" style="justify-content:center">TU EXPLORACIÓN</div><h2>Un punto de partida,<br><em>tres posibilidades.</em></h2><p>Estos perfiles de demostración coinciden con parte de tus preferencias. No son recomendaciones de productos con stock confirmado.</p></div><div class="quiz-results">${ranked.map(({product,score}) => `<div class="quiz-result"><small>${toText(lineNames[product.category])}</small><h3>${toText(product.name)}</h3><p>${toText(product.notes.join(' · '))}</p><a href="#/producto/${encodeURIComponent(product.id)}">Explorar perfil ↗</a></div>`).join('')}</div><button class="button button-dark quiz-reset" type="button" data-action="quiz-reset">Repetir cuestionario ↻</button>`;
  };

  const toggleMenu = () => {
    const nav = $('#mobile-nav');
    nav.hidden = !nav.hidden;
    const expanded = !nav.hidden;
    $('#menu-trigger').setAttribute('aria-expanded',String(expanded));
    $('#menu-trigger').setAttribute('aria-label',expanded?'Cerrar menú':'Abrir menú');
  };

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (target) {
      const action = target.dataset.action;
      if (action === 'size') {
        selectedSize = Number(target.dataset.size);
        $$('.variant-btn').forEach(button => { const active = Number(button.dataset.size) === selectedSize; button.classList.toggle('selected',active); button.setAttribute('aria-pressed',String(active)); });
      }
      if (action === 'add') addToCart(target.dataset.id);
      if (['inc','dec','remove'].includes(action)) updateCart(action,target.dataset.key);
      if (action === 'quiz') { quizAnswers[quizQuestions[quizStep].id] = target.dataset.value; quizStep += 1; renderQuiz(); }
      if (action === 'quiz-back') { quizStep = Math.max(0,quizStep - 1); renderQuiz(); }
      if (action === 'quiz-reset') { quizStep = 0; quizAnswers = {}; renderQuiz(); }
    }
    if (event.target.closest('#mobile-nav a')) closeMenu();
    if (event.target.closest('.cart-empty a')) closeCart();
  });

  Object.values(filterElements).forEach(element => {
    element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change',renderCatalog);
  });
  $('#clear-filters').addEventListener('click',resetFilters);
  $('#empty-reset').addEventListener('click',resetFilters);
  $('#search-trigger').addEventListener('click',() => {
    if (routeName !== 'catalogo') location.hash = '#/catalogo';
    setTimeout(() => $('#search-input').focus(),50);
  });
  $('#cart-trigger').addEventListener('click',openCart);
  $('#close-cart').addEventListener('click',closeCart);
  $('#drawer-backdrop').addEventListener('click',closeCart);
  $('#menu-trigger').addEventListener('click',toggleMenu);
  $('#skip-link').addEventListener('click',event => { event.preventDefault(); $('#contenido').focus(); });
  $('#scroll-collections').addEventListener('click',() => $('#colecciones').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
  $('#clear-cart').addEventListener('click',() => { cart = []; saveCart(); toast('Selección vaciada.'); });
  $('#copy-selection').addEventListener('click',copySelection);
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape') { if (!$('#cart-drawer').hidden) closeCart(); else closeMenu(); }
    if (event.key === 'Tab' && !$('#cart-drawer').hidden) {
      const focusable = $$('button:not([disabled]),a[href],input,select', $('#cart-drawer')).filter(el => !el.hidden);
      const first = focusable[0],last = focusable[focusable.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault();last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault();first?.focus(); }
    }
  });
  window.addEventListener('hashchange',navigate);
  window.addEventListener('scroll',() => $('#header').classList.toggle('scrolled',scrollY > 10),{passive:true});
  $('#year').textContent = String(new Date().getFullYear());
  renderHome();
  renderCart();
  if (!location.hash.startsWith('#/')) location.replace('#/');
  navigate();
})();
