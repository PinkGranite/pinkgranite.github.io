const dialog = document.querySelector('.figure-dialog');
if (dialog) {
  const image = dialog.querySelector('.figure-full');
  const title = dialog.querySelector('#figure-title');
  const caption = dialog.querySelector('.figure-dialog-caption p');
  const source = dialog.querySelector('.figure-dialog-caption a');
  document.querySelectorAll('[data-figure]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      title.textContent = link.dataset.figureTitle;
      image.src = link.dataset.figure;
      image.alt = link.querySelector('img').alt;
      caption.textContent = link.dataset.figureCaption;
      source.href = link.href;
      dialog.showModal();
    });
  });
  dialog.querySelector('.figure-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
}
