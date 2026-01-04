(() => {
	// Ensure English page language if HTML still has lang="ru"
	if (document?.documentElement?.lang === "ru") document.documentElement.lang = "en";

	const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

	// Force a clean black background (no gradients/images)
	if (document.body) {
		document.body.style.setProperty("background", "none", "important");
		document.body.style.setProperty("background-color", "#000000", "important");
	}

	// Make footer slightly lighter than body (subtle)
	const footer = document.querySelector(".site-footer");
	if (footer) {
		footer.style.setProperty("background-color", "rgba(255,255,255,0.03)", "important");
		footer.style.setProperty("border-top-color", "rgba(255,255,255,0.10)", "important");
	}

	// Footer year
	const y = document.getElementById("y");
	if (y) y.textContent = String(new Date().getFullYear());

	// Smooth scroll for in-page anchor links (current page only)
	document.addEventListener("click", (e) => {
		const a = e.target?.closest?.("a[data-scroll]");
		if (!a) return;

		const href = a.getAttribute("href") || "";
		if (!href.startsWith("#")) return;

		const el = document.querySelector(href);
		if (!el) return;

		e.preventDefault();
		el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
	});

	// Reveal-on-scroll
	const nodes = document.querySelectorAll(".reveal");
	if (!nodes.length) return;

	if (!("IntersectionObserver" in window)) {
		nodes.forEach((n) => n.classList.add("is-visible"));
		return;
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const en of entries) {
				if (en.isIntersecting) {
					en.target.classList.add("is-visible");
					io.unobserve(en.target);
				}
			}
		},
		{ root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
	);

	nodes.forEach((n) => io.observe(n));

	// Your photo (place file into: портфель2/assets/img/)
	const PHOTO_CANDIDATES = [
		"assets/img/me.jpg",
		"assets/img/me.png",
		"assets/img/me.webp",
	];

	const ensurePhotoTuningStyles = () => {
		if (document.getElementById("photo-tuning-styles")) return;

		const style = document.createElement("style");
		style.id = "photo-tuning-styles";
		style.textContent = `
			/* Keep the hero photo/card tasteful in size */
			.hero-card{ max-width: 420px; margin-left:auto; }
			.avatar{ max-height: 520px; }
			.avatar img{
				width:100%;
				height:100%;
				object-fit:cover;
				/* tweak if needed: 50% 20%..40% */
				object-position: 50% 30%;
			}

			@media (max-width: 980px){
				.hero-card{ max-width: 520px; margin-left:0; }
				.avatar{ max-height: 520px; }
			}
			@media (max-width: 640px){
				.hero-card{ max-width: 100%; }
				.avatar{ max-height: 440px; }
			}
		`;
		document.head.appendChild(style);
	};

	const loadFirstAvailable = async (paths) => {
		for (const p of paths) {
			// Try to load as an image to confirm it exists
			const ok = await new Promise((resolve) => {
				const test = new Image();
				test.onload = () => resolve(true);
				test.onerror = () => resolve(false);
				test.src = p;
			});
			if (ok) return p;
		}
		return null;
	};

	const mountHeroPhoto = async () => {
		const img = document.querySelector(".hero .avatar img");
		if (!img) return;

		const src = img.getAttribute("src") || "";
		const isPlaceholder = src.includes("via.placeholder.com") || src.trim() === "";

		// Only replace placeholder images automatically
		if (!isPlaceholder) return;

		const found = await loadFirstAvailable(PHOTO_CANDIDATES);
		if (!found) return;

		img.src = found;
		if (!img.getAttribute("alt") || img.getAttribute("alt")?.toLowerCase().includes("placeholder")) {
			img.alt = "My photo";
		}
		img.decoding = "async";
		img.loading = "lazy";
	};

	ensurePhotoTuningStyles();
	mountHeroPhoto();
})();
