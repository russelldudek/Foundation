(() => {
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

  const scenarios = {
    scout:{title:'Scout acceleration',posture:'Sequence for scale',objective:'Turn standardized intelligence into trusted, adopted priorities for a bounded customer workflow.',owner:'One accountable product owner with committed Data, Analytics, Client Strategy, and Operations support.',dependency:'Data confidence, evaluation criteria, feedback ownership, and a repeatable release path.',evidence:'Adoption, recommendation usefulness, time-to-priority, exception rate, and support burden.',decision:'Sequence the next increment around one repeated decision pattern and its evidence contract.',statuses:{revenue:'watch',capacity:'strong',trust:'strong',adoption:'watch'}},
    tagging:{title:'Tagging expansion',posture:'Repair the bottleneck',objective:'Increase comparable coverage without letting exception handling and rework consume the scale benefit.',owner:'Measurement and Data Operations, with explicit Product and onboarding dependencies.',dependency:'Definition quality, QA throughput, vendor/site variability, and exception ownership.',evidence:'First-pass completeness, cycle time, rework, exception aging, and usable coverage.',decision:'Fund the highest-leverage coverage bottleneck before adding downstream promises.',statuses:{revenue:'watch',capacity:'constrained',trust:'strong',adoption:'watch'}},
    analytics:{title:'Repeatable analytics offering',posture:'Prove before productize',objective:'Convert a repeated customer decision into reusable analysis without turning bespoke work into disguised product debt.',owner:'Analytics and Revenue, with Product defining the repeatable boundary and Operations tracking delivery load.',dependency:'Common decision pattern, stable data availability, packaging, and delivery-effort evidence.',evidence:'Reuse rate, delivery effort, customer decision impact, attach or renewal signal, and variance.',decision:'Run a bounded proof; productize only when reuse and economics survive real delivery.',statuses:{revenue:'strong',capacity:'watch',trust:'watch',adoption:'strong'}},
    internal:{title:'Internal AI capacity release',posture:'Pilot with a capacity contract',objective:'Redesign one recurring workflow so AI releases measurable capacity without weakening human authority or data handling.',owner:'The process owner and Operations, with security, data, and human-review roles named before launch.',dependency:'Stable context, clear exceptions, safe data handling, evaluation, and an adoption owner.',evidence:'Cycle time, touches, error or rework, review load, adoption, and capacity redeployed.',decision:'Pilot one workflow end to end; scale only after released capacity is visible and redeployed.',statuses:{revenue:'watch',capacity:'strong',trust:'constrained',adoption:'watch'}}
  };
  const frame = document.querySelector('.loadframe');
  const buttons = [...document.querySelectorAll('[data-scenario]')];
  const fields = {title:document.querySelector('#scenario-title'),posture:document.querySelector('#scenario-posture'),objective:document.querySelector('#scenario-objective'),owner:document.querySelector('#scenario-owner'),dependency:document.querySelector('#scenario-dependency'),evidence:document.querySelector('#scenario-evidence'),decision:document.querySelector('#scenario-decision')};
  let settleTimer;
  function applyScenario(key, announce=true) {
    const scenario=scenarios[key]; if(!scenario||!frame)return;
    buttons.forEach((button)=>button.setAttribute('aria-pressed',String(button.dataset.scenario===key)));
    Object.entries(fields).forEach(([name,element])=>{if(element)element.textContent=scenario[name]});
    Object.entries(scenario.statuses).forEach(([name,state])=>{
      const member=document.querySelector(`[data-member="${name}"]`); if(member)member.setAttribute('class',`member is-${state}`);
      const label=document.querySelector(`[data-status="${name}"]`); if(label)label.textContent=state==='strong'?'Load-bearing':state==='watch'?'Watch':'Constraint';
    });
    frame.dataset.activeScenario=key; clearTimeout(settleTimer); frame.classList.remove('is-running'); void frame.offsetWidth;
    if(!prefersReduced){frame.classList.add('is-running');settleTimer=setTimeout(()=>frame.classList.remove('is-running'),1300)}
    if(announce){const live=document.querySelector('#scenario-announcement');if(live)live.textContent=`${scenario.title}. ${scenario.posture}. ${scenario.decision}`}
  }
  buttons.forEach((button)=>button.addEventListener('click',()=>applyScenario(button.dataset.scenario)));
  document.querySelector('#reset-scenario')?.addEventListener('click',()=>applyScenario('scout'));
  document.querySelector('#replay-load')?.addEventListener('click',()=>applyScenario(frame?.dataset.activeScenario||'scout',false));
  applyScenario('scout',false);
})();
