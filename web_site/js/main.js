(function () {
  const scrollToSection = (hash) => {
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      nav?.classList.remove("open");
      history.pushState(null, "", hash);
      scrollToSection(hash);
    });
  });

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  });

  navToggle?.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  const counters = document.querySelectorAll(".stat-item__number[data-target]");
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  const statsSection = document.querySelector(".stats");
  if (statsSection && counters.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            counters.forEach(animateCounter);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(statsSection);
  }

  const cards = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll("#testimonialDots button");
  let current = 0;

  const showTestimonial = (index) => {
    cards.forEach((c, i) => c.classList.toggle("active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    current = index;
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => showTestimonial(i));
  });

  if (cards.length > 1) {
    setInterval(() => {
      showTestimonial((current + 1) % cards.length);
    }, 5000);
  }

  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  const mbbsCards = document.querySelectorAll(".mbbs-card");
  mbbsCards.forEach((card) => {
    card.addEventListener("click", () => {
      const heading = card.querySelector("h3")?.textContent?.trim();
      const destinationSelect = document.querySelector('#contactForm select[name="destination"]');
      if (heading && destinationSelect) {
        for (const option of destinationSelect.options) {
          if (option.textContent.trim() === heading) {
            destinationSelect.value = option.value;
            break;
          }
        }
      }
    });
  });

  const form = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");
  const submitBtn = form?.querySelector('button[type="submit"]');

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMessage.hidden = true;
    formMessage.classList.remove("form-message--error");

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      destination: form.destination.value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      let data = null;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else if (!res.ok) {
        throw new Error("Unable to submit the form right now. Please call or WhatsApp us directly.");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      formMessage.textContent = data.message;
      formMessage.hidden = false;
      form.reset();
      setTimeout(() => {
        formMessage.hidden = true;
      }, 5000);
    } catch (err) {
      formMessage.textContent = err.message;
      formMessage.classList.add("form-message--error");
      formMessage.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Book Free Counselling";
    }
  });
})();
