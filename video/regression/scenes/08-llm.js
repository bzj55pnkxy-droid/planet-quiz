window.PQ.scene("llm", (tl, pq) => {
	const at = (id, off) => pq.at(id, off);
	const HL = "rgba(124, 156, 255, 0.28)";
	const NOHL = "rgba(124, 156, 255, 0)";

	// A beat's container is invisible until its beat starts and fades out just after it ends.
	const box = (sel, beatId) => {
		tl.set(sel, { opacity: 0 }, 0);
		tl.set(sel, { opacity: 1 }, at(beatId, -0.12));
		tl.fromTo(
			sel,
			{ opacity: 1 },
			{ opacity: 0, duration: 0.4, ease: "power1.in", immediateRender: false },
			pq.end(beatId, 0.12),
		);
	};
	const glow = (sel, time, on) => {
		tl.to(sel, { backgroundColor: on ? HL : NOHL, duration: 0.35, ease: "power1.inOut" }, time);
	};
	const strike = (sel, time) => {
		tl.set(sel, { scaleX: 0 }, 0);
		tl.fromTo(sel, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, time);
	};

	// ---------- beat 1: the second contestant ----------
	box("#llm-b1", "llm-1");
	// The card starts centred and slides right to make room for the three test distances.
	tl.set("#llm-cwrap", { x: -382 }, 0);
	tl.to("#llm-cwrap", { x: 0, duration: 0.9, ease: "power2.inOut" }, at("llm-1", 3.9));
	pq.reveal("#llm-card", at("llm-1", 0.4), { y: 0, scale: 0.94, duration: 0.8 });
	pq.reveal("#llm-csub", at("llm-1", 2.0), { y: 14 });
	// "It gets the same three test distances."
	pq.reveal("#llm-t-kick", at("llm-1", 4.6), { y: 12 });
	[0, 1, 2].forEach((i) => {
		pq.reveal("#llm-t-" + i, at("llm-1", 5.0 + i * 0.45), { y: 0, x: -40 });
		pq.reveal("#llm-ar-" + i, at("llm-1", 5.15 + i * 0.45), { y: 0, x: -30, duration: 0.45 });
	});

	// ---------- beat 2: build_store() ----------
	box("#llm-b2", "llm-2");
	pq.reveal("#llm-b2-code", at("llm-2", 0.15), { y: 14 });
	// "writes one sentence per training body"
	pq.reveal("#llm-bodies-head", at("llm-2", 1.1), { y: 12 });
	for (let i = 0; i < 7; i++) {
		pq.reveal("#llm-body-" + i, at("llm-2", 1.3 + i * 0.13), { y: 0, x: -26, duration: 0.4 });
	}
	pq.reveal("#llm-a2a", at("llm-2", 2.2), { y: 0, x: -20, duration: 0.4 });
	pq.reveal("#llm-sents-head", at("llm-2", 2.2), { y: 12 });
	pq.reveal("#llm-sent-0", at("llm-2", 2.4), { y: 0, x: -30 });
	pq.reveal("#llm-sent-1", at("llm-2", 2.8), { y: 0, x: -30 });
	pq.reveal("#llm-sent-2", at("llm-2", 3.2), { y: 0, x: -30 });
	pq.reveal("#llm-sent-more", at("llm-2", 3.6), { y: 10 });
	pq.reveal("#llm-sent-note", at("llm-2", 3.9), { y: 10 });
	// "with its distance and its period"
	tl.to(".llm__n--d", { color: "#7c9cff", duration: 0.4 }, at("llm-2", 3.8));
	tl.to(".llm__n--p", { color: "#fbbf24", duration: 0.4 }, at("llm-2", 4.7));
	// "and saves them in a vector database"
	pq.reveal("#llm-a2b", at("llm-2", 5.6), { y: 0, x: -20, duration: 0.4 });
	pq.reveal("#llm-db", at("llm-2", 5.7), { y: 0, scale: 0.9, duration: 0.6 });
	for (let i = 0; i < 8; i++) {
		const pill = "#llm-pill-" + i;
		tl.set(pill, { opacity: 0 }, 0);
		tl.fromTo(
			pill,
			{ opacity: 0, x: -430 },
			{ opacity: 1, x: 0, duration: 0.5, ease: "power2.out", immediateRender: false },
			at("llm-2", 6.1 + i * 0.16),
		);
	}
	pq.reveal("#llm-dbcount", at("llm-2", 7.2), { y: 10 });

	// ---------- beat 3: the leak check ----------
	box("#llm-b3", "llm-3");
	pq.reveal("#llm-b3-code", at("llm-3", 0.15), { y: 14 });
	tl.to("#llm-b3-code .llm__ln--ctx", { opacity: 0.5, duration: 0.4 }, at("llm-3", 0.6));
	glow("#llm-assert", at("llm-3", 0.6), true);
	pq.reveal("#llm-db3", at("llm-3", 0.9), { y: 0, scale: 0.92 });
	// "no test body"
	pq.reveal("#llm-held-b-head", at("llm-3", 1.5), { y: 10 });
	[0, 1, 2].forEach((i) => pq.reveal("#llm-xb-" + i, at("llm-3", 1.7 + i * 0.22), { y: 0, x: 30, duration: 0.45 }));
	// "and no test answer"
	pq.reveal("#llm-held-a-head", at("llm-3", 2.5), { y: 10 });
	[0, 1, 2].forEach((i) => pq.reveal("#llm-xa-" + i, at("llm-3", 2.7 + i * 0.22), { y: 0, x: 30, duration: 0.45 }));
	// "is in that database": all six are crossed out
	[0, 1, 2].forEach((i) => {
		strike("#llm-sb-" + i, at("llm-3", 3.9 + i * 0.18));
		strike("#llm-sa-" + i, at("llm-3", 4.1 + i * 0.18));
	});
	tl.to("#llm-b3 .llm__x", { opacity: 0.65, duration: 0.5 }, at("llm-3", 4.7));
	pq.reveal("#llm-verdict", at("llm-3", 4.9), { y: 0, scale: 0.9, duration: 0.6 });
	tl.fromTo(
		"#llm-check",
		{ strokeDashoffset: 150 },
		{ strokeDashoffset: 0, duration: 0.5, ease: "power2.out", immediateRender: false },
		at("llm-3", 5.2),
	);
	// "If one is, the program stops."
	pq.reveal("#llm-stop", at("llm-3", 6.0), { y: 16 });

	// ---------- beat 4: run_cases() ----------
	box("#llm-b4", "llm-4");
	pq.reveal("#llm-b4-code", at("llm-4", 0.1), { y: 14 });
	// "For each test case, run cases ..."
	glow("#llm-ln-query", at("llm-4", 1.1), true);
	pq.reveal("#llm-query", at("llm-4", 1.2), { y: 0, x: -30 });
	glow("#llm-ln-query", at("llm-4", 2.3), false);
	glow("#llm-ln-hits", at("llm-4", 2.3), true);
	pq.reveal("#llm-a4a", at("llm-4", 2.2), { y: 0, x: -20, duration: 0.4 });
	pq.reveal("#llm-db4", at("llm-4", 2.3), { y: 0, scale: 0.92 });
	pq.reveal("#llm-k", at("llm-4", 2.6), { y: 10 });
	pq.reveal("#llm-a4b", at("llm-4", 2.9), { y: 0, x: -20, duration: 0.4 });
	// empty slots wait for the answers; "retrieves the four most similar sentences"
	pq.reveal("#llm-scorehead", at("llm-4", 3.0), { y: 10 });
	for (let i = 0; i < 4; i++) {
		pq.reveal("#llm-slot-" + i, at("llm-4", 2.9 + i * 0.08), { y: 0, duration: 0.4 });
		pq.reveal("#llm-hit-" + i, at("llm-4", 3.2 + i * 0.5), { y: 0, x: -150, duration: 0.55 });
		pq.reveal("#llm-score-" + i, at("llm-4", 3.5 + i * 0.5), { y: 0, x: -20, duration: 0.4 });
		pq.dismiss("#llm-slot-" + i, at("llm-4", 4.9), { duration: 0.3 });
	}
	// "and puts them in the prompt as reference examples": the sentences join the prompt
	glow("#llm-ln-hits", at("llm-4", 5.0), false);
	glow("#llm-ln-examples", at("llm-4", 5.0), true);
	pq.reveal("#llm-panel", at("llm-4", 4.9), { y: 0, scale: 0.97, duration: 0.6 });
	tl.to(".llm__hit", { borderColor: "rgba(45, 212, 191, 0)", duration: 0.5 }, at("llm-4", 5.3));
	pq.reveal("#llm-ph-human", at("llm-4", 5.3), { y: 10 });
	pq.reveal("#llm-ph-ref", at("llm-4", 5.9), { y: 10 });
	tl.to("#llm-ph-ref", { color: "#b794ff", duration: 0.4 }, at("llm-4", 6.4));

	// ---------- beat 5: one number back, asked twice ----------
	box("#llm-b5", "llm-5");
	// "The model must reply with a single number."
	pq.reveal("#llm-flow-node", at("llm-5", 0.2), { y: 0, x: -30 });
	pq.reveal("#llm-flow-arrow", at("llm-5", 0.8), { y: 0, x: -20, duration: 0.4 });
	pq.reveal("#llm-pred", at("llm-5", 0.5), { y: 14 });
	glow("#llm-pred-doc", at("llm-5", 1.3), true);
	pq.reveal("#llm-reply", at("llm-5", 1.9), { y: 0, x: -30 });
	pq.dismiss("#llm-a5", at("llm-5", 3.0));
	// "We ask twice: once with the examples, and once without."
	pq.reveal("#llm-col-with", at("llm-5", 3.4), { y: 20 });
	pq.reveal("#llm-mini-with", at("llm-5", 4.0), { y: 12 });
	pq.reveal("#llm-dw-with", at("llm-5", 4.5), { y: 0, scale: 0.6, duration: 0.4 });
	pq.reveal("#llm-res-with", at("llm-5", 4.7), { y: 14 });
	pq.reveal("#llm-col-without", at("llm-5", 4.9), { y: 20 });
	pq.reveal("#llm-mini-without", at("llm-5", 5.1), { y: 12 });
	pq.reveal("#llm-dw-without", at("llm-5", 5.4), { y: 0, scale: 0.6, duration: 0.4 });
	pq.reveal("#llm-res-without", at("llm-5", 5.6), { y: 14 });

	// ---------- beat 6: what the language model never gets ----------
	box("#llm-b6", "llm-6");
	pq.reveal("#llm-fair-head", at("llm-6", 0.1), { y: 12 });
	pq.reveal("#llm-card6", at("llm-6", 0.3), { y: 0, x: 40 });
	// "never sees the regression, its two numbers, or any code"
	pq.reveal("#llm-i-0", at("llm-6", 0.6), { y: 0, x: -30 });
	pq.reveal("#llm-bl-0", at("llm-6", 1.5), { y: 0, scale: 0.8, duration: 0.4 });
	pq.reveal("#llm-i-1", at("llm-6", 2.4), { y: 0, x: -30 });
	pq.reveal("#llm-bl-1", at("llm-6", 3.3), { y: 0, scale: 0.8, duration: 0.4 });
	pq.reveal("#llm-i-2", at("llm-6", 3.7), { y: 0, x: -30 });
	pq.reveal("#llm-bl-2", at("llm-6", 4.5), { y: 0, scale: 0.8, duration: 0.4 });
	// "That keeps the comparison fair."
	pq.reveal("#llm-fair", at("llm-6", 5.3), { y: 16, scale: 0.94 });
});
