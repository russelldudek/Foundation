import { createThreeScene } from './three-scene.js';

const STAGES = [
  {
    label: 'Structure the problem',
    short: 'Shared fact base',
    detail: 'Normalize customer, product, operational, and technical signals into one visible problem frame.',
    output: 'Problem frame locked'
  },
  {
    label: 'Apply outside perspective',
    short: 'Assumptions tested',
    detail: 'Pressure-test the internal story against customer evidence, market context, system constraints, and operating reality.',
    output: 'Assumptions tested'
  },
  {
    label: 'Turn analysis into action',
    short: 'Decision released',
    detail: 'Resolve the work into a priority, accountable owner, proof standard, and the next executive decision.',
    output: 'Decision package ready'
  }
];

function rewriteHeroCopy() {
  const heroTitle = document.querySelector('#hero-title');
  const heroLede = document.querySelector('.hero-2026__lede');
  const primaryAction = document.querySelector('.hero-2026__actions .button--primary');
  const proof = document.querySelector('.hero-2026__proof');
  const foot = document.querySelector('.hero-2026__foot');

  if (heroTitle) heroTitle.innerHTML = 'Make strategy <em>load-bearing.</em>';
  if (heroLede) {
    heroLede.textContent = 'I connect customer intelligence, product priorities, operating capacity, and AI workflows into one decision system—so leaders can see the load, choose the next move, and scale without adding coordination debt.';
  }
  if (primaryAction) {
    primaryAction.textContent = 'Run the decision model';
    primaryAction.setAttribute('href', '#decision-intelligence');
  }
  if (proof) {
    proof.innerHTML = `
      <div><span>01</span><strong>Systems builder</strong><p>Turns executive intent into visible ownership, dependencies, cadence, and decisions.</p></div>
      <div><span>02</span><strong>AI workflow architect</strong><p>Designs human-authorized automation around context, evaluation, adoption, and measurable capacity.</p></div>
      <div><span>03</span><strong>Technical operator</strong><p>Translates across data, product, engineering, quality, customers, and high-consequence operations.</p></div>`;
  }
  if (foot) {
    foot.innerHTML = '<span>Strategy</span><span>Program operations</span><span>Stakeholder alignment</span><span>AI workflow design</span><span>Technical translation</span>';
  }
}

function renderEngine(root) {
  root.id = 'decision-intelligence';
  root.dataset.phase = '0';
  root.innerHTML = `
    <div class="decision-chassis__frame">
      <div class="di-topline">
        <div class="di-title">
          <i class="di-title__mark" aria-hidden="true"></i>
          <div class="di-title__copy"><span>Candidate-built interactive operating model</span><strong>Decision Intelligence Engine</strong></div>
        </div>
        <div class="di-status"><i></i><span data-di-status>Reading the system</span></div>
        <button class="di-replay" type="button" data-di-replay>Run model</button>
      </div>
      <div class="di-stage">
        <canvas class="di-canvas" data-di-canvas aria-hidden="true"></canvas>
        <svg class="di-fallback" viewBox="0 0 760 510" role="img" aria-labelledby="di-fallback-title di-fallback-desc">
          <title id="di-fallback-title">Decision Intelligence Engine</title>
          <desc id="di-fallback-desc">Customer, product, operations, and data signals converge into a shared decision core and resolve into priority, ownership, evidence, and a next decision.</desc>
          <defs>
            <linearGradient id="diLink" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2f8cff"/><stop offset=".55" stop-color="#43dfd1"/><stop offset="1" stop-color="#d6a85d"/></linearGradient>
            <filter id="diGlow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g class="grid"><path d="M0 110H760M0 200H760M0 290H760M0 380H760"/><path d="M110 0V510M220 0V510M330 0V510M440 0V510M550 0V510M660 0V510"/></g>
          <ellipse class="orbit" cx="380" cy="255" rx="175" ry="85"/><ellipse class="orbit" cx="380" cy="255" rx="115" ry="145" transform="rotate(58 380 255)"/>
          <g class="link"><path d="M150 125C250 125 275 220 350 245M150 205C245 205 285 230 350 250M150 295C250 295 285 270 350 260M150 375C250 375 275 290 350 265"/><path d="M410 245C500 220 520 125 610 125M410 250C505 240 530 205 610 205M410 260C505 270 530 295 610 295M410 265C500 290 520 375 610 375"/></g>
          <circle class="core" cx="380" cy="255" r="45"/>
          <g><circle class="node" cx="150" cy="125" r="9"/><circle class="node" cx="150" cy="205" r="9"/><circle class="node" cx="150" cy="295" r="9"/><circle class="node" cx="150" cy="375" r="9"/></g>
          <g><circle class="output" cx="610" cy="125" r="9"/><circle class="output" cx="610" cy="205" r="9"/><circle class="output" cx="610" cy="295" r="9"/><circle class="output" cx="610" cy="375" r="9"/></g>
        </svg>
        <div class="di-rail di-rail--inputs" aria-label="Decision inputs">
          <div class="di-node"><span>Customer</span><strong>Market signals</strong><small>Needs, adoption, commercial pull</small></div>
          <div class="di-node"><span>Product</span><strong>Roadmap pressure</strong><small>Scout, tagging, analytics</small></div>
          <div class="di-node"><span>Operations</span><strong>Capacity + risk</strong><small>Load, bottlenecks, trust</small></div>
          <div class="di-node"><span>Data + AI</span><strong>Evidence + leverage</strong><small>Context, automation, evaluation</small></div>
        </div>
        <div class="di-core-label"><span>Synthesis core</span><strong data-di-core>Shared fact base</strong><small data-di-core-detail>Signals become one operating frame.</small></div>
        <div class="di-rail di-rail--outputs" aria-label="Decision outputs">
          <div class="di-node"><span>Priority</span><strong>What moves</strong><small>Sequence, accelerate, repair, stop</small></div>
          <div class="di-node"><span>Owner</span><strong>Who carries it</strong><small>One accountable decision owner</small></div>
          <div class="di-node"><span>Evidence</span><strong>What proves it</strong><small>Adoption, trust, economics, capacity</small></div>
          <div class="di-node"><span>Next decision</span><strong>When leaders act</strong><small>Clear date, trigger, and consequence</small></div>
        </div>
        <div class="di-capabilities" aria-label="Capabilities demonstrated">
          <span>Systems thinking</span><span>AI workflow architecture</span><span>Portfolio logic</span><span>Technical translation</span><span>Executive cadence</span>
        </div>
      </div>
      <div class="di-stages" role="tablist" aria-label="Decision workflow">
        ${STAGES.map((stage, index) => `
          <button class="di-stage-button${index === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${index === 0}" data-di-stage="${index}">
            <span class="di-stage-button__number">0${index + 1}</span>
            <span class="di-stage-button__copy"><strong>${stage.label}</strong><small>${stage.detail}</small></span>
          </button>`).join('')}
      </div>
      <div class="di-announcement" aria-live="polite" data-di-announcement></div>
    </div>`;
}

