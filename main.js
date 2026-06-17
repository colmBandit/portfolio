/* ── Malcolm Mmari — main.js ── */

// ── Custom cursor ────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  dot.style.transition = 'none';
  function animateCursor() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();

// ── Navbar scroll state ──────────────────────────────────
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ── Scroll reveal ────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // stagger children within a group
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

// ── Hero title stagger ───────────────────────────────────
(function initHeroWords() {
  document.querySelectorAll('.ht-word').forEach(w => {
    w.style.animationDelay = (w.dataset.delay || 0) + 'ms';
  });
})();

// ── Hero parallax ────────────────────────────────────────
(function initParallax() {
  const zone = document.querySelector('.hero-img-zone');
  if (!zone) return;
  window.addEventListener('scroll', () => {
    zone.style.transform = `translateY(${window.scrollY * 0.18}px)`;
  }, { passive: true });
})();

// ── Page transition sweep ────────────────────────────────
(function initPageTransition() {
  // Create sweep element
  const sweep = document.createElement('div');
  sweep.className = 'page-sweep';
  document.body.appendChild(sweep);

  // Animate in on load
  document.addEventListener('DOMContentLoaded', () => {
    sweep.classList.add('sweep-out');
  });

  // Intercept nav link clicks for exit animation
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      sweep.classList.remove('sweep-out');
      sweep.classList.add('sweep-in');
      setTimeout(() => { window.location.href = href; }, 480);
    });
  });
})();

// ── Scroll progress bar ──────────────────────────────────
(function initProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    bar.style.transform = `scaleX(${pct})`;
  }, { passive: true });
})();

// ── Char-by-char heading reveal ──────────────────────────
(function initCharReveal() {
  document.querySelectorAll('.char-reveal').forEach(el => {
    const text = el.textContent;
    el.innerHTML = [...text].map((ch, i) =>
      ch === ' ' ? ' ' : `<span class="ch" style="transition-delay:${i * 35}ms">${ch}</span>`
    ).join('');

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.querySelectorAll('.ch').forEach(ch => ch.classList.add('ch-vis'));
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
  });
})();

// ── Active nav link ──────────────────────────────────────
(function initActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('nav-active');
  });
})();

// ── GitHub repos ─────────────────────────────────────────
(function initGitHub() {
  const grid = document.getElementById('gh-grid');
  if (!grid) return;
  const LANG_COLORS = {
    JavaScript:'#F7DF1E', TypeScript:'#3178C6',
    Python:'#3572A5', HTML:'#E34C26', CSS:'#563D7C', default:'#40916C',
  };
  async function fetchRepos() {
    try {
      const res = await fetch('https://api.github.com/users/colmBandit/repos?sort=updated&per_page=9');
      if (!res.ok) throw new Error();
      renderRepos((await res.json()).filter(r => !r.private));
    } catch { renderRepos([]); }
  }
  function renderRepos(repos) {
    if (!repos.length) {
      grid.innerHTML = `<div class="gh-private-state"><div class="gh-lock mono">⬡</div><h3>Projects are private</h3><p>Most work lives in private repos. Visit my GitHub or reach out.</p><a href="https://github.com/colmBandit" target="_blank" class="btn-grn" style="margin-top:1rem;display:inline-block"><span>View GitHub ↗</span></a></div>`;
      return;
    }
    grid.innerHTML = repos.map(r => {
      const lc = LANG_COLORS[r.language] || LANG_COLORS.default;
      return `<a href="${r.html_url}" target="_blank" class="gh-card tilt-card"><div class="gh-card-top"><span class="gh-card-name">${r.name}</span>${r.fork?'<span class="gh-fork-badge">fork</span>':''}</div><p class="gh-card-desc">${r.description||'No description.'}</p><div class="gh-card-footer">${r.language?`<span class="gh-lang"><span class="gh-lang-dot" style="background:${lc}"></span>${r.language}</span>`:''}<span class="gh-arrow">↗</span></div></a>`;
    }).join('');
    initTiltCards();
  }
  fetchRepos();
})();

