const chapters = [...document.querySelectorAll('[data-explainer-chapter]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion) {
  for (const chapter of chapters) chapter.dataset.reveal = 'resolved';
} else if (chapters.length) {
  for (const chapter of chapters) chapter.dataset.reveal = 'pending';
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.reveal = 'resolved';
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px', threshold: 0.15 });
  for (const chapter of chapters) observer.observe(chapter);
}
