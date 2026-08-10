export function tabIndexForKey(currentIndex, tabCount, key) {
  if (key === 'ArrowRight') return (currentIndex + 1) % tabCount;
  if (key === 'ArrowLeft') return (currentIndex - 1 + tabCount) % tabCount;
  if (key === 'Home') return 0;
  if (key === 'End') return tabCount - 1;
  return currentIndex;
}

function initializeTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];

  function select(tab, focus = false) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    }
    for (const panel of panels) {
      panel.hidden = panel.id !== tab.getAttribute('aria-controls');
    }
    if (focus) tab.focus();
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const index = tabs.indexOf(tab);
      const next = tabIndexForKey(index, tabs.length, event.key);
      if (next === index && !['Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      select(tabs[next], true);
    });
  }
}

if (typeof document !== 'undefined') {
  for (const root of document.querySelectorAll('[data-onboarding-tabs]')) {
    initializeTabs(root);
  }
}
