window.PQ.scene("recap", (tl, pq) => {
	const $ = (id) => document.getElementById(id);
	// Light up a pipeline step (or arrow): from dim to full colour with a soft glow.
	const light = (el, time) =>
		tl.fromTo(
			el,
			{ opacity: 0.3, boxShadow: "0 0 0px rgba(238,241,251,0)" },
			{ opacity: 1, boxShadow: "0 0 36px rgba(238,241,251,0.38)", duration: 0.35, ease: "power2.out", immediateRender: false },
			time,
		);
	const lightArrow = (el, time) =>
		tl.fromTo(el, { opacity: 0.3 }, { opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, time);

	// ---- beat 1: three limits, each as it is named ----
	// "If retrieval misses the right passage, the answer will be wrong or empty."
	pq.reveal("#recap-limit-1", pq.at("recap-1", 1.5), { y: 26 });
	pq.reveal("#recap-pages-top", pq.at("recap-1", 1.9), { y: 12, duration: 0.5 });
	pq.reveal("#recap-page-miss", pq.at("recap-1", 3.4), { y: 12, duration: 0.5 });
	pq.reveal("#recap-page-x", pq.at("recap-1", 5.3), { y: 0, scale: 1.2, duration: 0.4 });
	// "A small model can still misread a passage."
	pq.reveal("#recap-limit-2", pq.at("recap-1", 6.6), { y: 26 });
	pq.reveal("#recap-model-page", pq.at("recap-1", 7.0), { y: 12, duration: 0.5 });
	pq.reveal("#recap-model-node", pq.at("recap-1", 7.6), { y: 12, duration: 0.5 });
	pq.reveal("#recap-model-q", pq.at("recap-1", 8.5), { y: 0, scale: 0.8, duration: 0.4 });
	// "And every answer takes several seconds on a laptop."
	pq.reveal("#recap-limit-3", pq.at("recap-1", 9.6), { y: 26 });
	tl.fromTo(
		"#recap-hand",
		{ rotation: 0 },
		{ rotation: 360, duration: 3.2, ease: "none", immediateRender: false },
		pq.at("recap-1", 10.2),
	);
	pq.dismiss("#recap-limits", pq.end("recap-1", 0.3));

	// ---- beat 2: index once ----
	pq.reveal("#recap-row-1", pq.at("recap-2", 0.1), { y: 20 });
	// "extract, clean, chunk, embed, store."
	const stepTimes1 = [1.6, 2.3, 2.9, 3.4, 3.9];
	stepTimes1.forEach((t, i) => {
		light($("recap-s1-" + i), pq.at("recap-2", t));
		if (i > 0) lightArrow($("recap-a1-" + (i - 1)), pq.at("recap-2", t - 0.25));
	});

	// ---- beat 3: every question ----
	pq.dim("#recap-row-1", pq.at("recap-3", 0), 0.6);
	pq.reveal("#recap-row-2", pq.at("recap-3", 0.1), { y: 20 });
	// "embed, retrieve the top four, build the prompt, generate."
	const stepTimes2 = [1.7, 2.1, 3.55, 4.7];
	stepTimes2.forEach((t, i) => {
		light($("recap-s2-" + i), pq.at("recap-3", t));
		if (i > 0) lightArrow($("recap-a2-" + (i - 1)), pq.at("recap-3", t - 0.25));
	});

	// ---- beat 4: the closing line, with the map dimmed behind it ----
	tl.to(["#recap-row-1", "#recap-row-2"], { opacity: 0.14, duration: 0.6, ease: "power1.inOut" }, pq.at("recap-4", 0));
	pq.reveal("#recap-line-1", pq.at("recap-4", 0.1), { y: 24, duration: 0.7 });
	pq.reveal("#recap-line-2", pq.at("recap-4", 1.7), { y: 24, duration: 0.7 });
});
