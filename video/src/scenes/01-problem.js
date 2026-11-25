window.PQ.scene("problem", (tl, pq) => {
	// Time inside a beat as a fraction (0..1) of its sentence, so the picture still follows the
	// voice when the narration is regenerated. Fractions come from the pauses in the recordings.
	const at = (id, f) => pq.at(id, f * (pq.end(id) - pq.at(id)));
	const el = (id) => document.getElementById(id);
	const glowOff = "rgba(183, 148, 255, 0) 0px 0px 0px 0px";
	const glowOn = "rgba(183, 148, 255, 0.5) 0px 0px 44px 0px";

	// ---- Beat 1: "A language model is trained once. After that, its knowledge is frozen."
	pq.reveal("#problem-model", pq.at("problem-1", -0.3), { scale: 0.92, y: 20 });
	tl.fromTo(
		"#problem-axis",
		{ scaleX: 0, transformOrigin: "left center" },
		{ scaleX: 1, duration: 1, ease: "power2.inOut" },
		at("problem-1", 0.1),
	);
	pq.reveal("#problem-time-label", at("problem-1", 0.2), { y: 0 });
	// "A language model": the card lights up briefly.
	tl.fromTo("#problem-model", { boxShadow: glowOff }, { boxShadow: glowOn, duration: 0.4, immediateRender: false }, at("problem-1", 0.24));
	tl.to("#problem-model", { boxShadow: glowOff, duration: 0.7 }, at("problem-1", 0.24) + 1.2);
	// "trained once": the knowledge bar fills up to the cutoff and a stamp lands.
	tl.fromTo(
		"#problem-bar",
		{ scaleX: 0, transformOrigin: "left center" },
		{ scaleX: 1, duration: 1.2, ease: "power2.inOut", immediateRender: true },
		at("problem-1", 0.3),
	);
	tl.fromTo(
		"#problem-stamp",
		{ opacity: 0, scale: 1.7, rotation: -6 },
		{ opacity: 1, scale: 1, rotation: -6, duration: 0.3, ease: "power3.in", immediateRender: true },
		at("problem-1", 0.4),
	);
	pq.reveal("#problem-bar-text", at("problem-1", 0.45), { y: 0 });
	pq.reveal("#problem-cutoff", at("problem-1", 0.55), { y: 0 });
	// "After that": the world moves on, today slides away from the cutoff.
	const moveStart = at("problem-1", 0.63);
	pq.reveal("#problem-today", moveStart - 0.2, { y: 0, duration: 0.4 });
	tl.fromTo("#problem-today", { x: 0 }, { x: 600, duration: 1.5, ease: "power1.inOut", immediateRender: false }, moveStart + 0.2);
	pq.reveal("#problem-future", moveStart + 0.2, { y: 0, duration: 0.1 });
	tl.fromTo("#problem-future", { width: 0 }, { width: 600, duration: 1.5, ease: "power1.inOut", immediateRender: true }, moveStart + 0.2);
	// "frozen": the padlock closes on the cutoff, the bar gets an icy rim.
	pq.reveal("#problem-lock", at("problem-1", 0.88), { y: -16, scale: 0.5, duration: 0.45 });
	tl.fromTo(
		"#problem-bar",
		{ boxShadow: "rgba(124, 156, 255, 0) 0px 0px 0px 0px", borderColor: "#b794ff" },
		{ boxShadow: "rgba(124, 156, 255, 0.6) 0px 0px 36px 0px", borderColor: "#c7d6ff", duration: 0.6, immediateRender: false },
		at("problem-1", 0.9),
	);
	pq.dismiss("#problem-b1", pq.end("problem-1", 0.2));

	// ---- Beat 2: "...it does not look anything up. It predicts the most likely next words, from memory."
	pq.reveal("#problem-ask", at("problem-2", 0), { x: -40, y: 0 });
	pq.reveal("#problem-arrow-in", at("problem-2", 0.1), { x: -20, y: 0, duration: 0.4 });
	// "does not look anything up": a dashed path to the documents, then crossed out.
	const look = at("problem-2", 0.25);
	pq.reveal("#problem-docs", look, { y: 20 });
	tl.fromTo("#problem-path", { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "none", immediateRender: true }, look + 0.15);
	pq.reveal("#problem-path-head", look + 0.7, { y: 0, duration: 0.2 });
	pq.reveal("#problem-lookup", look + 0.2, { x: -20, y: 0 });
	const cross = at("problem-2", 0.4);
	pq.reveal("#problem-no", cross, { y: 0, scale: 0.4, duration: 0.4 });
	tl.fromTo("#problem-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out", immediateRender: true }, cross + 0.1);
	pq.dim(["#problem-docs", "#problem-path", "#problem-path-head", "#problem-lookup"], cross + 0.8, 0.4);
	// "predicts the most likely next words": the answer fills in one slot at a time.
	const gen = at("problem-2", 0.56);
	pq.reveal("#problem-arrow-out", gen, { x: -20, y: 0, duration: 0.4 });
	pq.reveal("#problem-out", gen + 0.1, { x: 20, y: 0 });
	tl.fromTo("#problem-model", { boxShadow: glowOff }, { boxShadow: glowOn, duration: 0.5, immediateRender: false }, gen);
	tl.to("#problem-ghost-0", { borderColor: "#b794ff", color: "#b794ff", duration: 0.3 }, gen + 0.3);
	const fills = [0.6, 0.67, 0.73, 0.79, 0.84];
	fills.forEach((f, i) => {
		const t = at("problem-2", f);
		tl.to(el("problem-ghost-" + i), { opacity: 0, duration: 0.2 }, t);
		pq.reveal(el("problem-word-" + i), t, { y: 10, scale: 0.9, duration: 0.35 });
		if (i + 1 < fills.length) {
			tl.to(el("problem-ghost-" + (i + 1)), { borderColor: "#b794ff", color: "#b794ff", duration: 0.3 }, t);
		}
	});
	// "from memory"
	pq.reveal("#problem-memory", at("problem-2", 0.86), { y: 12 });
	const out2 = pq.end("problem-2", 0.2);
	pq.dismiss("#problem-b2", out2);
	pq.dismiss("#problem-model", out2);

	// ---- Beat 3: "One run said eighty-three. Another run said one hundred and forty-six."
	pq.reveal("#problem-b3-kicker", at("problem-3", 0.0), { y: -10 });
	pq.reveal("#problem-q", at("problem-3", 0.04), { y: -20 });
	pq.reveal("#problem-local", at("problem-3", 0.2), { y: -10 });
	pq.reveal("#problem-run-1", at("problem-3", 0.43), { x: -30, y: 0 });
	pq.reveal("#problem-num-1", at("problem-3", 0.51), { y: 0, scale: 0.7, duration: 0.5 });
	pq.reveal("#problem-run-2", at("problem-3", 0.68), { x: 30, y: 0 });
	pq.reveal("#problem-num-2", at("problem-3", 0.88), { y: 0, scale: 0.7, duration: 0.5 });
	pq.reveal("#problem-neq", at("problem-3", 0.9), { y: 0, scale: 0.5, duration: 0.4 });
	pq.reveal("#problem-sure-1", at("problem-3", 0.51) + 0.7, { y: 10 });
	pq.reveal("#problem-nosrc-1", at("problem-3", 0.51) + 1.0, { y: 10 });
	pq.reveal("#problem-sure-2", at("problem-3", 0.88) + 0.4, { y: 10 });
	pq.reveal("#problem-nosrc-2", at("problem-3", 0.88) + 0.7, { y: 10 });
	pq.dismiss("#problem-b3", pq.end("problem-3", 0.5));

	// ---- Beat 4: "...out of date. ...made up, ...hallucination. ...cannot check where it came from."
	const card1 = at("problem-4", 0.235);
	pq.reveal("#problem-b4-big", at("problem-4", 0.0), { y: 24 });
	pq.dismiss("#problem-b4-big", card1 - 0.2);
	pq.reveal("#problem-b4-kicker", card1 - 0.2, { y: -10 });
	pq.reveal("#problem-card-1", card1, { y: 40 });
	pq.reveal("#problem-card-1 .problem__m-axis", card1 + 0.4, { y: 0 });
	pq.reveal("#problem-card-1 .problem__m-bar", card1 + 0.5, { x: -20, y: 0 });
	pq.reveal("#problem-card-1 .problem__m-line--cut", card1 + 0.8, { y: 0 });
	pq.reveal("#problem-card-1 .problem__m-label--cut", card1 + 0.8, { y: 0 });
	pq.reveal("#problem-card-1 .problem__m-lock", card1 + 0.95, { y: -12, scale: 0.5, duration: 0.4 });
	pq.reveal("#problem-card-1 .problem__m-future", card1 + 1.2, { x: -20, y: 0 });
	pq.reveal("#problem-card-1 .problem__m-line--today", card1 + 1.2, { y: 0 });
	pq.reveal("#problem-card-1 .problem__m-label--today", card1 + 1.2, { y: 0 });

	const card2 = at("problem-4", 0.435);
	pq.reveal("#problem-card-2", card2, { y: 40 });
	pq.reveal("#problem-card-2 .problem__mini:first-child", card2 + 0.5, { y: 0, scale: 0.8 });
	pq.reveal("#problem-card-2 .problem__mini-neq", card2 + 0.8, { y: 0, scale: 0.6 });
	pq.reveal("#problem-card-2 .problem__mini:nth-child(3)", card2 + 1.1, { y: 0, scale: 0.8 });
	// "hallucination"
	pq.reveal("#problem-halluc", at("problem-4", 0.605), { y: 12 });

	const card3 = at("problem-4", 0.785);
	pq.reveal("#problem-card-3", card3, { y: 40 });
	pq.reveal("#problem-card-3 .problem__mini", card3 + 0.4, { y: 0, scale: 0.8 });
	pq.reveal("#problem-card-3 .problem__dash-arrow", card3 + 0.7, { x: -16, y: 0, duration: 0.4 });
	pq.reveal("#problem-card-3 .problem__ghost-doc", card3 + 1.0, { y: 0, scale: 0.8 });
	pq.reveal("#problem-card-3 .problem__where", card3 + 1.4, { y: 10 });
});
