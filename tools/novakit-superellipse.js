/**
 * @name NovaKit Superellipse
 * @description A JavaScript component to apply a superellipse shape to any HTML element using CSS clip-path.
 * It's responsive and updates automatically when the element's size or data attributes change.
 * @version 1.0.0
 * @author OG-Open-Source
 * @license MIT
 */

(function (window) {
	"use strict";

	if (typeof window.NovaKit === "undefined") {
		window.NovaKit = {};
	}

	/**
	 * ==================================================================================
	 * CORE FUNCTIONS
	 * ==================================================================================
	 */

	/**
	 * Calculates the path data for a "hybrid" superellipse, which provides visually consistent corners
	 * even when the aspect ratio is not 1:1. This is the recommended mode for UI elements.
	 * @param {number} a - The semi-axis in the x-direction (width / 2).
	 * @param {number} b - The semi-axis in the y-direction (height / 2).
	 * @param {number} n - The exponent that controls the shape's roundness.
	 * @param {number} [steps=100] - The number of points to generate the path.
	 * @returns {string} The SVG path data string.
	 */
	function getHybridSuperellipsePath(a, b, n, steps = 100) {
		const r = Math.min(a, b);
		const n2 = 2 / n;
		const points = [];
		for (let i = 0; i <= steps; i++) {
			const t = (i * 2 * Math.PI) / steps;
			const cosT = Math.cos(t);
			const sinT = Math.sin(t);
			const x_u = Math.sign(cosT) * Math.pow(Math.abs(cosT), n2);
			const y_u = Math.sign(sinT) * Math.pow(Math.abs(sinT), n2);
			const x = x_u * r + Math.sign(x_u) * (a - r);
			const y = y_u * r + Math.sign(y_u) * (b - r);
			points.push({ x, y });
		}
		// Translate the path so its top-left is at (0,0)
		return `${points.map((p, i) => `${i === 0 ? "M" : "L"} ${(p.x + a).toFixed(3)} ${(-p.y + b).toFixed(3)}`).join(" ")} Z`;
	}

	/**
	 * ==================================================================================
	 * SUPER ELLIPSE CLASS
	 * ==================================================================================
	 */

	class NovaKitSuperellipse {
		/**
		 * @param {HTMLElement} element The element to apply the superellipse shape to.
		 */
		constructor(element) {
			this.element = element;
			this.observer = null;
			this.mutationObserver = null;
			this.init();
		}

		/**
		 * Initializes the observers and performs the initial render.
		 */
		init() {
			this.render();

			this.observer = new ResizeObserver(() => this.render());
			this.observer.observe(this.element);

			this.mutationObserver = new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					if (mutation.type === "attributes" && mutation.attributeName.startsWith("data-")) {
						this.render();
						return;
					}
				}
			});
			this.mutationObserver.observe(this.element, { attributes: true });
		}

		/**
		 * Reads attributes, calculates the superellipse path, and applies it to the element.
		 */
		render() {
			const rect = this.element.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) return;

			const n = parseFloat(this.element.dataset.n) || 4;
			const pathData = getHybridSuperellipsePath(rect.width / 2, rect.height / 2, n);
			this.element.style.clipPath = `path('${pathData}')`;
		}

		/**
		 * Disconnects all observers to clean up the instance.
		 */
		destroy() {
			if (this.observer) this.observer.disconnect();
			if (this.mutationObserver) this.mutationObserver.disconnect();
			this.element.style.clipPath = "";
		}
	}

	/**
	 * ==================================================================================
	 * INITIALIZATION
	 * ==================================================================================
	 */

	/**
	 * Finds all elements with the `data-superellipse` attribute and initializes the component.
	 */
	function initSuperellipse() {
		const elements = document.querySelectorAll("[data-superellipse]");
		elements.forEach((el) => {
			if (!el.superellipseInstance) {
				el.superellipseInstance = new NovaKitSuperellipse(el);
			}
		});
	}

	window.NovaKit.Superellipse = NovaKitSuperellipse;
	window.NovaKit.initSuperellipse = initSuperellipse;

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initSuperellipse);
	} else {
		initSuperellipse();
	}
})(window);
