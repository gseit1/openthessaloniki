/**
 * Open Thessaloniki - Interactive Experience Script (2026)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle-btn');
  const navLinks = document.querySelector('.nav-links-list');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('is-open');
      const isExpanded = navLinks.classList.contains('is-open');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Search Modal & In-page Filter
  const searchBtn = document.querySelector('.search-toggle-btn');
  const searchModal = document.querySelector('.search-modal');
  const searchInput = document.querySelector('.search-input-field');
  const searchForm = document.querySelector('.search-form-wrap');

  if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      searchModal.classList.toggle('is-active');
      if (searchModal.classList.contains('is-active') && searchInput) {
        searchInput.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (searchModal && !searchModal.contains(e.target) && !searchBtn.contains(e.target)) {
        searchModal.classList.remove('is-active');
      }
    });

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!term) return;

        if (window.location.pathname.includes('news.html') || document.querySelector('.news-card-article')) {
          runFilter(term);
        } else {
          window.location.href = `news.html?q=${encodeURIComponent(term)}`;
        }
      });
    }
  }

  // Query parameter search trigger
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q');
  if (q && searchInput) {
    searchInput.value = q;
    if (searchModal) searchModal.classList.add('is-active');
    runFilter(q.toLowerCase());
  }

  function runFilter(query) {
    const cards = document.querySelectorAll('.news-card-article, .bento-card, .project-showcase, .gallery-tile');
    let matched = 0;

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      if (text.includes(query)) {
        card.style.display = '';
        matched++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResults = document.querySelector('.no-search-results');
    if (noResults) {
      noResults.style.display = matched === 0 ? 'block' : 'none';
    }
  }

  // 3. Category Filter Buttons
  const filterPills = document.querySelectorAll('.filter-pill-btn');
  if (filterPills.length > 0) {
    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        filterPills.forEach((p) => p.classList.remove('is-active'));
        pill.classList.add('is-active');

        const category = pill.getAttribute('data-filter');
        const articles = document.querySelectorAll('.news-card-article');

        articles.forEach((art) => {
          if (category === 'all' || art.getAttribute('data-category')?.includes(category)) {
            art.style.display = '';
          } else {
            art.style.display = 'none';
          }
        });
      });
    });
  }

  // 4. Back to Top Button
  const backToTop = document.querySelector('.fab-back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 5. Interactive Lightbox
  setupLightbox();

  function setupLightbox() {
    let overlay = document.querySelector('.image-lightbox-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'image-lightbox-overlay';
      overlay.innerHTML = `
        <div class="image-lightbox-card">
          <button class="image-lightbox-close" aria-label="Κλείσιμο">&times;</button>
          <button class="image-lightbox-arrow prev" aria-label="Προηγούμενη">&#10094;</button>
          <img src="" alt="" class="image-lightbox-frame">
          <div class="image-lightbox-caption"></div>
          <button class="image-lightbox-arrow next" aria-label="Επόμενη">&#10095;</button>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    const frame = overlay.querySelector('.image-lightbox-frame');
    const caption = overlay.querySelector('.image-lightbox-caption');
    const closeBtn = overlay.querySelector('.image-lightbox-close');
    const prevBtn = overlay.querySelector('.image-lightbox-arrow.prev');
    const nextBtn = overlay.querySelector('.image-lightbox-arrow.next');

    let allImages = [];
    let activeIdx = 0;

    const clickableImages = document.querySelectorAll('.gallery-tile-cover img, .preview-mockup-box img, [data-lightbox="true"]');

    clickableImages.forEach((img) => {
      img.addEventListener('click', () => {
        allImages = Array.from(clickableImages);
        activeIdx = allImages.indexOf(img);
        displayLightbox(img);
      });
    });

    function displayLightbox(imgEl) {
      const src = imgEl.getAttribute('data-full-img') || imgEl.src;
      const title = imgEl.alt || imgEl.getAttribute('title') || '';

      frame.src = src;
      frame.alt = title;
      caption.textContent = title;

      overlay.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function hideLightbox() {
      overlay.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    function stepNext() {
      if (allImages.length === 0) return;
      activeIdx = (activeIdx + 1) % allImages.length;
      displayLightbox(allImages[activeIdx]);
    }

    function stepPrev() {
      if (allImages.length === 0) return;
      activeIdx = (activeIdx - 1 + allImages.length) % allImages.length;
      displayLightbox(allImages[activeIdx]);
    }

    closeBtn.addEventListener('click', hideLightbox);
    nextBtn.addEventListener('click', stepNext);
    prevBtn.addEventListener('click', stepPrev);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hideLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('is-active')) return;
      if (e.key === 'Escape') hideLightbox();
      if (e.key === 'ArrowRight') stepNext();
      if (e.key === 'ArrowLeft') stepPrev();
    });
  }
});
