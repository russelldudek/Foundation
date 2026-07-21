export function initLoadTestFlow() {
  const visual = document.querySelector('#load-test .frame-visual');
  if (!visual || visual.dataset.flowModel === 'parallel-decision-flow') return;

  const stylesheetId = 'load-test-flow-styles';
  if (!document.getElementById(stylesheetId)) {
    const stylesheet = document.createElement('link');
    stylesheet.id = stylesheetId;
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('load-test-flow.css', document.baseURI).href;
    document.head.appendChild(stylesheet);
  }

  const correctionStyleId = 'load-test-flow-corrections';
  if (!document.getElementById(correctionStyleId)) {
    const correctionStyle = document.createElement('style');
    correctionStyle.id = correctionStyleId;
    correctionStyle.textContent = '#load-test .load-flow__signal{position:relative}#load-test .load-flow__signal::after{inset:7px;margin:0}';
    document.head.appendChild(correctionStyle);
  }

  const intro = document.querySelector('#load-test .load-test__intro > p:not(.kicker)');
  if (intro) {
    intro.textContent = 'Choose an illustrative initiative. The model contracts the work, tests revenue, capacity, trust, and adoption in parallel, then resolves the combined evidence into one executive decision posture.';
  }

  visual.dataset.flowModel = 'parallel-decision-flow';
  visual.setAttribute('role', 'img');
  visual.setAttribute('aria-label', 'A growth objective becomes an initiative contract. Revenue, capacity, trust, and adoption are tested in parallel. Their combined evidence resolves into one decision posture and recommended next decision.');
  visual.innerHTML = `
    <div class="load-flow" data-load-flow>
      <div class="load-flow__node load-flow__node--objective">
        <span class="load-flow__step">01 · Intent</span>
        <i class="load-flow__signal" aria-hidden="true"></i>
        <strong>Growth objective</strong>
        <small>What must change for the customer and the business?</small>
      </div>

      <div class="load-flow__arrow load-flow__arrow--contract" aria-hidden="true"></div>

      <div class="load-flow__node load-flow__node--contract">
        <span class="load-flow__step">02 · Contract</span>
        <strong>Initiative contract</strong>
        <small>Objective · accountable owner · dependency · proof standard</small>
      </div>

      <div class="load-flow__arrow load-flow__arrow--distribute" aria-hidden="true"></div>

      <div class="load-flow__parallel">
        <div class="load-flow__parallel-head">
          <span class="load-flow__step">03 · Parallel stress test</span>
          <small>These are decision dimensions—not sequential stages.</small>
        </div>
        <div class="load-flow__dimensions">
          <div class="member is-watch" data-member="revenue">
            <i aria-hidden="true"></i>
            <span><strong>Revenue</strong><small>Economic value</small></span>
            <b class="load-flow__state" data-status="revenue" data-state="watch">Watch</b>
          </div>
          <div class="member is-strong" data-member="capacity">
            <i aria-hidden="true"></i>
            <span><strong>Capacity</strong><small>Operating load</small></span>
            <b class="load-flow__state" data-status="capacity" data-state="strong">Load-bearing</b>
          </div>
          <div class="member is-strong" data-member="trust">
            <i aria-hidden="true"></i>
            <span><strong>Trust</strong><small>Confidence to act</small></span>
            <b class="load-flow__state" data-status="trust" data-state="strong">Load-bearing</b>
          </div>
          <div class="member is-watch" data-member="adoption">
            <i aria-hidden="true"></i>
            <span><strong>Adoption</strong><small>Behavior change</small></span>
            <b class="load-flow__state" data-status="adoption" data-state="watch">Watch</b>
          </div>
        </div>
      </div>

      <div class="load-flow__arrow load-flow__arrow--resolve" aria-hidden="true"></div>

      <div class="load-flow__node load-flow__node--output">
        <span class="load-flow__step">04 · Resolve</span>
        <strong>Decision posture</strong>
        <b data-flow-posture>Sequence for scale</b>
        <small>One executive stance, based on the combined evidence.</small>
      </div>
    </div>
    <p class="load-flow__logic"><span>Flow logic</span> Objective → contract → four parallel tests → decision posture → recommended next decision.</p>`;

  const postureSource = document.querySelector('#scenario-posture');
  const postureTarget = visual.querySelector('[data-flow-posture]');
  const syncPosture = () => {
    if (postureSource && postureTarget) postureTarget.textContent = postureSource.textContent.trim();
  };
  syncPosture();

  if (postureSource) {
    const observer = new MutationObserver(syncPosture);
    observer.observe(postureSource, { childList: true, subtree: true, characterData: true });
  }
}
