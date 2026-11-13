(() => {
  const shots = Array.from(document.querySelectorAll('[data-gallery-photo]'));
  const box = document.getElementById('holo-lightbox');
  if (!shots.length || !box || typeof box.showModal !== 'function') return;
  const image = document.getElementById('holo-enlarged');
  const title = document.getElementById('holo-caption');
  const counter = document.getElementById('holo-counter');
  let selected = 0;
  let opener = null;
  const show = (next) => {
    selected = (next + shots.length) % shots.length;
    const shot = shots[selected];
    image.src = shot.href;
    image.alt = shot.querySelector('img').alt;
    title.textContent = shot.parentElement.querySelector('figcaption strong').textContent;
    counter.textContent = (selected + 1) + ' / ' + shots.length;
  };
  shots.forEach((shot, index) => shot.addEventListener('click', (ev) => {
    if (ev.button || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    opener = shot;
    show(index);
    box.showModal();
  }));
  box.querySelector('.holo-close').addEventListener('click', () => box.close());
  box.querySelectorAll('[data-picture-step]').forEach(button =>
    button.addEventListener('click', () => show(selected + Number(button.dataset.pictureStep))));
  box.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
      ev.preventDefault();
      show(selected + (ev.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  box.addEventListener('close', () => opener?.focus());
})();
