/* global gsap */
// Shared timeline for the explainer video.
//
// Everything hangs on one paused GSAP timeline that Hyperframes seeks frame by frame, so
// every visual state must be a pure function of time: use tweens (to / fromTo / set) placed
// at absolute times, never setTimeout, CSS animations or callbacks that change the page.
//
// window.TIMING (written by build.ts from the measured narration) gives the times:
//   PQ.at("rag-2")        start of that narration beat, in seconds
//   PQ.at("rag-2", 1.5)   1.5 s after it starts
//   PQ.end("rag-2")       when that beat's sentence ends
//   PQ.chapter("rag")     { start, end } of the whole chapter
// Scene files in src/scenes/ call PQ.scene(chapterId, (tl, pq) => { ... }) and add tweens.
(() => {
	const timing = window.TIMING;
	const tl = gsap.timeline({ paused: true });
	const beats = Object.fromEntries(timing.beats.map((b) => [b.id, b]));
	const chapters = Object.fromEntries(timing.chapters.map((c) => [c.id, c]));
	const FADE = 0.4;

	function beat(id) {
		if (!beats[id]) throw new Error(`Unknown beat "${id}"`);
		return beats[id];
	}

	const PQ = {
		tl,
		timing,
		at: (id, offset = 0) => beat(id).start + offset,
		end: (id, offset = 0) => beat(id).end + offset,
		chapter(id) {
			if (!chapters[id]) throw new Error(`Unknown chapter "${id}"`);
			return chapters[id];
		},
		$: (selector) => document.querySelector(selector),
		$$: (selector) => [...document.querySelectorAll(selector)],

		/** Fade and slide something in at `time`. Start state is hidden from t = 0. */
		reveal(target, time, { y = 28, x = 0, scale = 1, duration = 0.55 } = {}) {
			tl.set(target, { opacity: 0 }, 0);
			tl.fromTo(
				target,
				{ opacity: 0, y, x, scale },
				{ opacity: 1, y: 0, x: 0, scale: 1, duration, ease: "power2.out", immediateRender: false },
				time,
			);
		},
		/** Fade something out at `time`. */
		dismiss(target, time, { duration = 0.4 } = {}) {
			tl.to(target, { opacity: 0, duration, ease: "power1.in" }, time);
		},
		/** Dim to `opacity` at `time` (to push finished material into the background). */
		dim(target, time, opacity = 0.28) {
			tl.to(target, { opacity, duration: 0.4, ease: "power1.inOut" }, time);
		},
		/** Count a number up inside `element` between two times. */
		count(element, from, to, time, { duration = 1, decimals = 0 } = {}) {
			const el = typeof element === "string" ? document.querySelector(element) : element;
			const state = { value: from };
			const write = () => {
				el.textContent = state.value.toFixed(decimals);
			};
			write();
			tl.to(state, { value: to, duration, ease: "power1.out", onUpdate: write }, time);
		},
		/** Registers a chapter's scene: fades its <section> in and out, then lets it add tweens. */
		scene(chapterId, build) {
			const { start, end } = PQ.chapter(chapterId);
			// getElementById, not a template-literal selector: the Hyperframes linter rejects those.
			const section = document.getElementById("scene-" + chapterId);
			if (!section) throw new Error(`Missing <section id="scene-${chapterId}">`);
			const last = end >= timing.duration - 0.01;
			tl.set(section, { opacity: 0, visibility: "hidden" }, 0);
			tl.set(section, { visibility: "visible" }, start);
			tl.to(section, { opacity: 1, duration: FADE, ease: "power1.out" }, start);
			if (!last) {
				tl.to(section, { opacity: 0, duration: FADE, ease: "power1.in" }, end - FADE);
				tl.set(section, { visibility: "hidden" }, end);
			}
			build(tl, PQ);
		},
		/** Called once after all scene files: captions, chapter header, and registration. */
		finish() {
			buildCaptions();
			buildChapterHeader();
			// Pad the timeline to the full video length.
			tl.set({}, {}, timing.duration);
			window.__timelines = window.__timelines || {};
			window.__timelines.root = tl;
		},
	};

	function buildCaptions() {
		const host = document.querySelector("#captions");
		for (const b of timing.beats) {
			const line = document.createElement("p");
			line.className = "captions__line";
			line.textContent = b.caption;
			host.append(line);
			tl.set(line, { opacity: 0 }, 0);
			tl.to(line, { opacity: 1, duration: 0.2 }, b.start);
			tl.to(line, { opacity: 0, duration: 0.2 }, b.end + 0.15);
		}
	}

	function buildChapterHeader() {
		const titles = document.querySelector("#chapter-titles");
		const progress = document.querySelector("#chapter-progress");
		timing.chapters.forEach((c, i) => {
			const title = document.createElement("div");
			title.className = "topbar__chapter";
			title.innerHTML = `<span class="topbar__index">${i + 1}/${timing.chapters.length}</span>${c.title}`;
			titles.append(title);
			tl.set(title, { opacity: 0 }, 0);
			tl.to(title, { opacity: 1, duration: FADE }, c.start);
			if (i < timing.chapters.length - 1) tl.to(title, { opacity: 0, duration: FADE }, c.end - FADE);

			const segment = document.createElement("div");
			segment.className = "topbar__segment";
			segment.style.flexGrow = String(c.end - c.start);
			const fill = document.createElement("div");
			fill.className = "topbar__fill";
			segment.append(fill);
			progress.append(segment);
			tl.fromTo(
				fill,
				{ scaleX: 0 },
				{ scaleX: 1, duration: c.end - c.start, ease: "none", immediateRender: true },
				c.start,
			);
		});
	}

	window.PQ = PQ;
})();
