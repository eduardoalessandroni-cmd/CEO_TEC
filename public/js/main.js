(function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const imgEl = document.getElementById('lightbox-img');
  const btnCerrar = document.getElementById('lightbox-cerrar');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');

  let grupoActual = [];
  let indiceActual = 0;

  function abrir(grupo, indice) {
    const thumbs = document.querySelectorAll(`.captura-thumb[data-grupo="${grupo}"]`);
    grupoActual = Array.from(thumbs).map(t => t.src);
    indiceActual = indice;
    mostrar();
    lightbox.hidden = false;
  }

  function mostrar() {
    imgEl.src = grupoActual[indiceActual];
  }

  function cerrar() {
    lightbox.hidden = true;
  }

  document.querySelectorAll('.captura-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      abrir(thumb.dataset.grupo, Number(thumb.dataset.index));
    });
  });

  btnCerrar.addEventListener('click', cerrar);
  btnPrev.addEventListener('click', () => {
    indiceActual = (indiceActual - 1 + grupoActual.length) % grupoActual.length;
    mostrar();
  });
  btnNext.addEventListener('click', () => {
    indiceActual = (indiceActual + 1) % grupoActual.length;
    mostrar();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) cerrar();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowLeft') btnPrev.click();
    if (e.key === 'ArrowRight') btnNext.click();
  });
})();
