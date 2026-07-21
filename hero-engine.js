(() => {
  'use strict';

  const root = document.querySelector('[data-decision-chassis]');
  if (!root) return;

  const base = document.baseURI;
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
})();
