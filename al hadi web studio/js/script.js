const businessEmail = "alhadiwebstudio@gmail.com";

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const header = document.querySelector(".site-header");
const yearEl = document.getElementById("currentYear");
const scrollProgress = document.querySelector(".scroll-progress span");
const form = document.getElementById("contactForm");
const motionAllowed =
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  "IntersectionObserver" in window;

const revealGroups = [
  { container: ".service-grid", items: ".service-card", variants: ["left", "bottom", "right"] },
  { container: ".feature-grid", items: ".feature-card", variants: ["left", "right", "bottom", "top"] },
  { container: ".process-grid", items: ".process-card", variants: ["left", "bottom", "top", "right"] },
  { container: ".portfolio-grid", items: ".portfolio-card", variants: ["left", "bottom", "right"] },
  { container: ".pricing-grid", items: ".price-card", variants: ["left", "bottom", "right"] },
];

revealGroups.forEach(({ container, items, variants }) => {
  const group = document.querySelector(container);
  if (!group) return;

  group.querySelectorAll(items).forEach((element, index) => {
    element.dataset.revealVariant = variants[index % variants.length];
    element.style.setProperty("--reveal-delay", `${(index % variants.length) * 75}ms`);
  });
});

if (motionAllowed) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("page-ready");
      document.documentElement.classList.add("motion-ready");
    });
  });
}

const closeMenu = () => {
  if (!menuToggle || !nav) return;
  menuToggle.classList.remove("is-open");
  nav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("menu-open");
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      nav.classList.contains("is-open") &&
      !nav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 840) closeMenu();
  });

  document.documentElement.classList.add("js-enabled");
}

const cursorSystem = document.querySelector(".cursor-system");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (cursorSystem && finePointer.matches && !reducedMotion.matches) {
  const cursorRing = cursorSystem.querySelector(".cursor-ring");
  const cursorDot = cursorSystem.querySelector(".cursor-dot");
  const cursorTrail = [...cursorSystem.querySelectorAll(".cursor-trail")];
  const trailPositions = cursorTrail.map(() => ({ x: 0, y: 0 }));
  let pointerX = 0;
  let pointerY = 0;
  let cursorInitialized = false;
  let ringX = 0;
  let ringY = 0;
  let cursorFrame = 0;
  let movementTimer = 0;
  let activeCard = null;
  let activeMagnetic = null;

  const setCursorPosition = (element, x, y) => {
    element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  };

  const resetElementEffects = () => {
    if (activeCard) {
      activeCard.classList.remove("mouse-tilt-active");
      activeCard.style.removeProperty("--mouse-tilt-x");
      activeCard.style.removeProperty("--mouse-tilt-y");
      activeCard = null;
    }

    if (activeMagnetic) {
      activeMagnetic.classList.remove("mouse-magnetic-active");
      activeMagnetic.style.removeProperty("--mouse-magnetic-x");
      activeMagnetic.style.removeProperty("--mouse-magnetic-y");
      activeMagnetic = null;
    }
  };

  const renderCursor = () => {
    cursorFrame = 0;
    ringX += (pointerX - ringX) * 0.22;
    ringY += (pointerY - ringY) * 0.22;
    setCursorPosition(cursorRing, ringX, ringY);
    setCursorPosition(cursorDot, pointerX, pointerY);

    cursorTrail.forEach((trail, index) => {
      const target = index === 0 ? { x: pointerX, y: pointerY } : trailPositions[index - 1];
      trailPositions[index].x += (target.x - trailPositions[index].x) * 0.3;
      trailPositions[index].y += (target.y - trailPositions[index].y) * 0.3;
      setCursorPosition(trail, trailPositions[index].x, trailPositions[index].y);
    });

    if (activeCard) {
      const bounds = activeCard.getBoundingClientRect();
      const horizontalOffset = (pointerX - (bounds.left + bounds.width / 2)) / Math.max(bounds.width / 2, 1);
      const verticalOffset = (pointerY - (bounds.top + bounds.height / 2)) / Math.max(bounds.height / 2, 1);
      activeCard.style.setProperty("--mouse-tilt-x", `${Math.max(-2, Math.min(2, horizontalOffset * 2))}deg`);
      activeCard.style.setProperty("--mouse-tilt-y", `${Math.max(-2, Math.min(2, verticalOffset * -2))}deg`);
    }

    if (activeMagnetic) {
      const bounds = activeMagnetic.getBoundingClientRect();
      const horizontalOffset = (pointerX - (bounds.left + bounds.width / 2)) / Math.max(bounds.width / 2, 1);
      const verticalOffset = (pointerY - (bounds.top + bounds.height / 2)) / Math.max(bounds.height / 2, 1);
      activeMagnetic.style.setProperty("--mouse-magnetic-x", `${Math.max(-6, Math.min(6, horizontalOffset * 4))}px`);
      activeMagnetic.style.setProperty("--mouse-magnetic-y", `${Math.max(-5, Math.min(5, verticalOffset * 3))}px`);
    }

    const lag = Math.max(Math.abs(pointerX - ringX), Math.abs(pointerY - ringY), ...trailPositions.map(point => Math.max(Math.abs(pointerX - point.x), Math.abs(pointerY - point.y))));
    if (lag > 0.2) cursorFrame = window.requestAnimationFrame(renderCursor);
  };

  const queueCursorFrame = () => {
    if (!cursorFrame) cursorFrame = window.requestAnimationFrame(renderCursor);
  };

  const setCursorTarget = (target) => {
    const element = target instanceof Element ? target : null;
    const button = element?.closest("button, .btn");
    const card = element?.closest(".service-card, .feature-card, .portfolio-card, .price-card");
    const image = element?.closest(".portfolio-preview, .founder-portrait-card");
    const link = element?.closest("a, summary");

    document.body.dataset.cursorTarget = button ? "button" : card ? "card" : image ? "image" : link ? "link" : "";

    if (card !== activeCard) {
      resetElementEffects();
      activeCard = card;
      activeCard?.classList.add("mouse-tilt-active");
    }

    const magneticButton = element?.closest(
      ".hero-actions .btn-primary, .founder-cta, .nav-actions .btn-primary, .final-cta-box .btn-primary"
    );
    if (magneticButton !== activeMagnetic) {
      resetElementEffects();
      activeMagnetic = magneticButton;
      activeMagnetic?.classList.add("mouse-magnetic-active");
    }
  };

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!cursorInitialized) {
      ringX = pointerX;
      ringY = pointerY;
      trailPositions.forEach((point) => {
        point.x = pointerX;
        point.y = pointerY;
      });
      cursorInitialized = true;
    }
    document.documentElement.classList.add("has-custom-cursor");
    document.body.classList.add("cursor-moving");
    setCursorTarget(event.target);
    window.clearTimeout(movementTimer);
    movementTimer = window.setTimeout(() => document.body.classList.remove("cursor-moving"), 100);
    queueCursorFrame();
  }, { passive: true });

  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") document.body.classList.add("cursor-pressed");
  }, { passive: true });

  window.addEventListener("pointerup", () => document.body.classList.remove("cursor-pressed"), { passive: true });

  window.addEventListener("pointerleave", () => {
    document.documentElement.classList.remove("has-custom-cursor");
    document.body.classList.remove("cursor-moving", "cursor-pressed");
    delete document.body.dataset.cursorTarget;
    window.clearTimeout(movementTimer);
    resetElementEffects();
  });
}

