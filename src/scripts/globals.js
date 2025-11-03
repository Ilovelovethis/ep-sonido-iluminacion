import mainLogo from "../assets/images/logo-upscaled.png";

// Copyright year
const copyrightYear = document.getElementById("copyright-year");

copyrightYear.textContent = new Date().getFullYear();

// Copy telephone and email fields to clipboard
const telephoneElWrapper = document.getElementById("copy-icon-tel-wrapper");
const telephoneEl = document.getElementById("copy-icon-tel");
const telephoneElTooltip = document.getElementById("copy-icon-tooltip-tel");
const emailElWrapper = document.getElementById("copy-icon-email-wrapper");
const emailEl = document.getElementById("copy-icon-email");
const emailElTooltip = document.getElementById("copy-icon-tooltip-email");
let copyMailTimeout, copyTelTimeout, copyTelTimeoutText, copyMailTimeoutText;

// Telephone
telephoneElWrapper.addEventListener("click", () => {
  navigator.clipboard
    .writeText("3585093051")
    .then(() => {
      telephoneEl.style.maskImage = "url('/clipboard-success-icon.svg')";
      telephoneElTooltip.textContent = "Texto copiado correctamente!";

      copyTelTimeout = setTimeout(() => {
        if (copyTelTimeout) {
          clearTimeout(copyTelTimeout);
        }

        telephoneElWrapper.blur();
        telephoneEl.style.maskImage = "url('/copy-suggest-icon.svg')";

        copyTelTimeoutText = setTimeout(() => {
          if (copyTelTimeoutText) {
            clearTimeout(copyTelTimeoutText);
          }
          telephoneElTooltip.textContent = "Copiar al Portapapeles";
        }, 501);
      }, 3300);
    })
    .catch((err) => {
      console.error("Failed to copy telephone number: ", err);
      telephoneEl.style.maskImage = "url('/clipboard-exclamation-icon.svg')";
      telephoneElTooltip.textContent = "Error al copiar el texto.";
    });
});

// Email
emailElWrapper.addEventListener("click", () => {
  navigator.clipboard
    .writeText("epsonido.macias@gmail.com")
    .then(() => {
      emailEl.style.maskImage = "url('/clipboard-success-icon.svg')";
      emailElTooltip.textContent = "Texto copiado correctamente!";

      copyTelTimeout = setTimeout(() => {
        if (copyTelTimeout) {
          clearTimeout(copyTelTimeout);
        }

        emailElWrapper.blur();
        emailEl.style.maskImage = "url('/copy-suggest-icon.svg')";

        copyMailTimeoutText = setTimeout(() => {
          if (copyMailTimeoutText) {
            clearTimeout(copyMailTimeoutText);
          }
          emailElTooltip.textContent = "Copiar al Portapapeles";
        }, 501);
      }, 3300);
    })
    .catch((err) => {
      console.error("Failed to copy telephone number: ", err);
      emailEl.style.maskImage = "url('/clipboard-exclamation-icon.svg')";
      emailElTooltip.textContent = "Error al copiar el texto.";
    });
});

// Scroll animations

/* Classes to add:
  "scrolled" for header
  "scrolled-at-bottom" for header
  "intersected" for logo and motto at foter */

const mainHeader = document.getElementById("main-header");
const mainLogoBottom = document.getElementById("main-logo-bottom");
const mottoQuoteBottom = document.getElementById("motto-quote-bottom");
const mainBottomLeft = document.querySelector(".main-bottom-right");
const headerScrollDownThreshold = 120;
const headerScrollUpThreshold = 80;
const scrollThrottleDelay = 50;
let headerScrollRan = false;
let headerIsScrolled = false;
let isAtBottomNoHeaderScroll = false;
let lastScrollCall = 0;

const matchesDesktopSizeHeaderScroll = window.matchMedia("(min-width: 1200px)");

const footerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // When observing the parent container for both logo and motto
      if (entry.target.classList.contains("main-bottom-right")) {
        if (entry.isIntersecting) {
          mainLogoBottom.classList.add("intersected");
          mottoQuoteBottom.classList.add("intersected");
          mainHeader.classList.add("scrolled-at-bottom");

          isAtBottomNoHeaderScroll = true;
          mainHeader.classList.add("scrolled");
        } else {
          removeAtFooterScrollClasses();
          isAtBottomNoHeaderScroll = false;
        }
      }
    });
  },
  { threshold: 0.5 },
);

// Header scroll listener
function headerScrollAtTop() {
  mainHeader.classList.remove("scrolled");
  headerIsScrolled = false;
}

function updateHeaderScrollState() {
  const scrollY = window.scrollY;

  if (!headerIsScrolled && scrollY > headerScrollDownThreshold) {
    mainHeader.classList.add("scrolled");
    headerIsScrolled = true;
  } else if (headerIsScrolled && scrollY < headerScrollUpThreshold) {
    headerScrollAtTop();
  }

  headerScrollRan = false;
}

