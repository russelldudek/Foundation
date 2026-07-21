(() => {
  const enhanceStyles = document.createElement('link');
  enhanceStyles.rel = 'stylesheet';
  enhanceStyles.href = new URL('load-test-2026.css', document.baseURI).href;
  document.head.appendChild(enhanceStyles);

  const mobileButton = document.querySelector('.menu');
  const mobileNav = document.querySelector('.mobile-nav');
  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', () => {
      const isOpen = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.classList.toggle('is-open', !isOpen);
    });
    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      mobileButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = [...document.querySelectorAll('.reveal')];
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealEls.forEach((el) => observer.observe(el));
  }

  const icons = {
    scout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>',
    tagging: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5V12l7.5 7.5L20 11l-7.5-7.5H6A2 2 0 0 0 4 5.5Z"/><circle cx="8.5" cy="8" r="1.2"/></svg>',
    analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 20V11m7 9V4m7 16v-6"/></svg>',
    internal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 5.5A3.5 3.5 0 0 1 14.3 3 3.5 3.5 0 0 1 19 7.7a3.6 3.6 0 0 1 .2 6.5A3.5 3.5 0 0 1 14 19a3.5 3.5 0 0 1-6.2-.7A3.5 3.5 0 0 1 4.4 13 3.5 3.5 0 0 1 8 5.5Z"/><path d="M9 8v8m6-9v10m-3-12v14M7 11h10M7 15h10"/></svg>',
    objective: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m15 9 4-4"/></svg>',
    owner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3"/><path d="M6 20v-2.5A4.5 4.5 0 0 1 10.5 13h3A4.5 4.5 0 0 1 18 17.5V20"/></svg>',
    dependency: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9.5 14.5-2 2a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0"/><path d="m14.5 9.5 2-2a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0"/><path d="m8.5 15.5 7-7"/></svg>',
    evidence: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
    why: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 18h16M5 15l4-4 3 2 6-7"/><circle cx="18" cy="6" r="1.5"/></svg>'
  };

  const loadSection = document.querySelector('#load-test');
  const loadTitle = loadSection?.querySelector('.load-test__intro h2');
  if (loadTitle && !loadTitle.querySelector('.load-title__accent')) {
    loadTitle.innerHTML = 'Every <span class="load-title__accent">initiative</span> must show how it carries <span class="load-title__accent">growth.</span>';
  }

  const scenarios = {
    scout:{title:'Scout acceleration',posture:'Sequence for scale',objective:'Turn standardized intelligence into trusted, adopted priorities for a bounded customer workflow.',owner:'One accountable product owner with committed Data, Analytics, Client Strategy, and Operations support.',dependency:'Data confidence, evaluation criteria, feedback ownership, and a repeatable release path.',evidence:'Adoption, recommendation usefulness, time-to-priority, exception rate, and support burden.',decision:'Sequence the next increment around one repeated decision pattern and its evidence contract.',statuses:{revenue:'watch',capacity:'strong',trust:'strong',adoption:'watch'}},
    tagging:{title:'Tagging expansion',posture:'Repair the bottleneck',objective:'Increase comparable coverage without letting exception handling and rework consume the scale benefit.',owner:'Measurement and Data Operations, with explicit Product and onboarding dependencies.',dependency:'Definition quality, QA throughput, vendor or site variability, and exception ownership.',evidence:'First-pass completeness, cycle time, rework, exception aging, and usable coverage.',decision:'Fund the highest-leverage coverage bottleneck before adding downstream promises.',statuses:{revenue:'watch',capacity:'constrained',trust:'strong',adoption:'watch'}},
    analytics:{title:'Repeatable analytics offering',posture:'Prove before productize',objective:'Convert a repeated customer decision into reusable analysis without turning bespoke work into disguised product debt.',owner:'Analytics and Revenue, with Product defining the repeatable boundary and Operations tracking delivery load.',dependency:'A common decision pattern, stable data availability, packaging, and delivery-effort evidence.',evidence:'Reuse rate, delivery effort, customer decision impact, attach or renewal signal, and variance.',decision:'Run a bounded proof; productize only when reuse and economics survive real delivery.',statuses:{revenue:'strong',capacity:'watch',trust:'watch',adoption:'strong'}},
    internal:{title:'Internal AI capacity release',posture:'Pilot with a capacity contract',objective:'Redesign one recurring workflow so AI releases measurable capacity without weakening human authority or data handling.',owner:'The process owner and Operations, with security, data, and human-review roles named before launch.',dependency:'Stable context, clear exceptions, safe data handling, evaluation, and an adoption owner.',evidence:'Cycle time, touches, error or rework, review load, adoption, and capacity redeployed.',decision:'Pilot one workflow end to end; scale only after released capacity is visible and redeployed.',statuses:{revenue:'watch',capacity:'strong',trust:'constrained',adoption:'watch'}}
  };

  const frame = document.querySelector('.loadframe');
  const tablist = document.querySelector('.scenario-tabs');
  const buttons = [...document.querySelectorAll('[data-scenario]')];
  const fields = {title:document.querySelector('#scenario-title'),posture:document.querySelector('#scenario-posture'),objective:document.querySelector('#scenario-objective'),owner:document.querySelector('#scenario-owner'),dependency:document.querySelector('#scenario-dependency'),evidence:document.querySelector('#scenario-evidence'),decision:document.querySelector('#scenario-decision')};
  const live = document.querySelector('#scenario-announcement');
  const replayButton = document.querySelector('#replay-load');
  let settleTimer;

  if (tablist) tablist.setAttribute('role', 'tablist');
  buttons.forEach((button) => {
    const key = button.dataset.scenario;
    const label = button.textContent.trim();
    button.innerHTML = `<span class="scenario-tab__icon" aria-hidden="true">${icons[key] || ''}</span><span class="scenario-tab__label">${label}</span>`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'scenario-panel');
  });
  if (frame) {
    frame.id = 'scenario-panel';
    frame.setAttribute('role', 'tabpanel');
    frame.setAttribute('aria-busy', 'false');
  }

  const cards = [...document.querySelectorAll('.loadframe__grid > div')];
  ['objective','owner','dependency','evidence','why'].forEach((name, index) => {
    const card = cards[index];
    if (!card || card.querySelector('.loadframe__card-icon')) return;
    card.insertAdjacentHTML('afterbegin', `<span class="loadframe__card-icon" aria-hidden="true">${icons[name]}</span>`);
  });

  function applyScenario(key, announce = true) {
    const scenario = scenarios[key];
    if (!scenario || !frame) return;

    buttons.forEach((button) => {
      const selected = button.dataset.scenario === key;
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    Object.entries(fields).forEach(([name, element]) => {
      if (element) element.textContent = scenario[name];
    });
    Object.entries(scenario.statuses).forEach(([name, state]) => {
      const member = document.querySelector(`[data-member="${name}"]`);
      if (member) member.setAttribute('class', `member is-${state}`);
      const label = document.querySelector(`[data-status="${name}"]`);
      if (label) {
        label.textContent = state === 'strong' ? 'Load-bearing' : state === 'watch' ? 'Watch' : 'Constraint';
        label.dataset.state = state;
      }
    });

    frame.dataset.activeScenario = key;
    frame.setAttribute('aria-label', `${scenario.title}: ${scenario.posture}`);
    clearTimeout(settleTimer);
    frame.classList.remove('is-running');
    frame.setAttribute('aria-busy', String(!prefersReduced));
    void frame.offsetWidth;
    if (!prefersReduced) {
      frame.classList.add('is-running');
      settleTimer = setTimeout(() => {
        frame.classList.remove('is-running');
        frame.setAttribute('aria-busy', 'false');
      }, 1300);
    } else {
      frame.setAttribute('aria-busy', 'false');
    }
    if (announce && live) live.textContent = `${scenario.title}. ${scenario.posture}. Recommended next decision: ${scenario.decision}`;
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => applyScenario(button.dataset.scenario));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      else next = (index + buttons.length - 1) % buttons.length;
      buttons[next].focus();
      buttons[next].click();
    });
  });

  document.querySelector('#reset-scenario')?.addEventListener('click', () => {
    applyScenario('scout');
    buttons[0]?.focus({ preventScroll: true });
  });
  replayButton?.addEventListener('click', () => {
    const key = frame?.dataset.activeScenario || 'scout';
    applyScenario(key, false);
    if (live) live.textContent = `Replaying the load transfer for ${scenarios[key].title}.`;
  });

  applyScenario('scout', false);
})();
