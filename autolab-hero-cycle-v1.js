export const HERO_WORDS = Object.freeze(['research', 'training', 'inference']);

export function heroWordFor(index) {
  const normalized = (
    (index % HERO_WORDS.length) + HERO_WORDS.length
  ) % HERO_WORDS.length;
  return HERO_WORDS[normalized];
}

export function initHeroCycle(root = document) {
  const word = root.querySelector('[data-hero-cycle]');
  const counter = root.querySelector('[data-hero-cycle-index]');
  if (!word || !counter) return;

  const view = root.defaultView || window;
  const reducedMotion = view.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  let index = 0;

  word.textContent = heroWordFor(index);
  counter.textContent = '01 / 03';
  if (reducedMotion) return;

  const advance = async () => {
    await word.animate(
      [
        {
          opacity: 1,
          transform: 'translateY(0) rotateX(0deg)',
          filter: 'blur(0)',
        },
        {
          opacity: 0,
          transform: 'translateY(-42%) rotateX(26deg)',
          filter: 'blur(5px)',
        },
      ],
      {
        duration: 260,
        easing: 'cubic-bezier(.55,0,1,.45)',
        fill: 'forwards',
      },
    ).finished;

    index += 1;
    word.textContent = heroWordFor(index);
    counter.textContent = `${String(
      index % HERO_WORDS.length + 1,
    ).padStart(2, '0')} / 03`;

    await word.animate(
      [
        {
          opacity: 0,
          transform: 'translateY(48%) rotateX(-24deg)',
          filter: 'blur(5px)',
        },
        {
          opacity: 1,
          transform: 'translateY(0) rotateX(0deg)',
          filter: 'blur(0)',
        },
      ],
      {
        duration: 430,
        easing: 'cubic-bezier(.16,.85,.16,1)',
        fill: 'forwards',
      },
    ).finished;

    setTimeout(advance, 2500);
  };

  setTimeout(advance, 2800);
}

if (typeof document !== 'undefined') initHeroCycle();