function handleHeaderScroll() {
  if (!headerScrollRan) {
    window.requestAnimationFrame(updateHeaderScrollState);
    headerScrollRan = true;
  }
}

function throttledHeaderScrollHandler() {
  const now = Date.now();
  if (
    now - lastScrollCall >= scrollThrottleDelay &&
    !isAtBottomNoHeaderScroll
  ) {
    lastScrollCall = now;
    handleHeaderScroll();
  }
}

function removeAtFooterScrollClasses() {
  mainLogoBottom.classList.remove("intersected");
  mottoQuoteBottom.classList.remove("intersected");
  mainHeader.classList.remove("scrolled-at-bottom");
}

function isDesktopFullScrollFeatures() {
  // Initial update
  updateHeaderScrollState();
  // Add header listener
  window.addEventListener("scroll", throttledHeaderScrollHandler, {
    passive: true,
  });
  // Observe footer bottom-right
  footerObserver.observe(mainBottomLeft);
}

// Initialize scroll features
if (matchesDesktopSizeHeaderScroll.matches) {
  isDesktopFullScrollFeatures();
} else if (!matchesDesktopSizeHeaderScroll.matches) {
  mainLogoBottom.classList.add("intersected");
  mottoQuoteBottom.classList.add("intersected");
}

matchesDesktopSizeHeaderScroll.addEventListener("change", (e) => {
  if (e.matches) {
    isDesktopFullScrollFeatures();
  } else if (!e.matches) {
    window.removeEventListener("scroll", throttledHeaderScrollHandler, {
      passive: true,
    });
    footerObserver.disconnect();
    mainLogoBottom.classList.add("intersected");
    mottoQuoteBottom.classList.add("intersected");
    mainHeader.classList.remove("scrolled-at-bottom");
    headerScrollAtTop();
  }
});

// Burger menu
const burgerBtn = document.getElementById("burger-menu-button");
const burgerMenu = document.getElementById("mobile-nav-menu");

burgerBtn.addEventListener("click", () => {
  burgerBtn.setAttribute(
    "aria-expanded",
    String(!(burgerBtn.getAttribute("aria-expanded") === "true")),
  );
  burgerMenu.classList.toggle("burger-clicked");
});

// Path check on nav links
const fullPath = window.location.pathname;
const headerNavLinks = document.querySelectorAll(
  ".main-nav-inner-wrapper li a",
);
const burgerNavLinks = document.querySelectorAll(".mobile-nav-menu menu li a");

headerNavLinks.forEach((el) => {
  if (el.getAttribute("href") === fullPath) {
    el.classList.add("path-on");
  }
});

burgerNavLinks.forEach((el) => {
  if (el.getAttribute("href") === fullPath) {
    el.classList.add("path-on");
  }
});

if (fullPath.match("/galerias")) {
  document.getElementById("trigger-gallery-menu").classList.add("path-on");
  document.getElementById("burger-gallery-anchor").classList.add("path-on");
}

// Change document title based on slug
const originalTitle = document.title;

if (fullPath !== "/" || "/ep-sonido-iluminacion/") {
  const lowerCaseSlug = fullPath.substring(fullPath.lastIndexOf("/") + 1);
  const capitalizedSlug = lowerCaseSlug.replace(/\b\w/g, (char) =>
    char.toUpperCase(),
  );
  const slug = capitalizedSlug.replace(/-/g, " ");
  document.title = `${slug} - ${originalTitle}`;
}

// Theme selection
const themeSelectionInputs = document.querySelectorAll(
  ".theme-fieldset label input",
);

function setTheme() {
  const themePreference = window.localStorage.getItem("theme") || "system";

  document.body.classList.remove("dark-theme", "light-theme");

  if (themePreference === "dark") {
    document.body.classList.add("dark-theme");
  } else if (themePreference === "light") {
    document.body.classList.add("light-theme");
  }

  themeSelectionInputs.forEach((el) => {
    el.checked = el.value === themePreference;
  });
}

setTheme();

themeSelectionInputs.forEach((el) => {
  el.addEventListener("change", (e) => {
    window.localStorage.setItem("theme", e.currentTarget.value);
    setTheme();
  });
});

// Set favicon and logo for header and footer
const faviconLink = document.createElement("link");
faviconLink.rel = "icon";
faviconLink.type = "image/png";
faviconLink.href = mainLogo;

document.head.appendChild(faviconLink);

const logoTopEl = document.getElementById("main-logo-top");
const logoBottomEl = document.getElementById("main-logo-bottom");

logoTopEl.src = mainLogo;
logoBottomEl.src = mainLogo;
