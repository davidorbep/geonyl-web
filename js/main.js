/**
 * GEONYL - JAVASCRIPT MASTER CORE
 * Animaciones GSAP 3 + ScrollTrigger + Lenis Smooth Scroll
 * Menú móvil con fondo 100% sólido, foco atrapado y cierre con Esc
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Atrapa el foco del teclado dentro de un contenedor y lo devuelve al cerrar. */
function createFocusTrap(container) {
  let previouslyFocused = null;

  const getItems = () =>
    Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);

  const onKeydown = (e) => {
    if (e.key !== 'Tab') return;
    const items = getItems();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (!container.contains(active)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return {
    activate(initialFocus) {
      previouslyFocused = document.activeElement;
      document.addEventListener('keydown', onKeydown);
      const target = initialFocus || getItems()[0];
      if (target) target.focus();
    },
    deactivate(restoreFocus = true) {
      document.removeEventListener('keydown', onKeydown);
      if (restoreFocus && previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
      previouslyFocused = null;
    }
  };
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Lenis Smooth Scroll
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 1.5,
    });

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 2. Registro de Plugins GSAP
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 3. Header dinámico con sombra al hacer scroll
  const header = document.getElementById('main-header');
  if (header && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      start: 'top -30',
      onUpdate: (self) => {
        if (self.scroll() > 40) {
          header.classList.add('shadow-md', 'py-3');
          header.classList.remove('py-4');
        } else {
          header.classList.remove('shadow-md', 'py-3');
          header.classList.add('py-4');
        }
      }
    });
  }

  // 4. Hero Section - Entrada Fluida
  if (typeof gsap !== 'undefined') {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

    heroTl
      .fromTo('.hero-anim-item', 
        { opacity: 0, y: 22 }, 
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.75 }
      )
      .fromTo('.hero-card-side', 
        { opacity: 0, scale: 0.98, y: 20 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.8 }, 
        '-=0.5'
      );

    // 5. ScrollTrigger: Revelación suave de tarjetas
    const revealCards = document.querySelectorAll('.arch-card');
    revealCards.forEach((card) => {
      gsap.fromTo(card,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // 6. Animación de Contadores Numéricos (admite decimales con data-decimals)
    const formatCounter = (value, decimals) => value.toFixed(decimals);
    document.querySelectorAll('.counter-val').forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target')) || 0;
      const decimals = parseInt(counter.getAttribute('data-decimals'), 10) || 0;

      if (prefersReducedMotion) {
        counter.textContent = formatCounter(target, decimals);
        return;
      }

      const state = { value: 0 };
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(state, {
            value: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => { counter.textContent = formatCounter(state.value, decimals); },
            onComplete: () => { counter.textContent = formatCounter(target, decimals); }
          });
        }
      });
    });
  } else {
    // Sin GSAP: mostrar directamente los valores finales
    document.querySelectorAll('.counter-val').forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target')) || 0;
      const decimals = parseInt(counter.getAttribute('data-decimals'), 10) || 0;
      counter.textContent = target.toFixed(decimals);
    });
  }

  // 7. Menú Móvil Fullscreen Drawer (fondo blanco sólido, foco atrapado, cierre con Esc)
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu-drawer');
  const closeMenuBtn = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  let menuOpen = false;
  let closeMenu = () => {};

  if (mobileMenuBtn && mobileMenu) {
    const menuTrap = createFocusTrap(mobileMenu);

    const openMenu = () => {
      if (menuOpen) return;
      menuOpen = true;
      if (typeof gsap !== 'undefined') gsap.killTweensOf(mobileMenu);
      mobileMenu.classList.remove('hidden');
      mobileMenu.style.display = 'flex';
      mobileMenu.style.backgroundColor = '#ffffff';
      mobileMenu.setAttribute('aria-hidden', 'false');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();

      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        gsap.fromTo(mobileMenu, { x: '100%' }, { x: '0%', duration: 0.35, ease: 'power3.out' });
      }
      menuTrap.activate(closeMenuBtn);
    };

    closeMenu = ({ restoreFocus = true } = {}) => {
      if (!menuOpen) return;
      menuOpen = false;
      document.body.style.overflow = '';
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      if (lenis) lenis.start();

      const hide = () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.style.display = 'none';
      };

      // Con enlaces ancla el foco debe seguir al destino, no volver al botón
      menuTrap.deactivate(restoreFocus);

      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        gsap.to(mobileMenu, { x: '100%', duration: 0.25, ease: 'power3.in', onComplete: hide });
      } else {
        hide();
      }
    };

    mobileMenuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => closeMenu());
    mobileLinks.forEach((link) => link.addEventListener('click', () => closeMenu({ restoreFocus: false })));
  }

  // 8. Modal Selector de Llamada Rápida (foco atrapado, cierre con Esc y clic fuera)
  const callModal = document.getElementById('call-modal');
  const callModalTriggers = document.querySelectorAll('.open-call-modal');
  const closeCallModalBtn = document.getElementById('close-call-modal');
  const callModalBackdrop = document.getElementById('call-modal-backdrop');

  let modalOpen = false;
  let hideModal = () => {};

  if (callModal && callModalTriggers.length > 0) {
    const modalTrap = createFocusTrap(document.getElementById('call-modal-content'));

    const showModal = (e) => {
      if (e) e.preventDefault();
      if (modalOpen) return;
      modalOpen = true;
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf(['#call-modal-content', '#call-modal-backdrop']);
      }
      callModal.classList.remove('hidden');
      callModal.setAttribute('aria-hidden', 'false');
      if (lenis) lenis.stop();

      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        gsap.fromTo('#call-modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.2 });
        gsap.fromTo('#call-modal-content',
          { opacity: 0, scale: 0.94, y: 12 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.4)' }
        );
      }
      modalTrap.activate(closeCallModalBtn);
    };

    hideModal = () => {
      if (!modalOpen) return;
      modalOpen = false;
      callModal.setAttribute('aria-hidden', 'true');
      if (lenis) lenis.start();
      modalTrap.deactivate();

      const hide = () => callModal.classList.add('hidden');
      if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        gsap.to('#call-modal-content', { opacity: 0, scale: 0.96, duration: 0.2, onComplete: hide });
        gsap.to('#call-modal-backdrop', { opacity: 0, duration: 0.2 });
      } else {
        hide();
      }
    };

    callModalTriggers.forEach((btn) => btn.addEventListener('click', showModal));
    if (closeCallModalBtn) closeCallModalBtn.addEventListener('click', hideModal);
    if (callModalBackdrop) callModalBackdrop.addEventListener('click', hideModal);
  }

  // Tecla Esc: cierra primero el modal (capa superior) y luego el menú
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (modalOpen) hideModal();
    else if (menuOpen) closeMenu();
  });

  // 8b. Botones "Cotizar" de cada servicio: preseleccionan el servicio en el formulario
  const serviceSelect = document.getElementById('form-service');
  document.querySelectorAll('[data-service]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!serviceSelect) return;
      const wanted = link.getAttribute('data-service');
      const exists = Array.from(serviceSelect.options).some((o) => o.value === wanted);
      if (exists) {
        serviceSelect.value = wanted;
        serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  // 8c. Capa de scroll: progreso de lectura, sección activa en el menú y revelado de títulos
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.2 }
      });
    }

    document.querySelectorAll('section:not(#hero) h2, section:not(#hero) h2 + p').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        }
      );
    });
  }

  if (typeof ScrollTrigger !== 'undefined') {
    const navLinks = Array.from(document.querySelectorAll('#main-header nav a[href^="#"]'));
    navLinks.forEach((link) => {
      const section = document.getElementById(link.getAttribute('href').slice(1));
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => {
          if (!self.isActive) return;
          navLinks.forEach((l) => { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'true');
        }
      });
    });
  }

  // 8e. Selector personalizado (reemplaza el desplegable nativo, que no admite estilos)
  document.querySelectorAll('[data-custom-select]').forEach((wrap) => {
    const select = wrap.querySelector('select');
    if (!select) return;

    const uid = select.id || `select-${Math.random().toString(36).slice(2, 7)}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = `${uid}-button`;
    button.className = 'select-button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `${uid}-list`);
    button.innerHTML =
      '<span class="select-value"></span>' +
      '<svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    const valueEl = button.querySelector('.select-value');

    const list = document.createElement('ul');
    list.id = `${uid}-list`;
    list.className = 'select-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('tabindex', '-1');
    list.setAttribute('data-lenis-prevent', '');
    list.hidden = true;

    const options = Array.from(select.options).map((opt, i) => {
      const li = document.createElement('li');
      li.id = `${uid}-opt-${i}`;
      li.className = 'select-option';
      li.setAttribute('role', 'option');
      li.dataset.value = opt.value;
      li.innerHTML =
        `<span>${opt.textContent}</span>` +
        '<svg class="select-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
      list.appendChild(li);
      return li;
    });

    wrap.appendChild(button);
    wrap.appendChild(list);
    wrap.classList.add('is-enhanced');
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');

    const fieldLabel = document.querySelector(`label[for="${select.id}"]`);
    if (fieldLabel) fieldLabel.setAttribute('for', button.id);

    let activeIndex = select.selectedIndex;

    const setActive = (index) => {
      activeIndex = Math.max(0, Math.min(options.length - 1, index));
      options.forEach((o, i) => o.classList.toggle('is-active', i === activeIndex));
      list.setAttribute('aria-activedescendant', options[activeIndex].id);
      options[activeIndex].scrollIntoView({ block: 'nearest' });
    };

    const sync = () => {
      const idx = Math.max(0, select.selectedIndex);
      valueEl.textContent = select.options[idx].textContent;
      options.forEach((o, i) => o.setAttribute('aria-selected', String(i === idx)));
    };

    const openList = () => {
      list.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      setActive(select.selectedIndex);
      list.focus({ preventScroll: true });
    };

    const closeList = (returnFocus = true) => {
      if (list.hidden) return;
      list.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (returnFocus) button.focus({ preventScroll: true });
    };

    const choose = (index) => {
      select.selectedIndex = index;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      closeList();
    };

    button.addEventListener('click', () => (list.hidden ? openList() : closeList()));
    button.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
    });

    list.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setActive(activeIndex + 1); break;
        case 'ArrowUp': e.preventDefault(); setActive(activeIndex - 1); break;
        case 'Home': e.preventDefault(); setActive(0); break;
        case 'End': e.preventDefault(); setActive(options.length - 1); break;
        case 'Enter':
        case ' ': e.preventDefault(); choose(activeIndex); break;
        case 'Escape': e.preventDefault(); e.stopPropagation(); closeList(); break;
        case 'Tab': closeList(false); break;
        default: {
          if (e.key.length === 1 && /\S/.test(e.key)) {
            const letter = e.key.toLowerCase();
            const ordered = [...options.slice(activeIndex + 1), ...options.slice(0, activeIndex + 1)];
            const hit = ordered.find((o) => o.textContent.trim().toLowerCase().startsWith(letter));
            if (hit) setActive(options.indexOf(hit));
          }
        }
      }
    });

    options.forEach((o, i) => {
      o.addEventListener('mousemove', () => setActive(i));
      o.addEventListener('click', () => choose(i));
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) closeList(false);
    });

    select.addEventListener('change', sync);
    const parentForm = select.closest('form');
    if (parentForm) parentForm.addEventListener('reset', () => setTimeout(sync, 0));
    sync();
  });

  // 9. Formulario de Contacto
  const form = document.getElementById('geonyl-contact-form');
  const successAlert = document.getElementById('form-success-message');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name')?.value.trim();
      const phone = document.getElementById('form-phone')?.value.trim();
      const service = document.getElementById('form-service')?.value || 'General';
      const message = document.getElementById('form-message')?.value.trim() || 'Consulta de servicios';

      // Errores en línea, debajo de cada campo
      const nameInput = document.getElementById('form-name');
      const phoneInput = document.getElementById('form-phone');
      const setError = (input, message) => {
        let err = document.getElementById(`${input.id}-error`);
        if (!message) {
          if (err) err.remove();
          input.removeAttribute('aria-invalid');
          input.removeAttribute('aria-describedby');
          return;
        }
        if (!err) {
          err = document.createElement('p');
          err.id = `${input.id}-error`;
          err.className = 'field-error';
          err.setAttribute('role', 'alert');
          input.insertAdjacentElement('afterend', err);
        }
        err.textContent = message;
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', err.id);
      };

      setError(nameInput, name ? '' : 'Ingrese su nombre o el de su empresa.');
      setError(phoneInput, phone ? '' : 'Ingrese un teléfono de contacto.');
      if (!name || !phone) {
        (name ? phoneInput : nameInput).focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando Solicitud...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '¡Solicitud Registrada con Éxito!';
        
        if (successAlert) {
          successAlert.classList.remove('hidden');
        }

        const encodedMsg = encodeURIComponent(
          `Hola Geonyl, deseo solicitar cotización formal:\n\n*Nombre:* ${name}\n*Teléfono:* ${phone}\n*Servicio:* ${service}\n*Detalle:* ${message}`
        );
        const waLink = `https://wa.me/593999202754?text=${encodedMsg}`;

        const redirectBox = document.getElementById('form-whatsapp-redirect');
        if (redirectBox) {
          redirectBox.innerHTML = `
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 mt-3 text-sm font-bold text-[#007c74] hover:text-[#005f58] bg-teal-50 border border-teal-200 px-3.5 py-2 rounded-xl">
              <span>Continuar en WhatsApp con estos datos</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          `;
        }

        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
        }, 5000);
      }, 700);
    });
  }
});