let previousScrollY = window.scrollY;
let scrollFrame = 0;

const updateScrollState = () => {
  scrollFrame = 0;
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - previousScrollY;

  if (Math.abs(scrollDelta) > 1) {
    document.documentElement.dataset.scrollDirection = scrollDelta > 0 ? "down" : "up";
    previousScrollY = currentScrollY;
  }

  if (header) header.classList.toggle("scrolled", currentScrollY > 12);

  if (scrollProgress) {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? currentScrollY / scrollableHeight : 0;
    scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }
};

const handleScroll = () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollState);
};

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", handleScroll, { passive: true });
handleScroll();

if (motionAllowed) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.dataset.scrollDirection =
          document.documentElement.dataset.scrollDirection || "down";
        entry.target.classList.toggle("visible", entry.isIntersecting);
      });
    },
    {
      rootMargin: "-8% 0px -8% 0px",
      threshold: 0.12,
    }
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const revealElementsInViewport = () => {
    document.querySelectorAll(".reveal").forEach((element) => {
      const rect = element.getBoundingClientRect();
      const visibleInViewport = rect.bottom > window.innerHeight * 0.08 && rect.top < window.innerHeight * 0.92;

      if (visibleInViewport) {
        element.dataset.scrollDirection = document.documentElement.dataset.scrollDirection || "down";
        element.classList.add("visible");
      }
    });
  };

  requestAnimationFrame(() => requestAnimationFrame(revealElementsInViewport));
  window.setTimeout(revealElementsInViewport, 900);
  window.addEventListener("hashchange", () => window.setTimeout(revealElementsInViewport, 700));

  const sectionLinks = new Map(
    [...navLinks].map((link) => [link.hash.slice(1), link])
  );
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link, sectionId) => {
          if (sectionId === entry.target.id) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
  );

  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (form) {
  form.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      event.target.setCustomValidity("");
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const websiteType = String(formData.get("websiteType") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const nameField = form.elements.namedItem("name");
    const messageField = form.elements.namedItem("message");

    if (!name || !message) {
      nameField.setCustomValidity(name ? "" : "Please enter your name.");
      messageField.setCustomValidity(message ? "" : "Please enter a message.");
      form.reportValidity();
      return;
    }

    const subject = encodeURIComponent(`Website inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nBusiness / Company: ${company || "Not provided"}\nWebsite Type: ${websiteType || "Not provided"}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
  });
}

const qaItems = document.querySelectorAll(".faq-item");
qaItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    qaItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.removeAttribute("open");
      }
    });
  });
});
