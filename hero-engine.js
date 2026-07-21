(() => {
  'use strict';

  const base = document.baseURI;
  const root = document.querySelector('[data-decision-chassis]');

  if (root) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('hero/decision-engine.css', base).href;
    document.head.appendChild(stylesheet);

    import(new URL('hero/decision-engine.js', base).href)
      .then(({ initDecisionEngine }) => initDecisionEngine(root))
      .catch(error => {
        console.error('Decision Intelligence Engine failed to initialize.', error);
        root.dataset.renderer = 'legacy-fallback';
      });
  }

  import(new URL('load-test-flow.js', base).href)
    .then(({ initLoadTestFlow }) => initLoadTestFlow())
    .catch(error => {
      console.error('Execution Load Test flow failed to initialize.', error);
    });
})();