export function initDecisionEngine(root) {
  rewriteHeroCopy();
  renderEngine(root);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const compactViewport = window.matchMedia('(max-width: 900px)');
  const canvas = root.querySelector('[data-di-canvas]');
  const replay = root.querySelector('[data-di-replay]');
  const status = root.querySelector('[data-di-status]');
  const core = root.querySelector('[data-di-core]');
  const coreDetail = root.querySelector('[data-di-core-detail]');
  const announcement = root.querySelector('[data-di-announcement]');
  const stageButtons = [...root.querySelectorAll('[data-di-stage]')];

  let activeStage = 0;
  let timers = [];
  let sceneController = null;

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const setStage = (index, announce = false) => {
    activeStage = Math.max(0, Math.min(2, index));
    root.dataset.phase = String(activeStage);
    stageButtons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === activeStage;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    const stage = STAGES[activeStage];
    if (status) status.textContent = stage.output;
    if (core) core.textContent = stage.short;
    if (coreDetail) coreDetail.textContent = stage.detail;
    sceneController?.setStage(activeStage);
    if (announce && announcement) announcement.textContent = `${stage.label}. ${stage.detail}`;
  };

  const runModel = (announce = true) => {
    clearTimers();
    if (reduceMotion.matches) {
      setStage(2, announce);
      sceneController?.pulse();
      return;
    }
    setStage(0, false);
    sceneController?.reset();
    timers.push(setTimeout(() => setStage(1, false), 1150));
    timers.push(setTimeout(() => setStage(2, announce), 2600));
    timers.push(setTimeout(() => sceneController?.pulse(), 3100));
  };

  replay?.addEventListener('click', () => runModel(true));
  stageButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      clearTimers();
      setStage(index, true);
      sceneController?.pulse();
    });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'ArrowRight' ? (index + 1) % 3 : (index + 2) % 3;
      stageButtons[next].focus();
      stageButtons[next].click();
    });
  });

  root.classList.add('is-fallback');
  runModel(false);

  createThreeScene({ root, canvas, reduceMotion, compactViewport, coarsePointer })
    .then(controller => {
      if (!controller) return;
      sceneController = controller;
      root.classList.remove('is-fallback');
      root.classList.add('is-three');
      sceneController.setStage(activeStage);
      runModel(false);
    })
    .catch(error => {
      console.warn('Three.js Decision Intelligence Engine unavailable; semantic fallback remains active.', error);
    });
}
