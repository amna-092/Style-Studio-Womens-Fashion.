
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // 1. FOOTER YEAR
  // =====================================
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // =====================================
  // 2. VISITOR COUNTER
  // Demo: counts browser visits, not unique people
  // =====================================
  const visitorElement = document.getElementById("visitorCount");

  try {
    const storageKey = "bellevilleVisitorCount";
    const previousCount = Number(localStorage.getItem(storageKey)) || 0;
    const newCount = previousCount + 1;

    localStorage.setItem(storageKey, String(newCount));

    if (visitorElement) {
      visitorElement.textContent = newCount.toLocaleString();
    }
  } catch (error) {
    if (visitorElement) {
      visitorElement.textContent = "1";
    }
  }

  // =====================================
  // 3. LIVE DATE AND TIME
  // =====================================
  const dateTimeElements = [
    document.getElementById("liveDateTime"),
    document.getElementById("tickerDateTime")
  ];

  function updateClock() {
    const now = new Date();

    const formatted = now.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    dateTimeElements.forEach(element => {
      if (element) {
        element.textContent = formatted;
      }
    });
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  // =====================================
  // 4. GEOLOCATION
  // User permission is required by browser
  // =====================================
  const locationElement = document.getElementById("liveLocation");
  const tickerLocation = document.getElementById("tickerLocation");

  function setLocation(message) {
    if (locationElement) {
      locationElement.textContent = message;
    }

    if (tickerLocation) {
      tickerLocation.textContent = message;
    }
  }

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setLocation("Geolocation is not supported by this browser.");
      return;
    }

    setLocation("Waiting for location permission...");

    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude.toFixed(4);
        const longitude = position.coords.longitude.toFixed(4);

        setLocation(
          `Coordinates: ${latitude}, ${longitude}`
        );
      },
      error => {
        let message = "Location unavailable";

        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out";
        }

        setLocation(message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  // Location is requested only after a user action.
  const locationButton = document.createElement("button");

  locationButton.type = "button";
  locationButton.className = "btn btn-sm btn-outline-teal ms-2";
  locationButton.textContent = "Share Location";
  locationButton.setAttribute("aria-label", "Allow location access");

  const ticker = document.querySelector(".ticker");

  if (ticker) {
    ticker.insertAdjacentElement("beforebegin", locationButton);
    locationButton.style.margin = "8px 12px";
    locationButton.addEventListener("click", requestLocation);
  }

  // =====================================
  // 5. ACTIVE NAVIGATION
  // =====================================
  const navLinks = document.querySelectorAll(
    '.main-nav .nav-link[href^="#"]'
  );

  function setActiveLink() {
    const currentHash = window.location.hash || "#home";

    navLinks.forEach(link => {
      const isActive = link.getAttribute("href") === currentHash;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const target = document.querySelector(link.getAttribute("href"));

      if (target) {
        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");
      }

      // Close mobile navigation after selection.
      const menu = document.getElementById("mainMenu");

      if (menu && menu.classList.contains("show") && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  window.addEventListener("hashchange", setActiveLink);
  setActiveLink();

  // =====================================
  // 6. SCROLL REVEAL ANIMATIONS
  // =====================================
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(element => {
      element.classList.add("revealed");
    });
  }

  // =====================================
  // 7. EDUCATIONAL GUIDE POPUPS
  // =====================================
  const guideTitle = document.getElementById("guideTitle");
  const guideBody = document.getElementById("guideBody");
  const guideModalElement = document.getElementById("guideModal");

  document.querySelectorAll(".learn-more").forEach(button => {
    button.addEventListener("click", () => {
      if (!guideModalElement || !window.bootstrap) return;

      guideTitle.textContent = button.dataset.title || "Dental Guide";
      guideBody.textContent = button.dataset.content || "";

      bootstrap.Modal.getOrCreateInstance(guideModalElement).show();
    });
  });

  // =====================================
  // 8. PRODUCT CATEGORY FILTERS
  // =====================================
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productItems = document.querySelectorAll(".product-item");
  const productSearch = document.getElementById("productSearch");
  const noProducts = document.getElementById("noProducts");

  let activeCategory = "all";

  function filterProducts() {
    const query = (productSearch?.value || "")
      .trim()
      .toLowerCase();

    let visibleCount = 0;

    productItems.forEach(item => {
      const category = item.dataset.category || "";
      const name = item.dataset.name || "";
      const text = item.textContent.toLowerCase();

      const categoryMatches =
        activeCategory === "all" || category === activeCategory;

      const searchMatches =
        name.toLowerCase().includes(query) || text.includes(query);

      const visible = categoryMatches && searchMatches;

      item.hidden = !visible;

      if (visible) visibleCount++;
    });

    if (noProducts) {
      noProducts.hidden = visibleCount !== 0;
    }
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.filter || "all";

      filterButtons.forEach(filter => {
        const selected = filter === button;

        filter.classList.toggle("active", selected);
        filter.setAttribute("aria-pressed", String(selected));
      });

      filterProducts();
    });

    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("active"))
    );
  });

  if (productSearch) {
    productSearch.addEventListener("input", filterProducts);
  }

  // =====================================
  // 9. PRODUCT RATINGS
  // Demo rating: saved separately per browser
  // =====================================
  function getStoredRating(productId) {
    try {
      const value = localStorage.getItem(
        "bellevilleRating_" + productId
      );

      const rating = Number(value);

      return Number.isInteger(rating) && rating >= 1 && rating <= 5
        ? rating
        : 0;
    } catch (error) {
      return 0;
    }
  }

  function renderRating(productId, rating) {
    const ratingContainer = document.querySelector(
      `.rating-input[data-product="${productId}"]`
    );

    const display = document.querySelector(
      `.rating-display[data-rating-for="${productId}"]`
    );

    if (ratingContainer) {
      ratingContainer.querySelectorAll("button").forEach(button => {
        const starValue = Number(button.dataset.rating);
        const selected = starValue <= rating;

        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(starValue === rating));
      });
    }

    if (display) {
      const stars = display.querySelector(".stars");
      const score = display.querySelector("small");

      if (stars) {
        stars.textContent =
          "★".repeat(rating) + "☆".repeat(5 - rating);
      }

      if (score) {
        score.textContent = rating > 0
          ? `${rating}/5 (your rating)`
          : "Not rated";
      }
    }
  }

  document.querySelectorAll(".rating-input").forEach(container => {
    const productId = container.dataset.product;

    if (!productId) return;

    renderRating(productId, getStoredRating(productId));

    container.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        const rating = Number(button.dataset.rating);

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return;
        }

        try {
          localStorage.setItem(
            "bellevilleRating_" + productId,
            String(rating)
          );

          renderRating(productId, rating);

          const help = container.parentElement.querySelector(".rating-help");

          if (help) {
            help.textContent = `Your rating: ${rating} out of 5 stars`;
          }
        } catch (error) {
          window.alert(
            "Your browser could not save this rating. Please check browser storage settings."
          );
        }
      });
    });
  });

  // =====================================
  // 10. GALLERY LIGHTBOX
  // =====================================
  const galleryModal = document.getElementById("galleryModal");
  const galleryImage = document.getElementById("galleryModalImage");
  const galleryCaption = document.getElementById("galleryCaption");

  document.querySelectorAll(".gallery-item").forEach(button => {
    button.addEventListener("click", () => {
      if (!galleryModal || !window.bootstrap) return;

      const imageURL = button.dataset.image;
      const caption = button.dataset.caption || "Dental gallery";

      if (!imageURL || !galleryImage) return;

      galleryImage.src = imageURL;
      galleryImage.alt = caption;

      if (galleryCaption) {
        galleryCaption.textContent = caption;
      }

      bootstrap.Modal.getOrCreateInstance(galleryModal).show();
    });
  });

  if (galleryModal && galleryImage) {
    galleryModal.addEventListener("hidden.bs.modal", () => {
      galleryImage.removeAttribute("src");
    });
  }

  // =====================================
  // 11. CONTACT FORM VALIDATION
  // Demo only: no backend or email delivery
  // =====================================
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  if (contactForm) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (formMessage) {
        formMessage.className = "mt-3 text-success";
        formMessage.textContent =
          "Demo validation successful! The form is working, but no message was sent. Connect a backend to receive enquiries.";
      }

      contactForm.reset();
    });
  }

  // =====================================
  // 12. BACK TO TOP BUTTON
  // =====================================
  const backToTop = document.getElementById("backToTop");

  function updateBackToTop() {
    if (!backToTop) return;

    backToTop.classList.toggle("visible", window.scrollY > 400);
  }

  window.addEventListener("scroll", updateBackToTop, {
    passive: true
  });

  updateBackToTop();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // =====================================
  // 13. EXTERNAL LINK SAFETY
  // =====================================
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.setAttribute("rel", "noopener noreferrer");
  });

});