// ── Python terminal ──────────────────────────────────────
(function initTerminal() {
  const typedEl  = document.getElementById('ct-typed');
  const outputEl = document.getElementById('ct-output');
  if (!typedEl || !outputEl) return;
  const sequence = [
    { type:'input', text:'import contact' },
    { type:'output', lines:[{ text:'>>> module loaded: contact.py', cls:'highlight' }]},
    { type:'input', text:'print(contact.whoami())' },
    { type:'output', lines:[{ text:'"Malcolm Mmari — Software Engineer"', cls:'em' },{ text:'"Nairobi, Kenya  ·  Remote OK"', cls:'' }]},
    { type:'input', text:'contact.status()' },
    { type:'output', lines:[{ text:'{ "open_to": "junior roles, contracts, collabs",', cls:'highlight' },{ text:'  "focus":   "backend & web engineering",', cls:'highlight' },{ text:'  "available": True }', cls:'success' }]},
    { type:'input', text:'for k, v in contact.links.items(): print(f"{k}: {v}")' },
    { type:'output', lines:[{ text:'email:      malcolmhnr@gmail.com', cls:'' },{ text:'whatsapp:   +254 710 628 802', cls:'' },{ text:'instagram:  @malxtechnologies', cls:'' },{ text:'linkedin:   in/malcolm-mmari-7346032a9', cls:'' },{ text:'github:     github.com/colmBandit', cls:'' }]},
    { type:'input', text:"print(\"Let's build something.\")" },
    { type:'output', lines:[{ text:"Let's build something.", cls:'success' }]},
  ];
  let si=0, ci=0, lines=[];
  function typeChar() {
    const step = sequence[si];
    if (!step || step.type!=='input') return;
    if (ci < step.text.length) { typedEl.textContent += step.text[ci++]; setTimeout(typeChar, 48+Math.random()*36); }
    else setTimeout(showOutput, 380);
  }
  function showOutput() {
    const step = sequence[si];
    if (step?.type==='input') lines.push({ text:'>>> '+step.text, cls:'', prompt:true });
    si++;
    const out = sequence[si];
    if (out?.type==='output') { out.lines.forEach(l=>lines.push(l)); si++; }
    renderOut(); typedEl.textContent=''; ci=0;
    if (si < sequence.length) setTimeout(typeChar, 550);
    else setTimeout(()=>{ si=0; ci=0; lines=[]; outputEl.innerHTML=''; typedEl.textContent=''; setTimeout(typeChar,800); }, 4500);
  }
  function renderOut() {
    outputEl.innerHTML = lines.map(l => {
      const cls=`ct-out-line${l.cls?' '+l.cls:''}`;
      const txt=l.prompt?`<span style="color:var(--brg-light)">&gt;&gt;&gt; </span><span style="color:var(--silver-dk)">${l.text.slice(4)}</span>`:l.text;
      return `<span class="${cls}">${txt}</span>`;
    }).join('');
  }
  const term = document.querySelector('.contact-terminal');
  if (term) new IntersectionObserver(([e],o)=>{ if(e.isIntersecting){ setTimeout(typeChar,500); o.disconnect(); } },{threshold:0.3}).observe(term);
})();

// ── Hamburger ────────────────────────────────────────────
(function initHamburger() {
  const btn=document.getElementById('hamburger'), links=document.getElementById('nav-links'), overlay=document.getElementById('nav-overlay');
  if (!btn||!links||!overlay) return;
  const open=()=>{ btn.classList.add('open'); links.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow='hidden'; };
  const close=()=>{ btn.classList.remove('open'); links.classList.remove('open'); overlay.classList.remove('active'); document.body.style.overflow=''; };
  btn.addEventListener('click',()=>btn.classList.contains('open')?close():open());
  overlay.addEventListener('click',close);
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
})();

// ── 3D tilt on project / gh cards ───────────────────────
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x*12}deg) rotateX(${-y*12}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── Animated stat counters ───────────────────────────────
(function initCounters() {
  document.querySelectorAll('.count-up').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      let start = 0;
      const duration = 1400;
      const step = timestamp => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = (Number.isInteger(target) ? Math.floor(ease * target) : (ease * target).toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
  });
})();

// ── Experience timeline draw ─────────────────────────────
(function initTimeline() {
  const line = document.querySelector('.exp-timeline-line');
  if (!line) return;
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { line.classList.add('line-draw'); io.disconnect(); }
  }, { threshold: 0.1 });
  io.observe(line);
})();

// ── Magnetic buttons ─────────────────────────────────────
(function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width/2);
      const dy = e.clientY - (r.top  + r.height/2);
      el.style.transform = `translate(${dx*0.28}px, ${dy*0.28}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

// ── Page-hero letter float ───────────────────────────────
(function initPageHeroFloat() {
  const bg = document.querySelector('.page-hero-bg-text');
  const hero = document.querySelector('.page-hero');
  if (!bg || !hero) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    bg.style.transform = `translateY(calc(-50% + ${y * 22}px)) translateX(${x * 18}px)`;
  });
  hero.addEventListener('mouseleave', () => {
    bg.style.transform = 'translateY(-50%)';
  });
})();

// ── Init tilt on static project card ────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTiltCards();
  document.querySelectorAll('.project-featured').forEach(el => el.classList.add('tilt-card'));
});