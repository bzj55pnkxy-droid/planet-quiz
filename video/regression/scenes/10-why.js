window.PQ.scene("why", (tl, pq) => {
	const at = (id, off) => pq.at(id, off);

	// A beat's container is invisible until its beat starts and fades out just after it ends.
	// The last beat's container is never faded: the video holds on it until the end.
	const box = (sel, beatId, keep) => {
		tl.set(sel, { opacity: 0 }, 0);
		tl.set(sel, { opacity: 1 }, at(beatId, -0.12));
		if (!keep) {
			tl.fromTo(
				sel,
				{ opacity: 1 },
				{ opacity: 0, duration: 0.4, ease: "power1.in", immediateRender: false },
				pq.end(beatId, 0.12),
			);
		}
	};
	const tint = (sel, prop, color, time) => {
		const vars = { duration: 0.4 };
		vars[prop] = color;
		tl.to(sel, vars, time);
	};

	// ---------- beat 1: regression fits two numbers to a numeric pattern ----------
	box("#why-b1", "why-1");
	// "Why such a gap? Regression is built for exactly this."
	pq.reveal("#why-card-reg", at("why-1", 0.2), { y: 0, x: -40, duration: 0.7 });
	pq.reveal("#why-card-reg .why__kick", at("why-1", 1.1), { y: 12 });
	pq.reveal("#why-chart", at("why-1", 1.4), { y: 0, x: 40, duration: 0.7 });
	// "It fits two numbers"
	pq.reveal("#why-t1a", at("why-1", 3.7), { y: 14 });
	pq.reveal("#why-c1a", at("why-1", 4.3), { y: 12 });
	pq.reveal("#why-c1b", at("why-1", 4.8), { y: 12 });
	// "to a numeric pattern": the ten bodies appear
	pq.reveal("#why-t1b", at("why-1", 5.1), { y: 14 });
	for (let i = 0; i < 10; i++) {
		pq.reveal("#why-d-" + i, at("why-1", 5.1 + i * 0.12), { y: 0, duration: 0.35 });
	}
	// "and here the pattern really is a straight line."
	tl.fromTo(
		"#why-line",
		{ strokeDashoffset: 890 },
		{ strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", immediateRender: false },
		at("why-1", 6.7),
	);
	pq.reveal("#why-straight", at("why-1", 7.6), { y: 10 });

	// ---------- beat 2: the language model predicts likely words ----------
	box("#why-b2", "why-2");
	pq.reveal("#why-card-llm", at("why-2", 0.1), { y: 0, x: -40, duration: 0.7 });
	pq.reveal("#why-card-llm .why__kick", at("why-2", 0.3), { y: 12 });
	// "predicts likely words"
	pq.reveal("#why-t2a", at("why-2", 0.6), { y: 14 });
	pq.reveal("#why-prompt", at("why-2", 1.0), { y: 0, x: 40, duration: 0.7 });
	pq.reveal("#why-plabel", at("why-2", 1.3), { y: 10 });
	[0, 1, 2, 3].forEach((i) => pq.reveal("#why-ex-" + i, at("why-2", 1.5 + i * 0.3), { y: 0, x: 30, duration: 0.45 }));
	// "It does not calculate"
	pq.reveal("#why-t2b", at("why-2", 2.9), { y: 14 });
	// the question, then the model's likely-looking answer
	pq.reveal("#why-divider", at("why-2", 3.2), { y: 0, duration: 0.4 });
	pq.reveal("#why-ask", at("why-2", 3.4), { y: 0, x: 30, duration: 0.5 });
	tl.to("#why-qm", { opacity: 0, duration: 0.25 }, at("why-2", 4.6));
	tl.fromTo("#why-ans", { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, at("why-2", 4.7));
	// "it did not work out the pattern from four examples": the truth sits next to the answer
	pq.reveal("#why-actual", at("why-2", 5.6), { y: 12 });
	tint("#why-plabel", "color", "#b794ff", at("why-2", 6.2));

	// ---------- beat 3: retrieval finds similar text, not nearby numbers ----------
	box("#why-b3", "why-3");
	pq.reveal("#why-r-kick", at("why-3", 0.2), { y: 10 });
	// "retrieval did not help much": three questions, each with the same four answers
	[0, 1, 2].forEach((i) => {
		const row = "#why-row-" + i;
		pq.reveal(row + " .why__qchip", at("why-3", 0.4 + i * 0.4), { y: 0, x: -30, duration: 0.45 });
		pq.reveal(row + " .why__rarrow", at("why-3", 0.6 + i * 0.4), { y: 0, x: -20, duration: 0.4 });
		pq.reveal(row + " .why__hits", at("why-3", 0.8 + i * 0.4), { y: 0, x: -30, duration: 0.5 });
	});
	// "It finds similar text, not nearby numbers."
	pq.reveal("#why-banner", at("why-3", 2.9), { y: 16 });
	pq.reveal("#why-bsub", at("why-3", 4.2), { y: 10 });
	pq.reveal("#why-never", at("why-3", 3.9), { y: 0, x: 40, duration: 0.6 });
	pq.reveal("#why-never .why__nlabel", at("why-3", 4.2), { y: 10 });
	pq.reveal("#why-never .why__nchip", at("why-3", 4.6), { y: 12 });
	pq.reveal("#why-never .why__nnote", at("why-3", 5.2), { y: 10 });
	// "The same four bodies came back for all three questions."
	tl.to("#why-b3 .why__hit", { borderColor: "#2dd4bf", duration: 0.5 }, at("why-3", 6.0));

	// ---------- beat 4: the rule of thumb ----------
	box("#why-b4", "why-4");
	pq.reveal("#why-lesson", at("why-4", 0.2), { y: 14 });
	// "For a number that follows a pattern, train a small model."
	pq.reveal("#why-col-a", at("why-4", 1.4), { y: 0, x: -40, duration: 0.6 });
	pq.reveal("#why-col-a .why__icon", at("why-4", 1.7), { y: 12 });
	pq.reveal("#why-cond-a", at("why-4", 2.0), { y: 14 });
	pq.reveal("#why-col-a .why__down", at("why-4", 3.8), { y: 0, duration: 0.4 });
	pq.reveal("#why-tool-a", at("why-4", 4.0), { y: 14 });
	// "For a fact you can quote from a document, use a language model with RAG."
	pq.reveal("#why-col-b", at("why-4", 5.3), { y: 0, x: 40, duration: 0.6 });
	pq.reveal("#why-col-b .why__icon", at("why-4", 5.6), { y: 12 });
	pq.reveal("#why-cond-b", at("why-4", 5.9), { y: 14 });
	pq.reveal("#why-col-b .why__down", at("why-4", 7.8), { y: 0, duration: 0.4 });
	pq.reveal("#why-tool-b", at("why-4", 8.0), { y: 14 });

	// ---------- beat 5: two honest limits ----------
	box("#why-b5", "why-5", true);
	// "We had only three test cases and one run."
	pq.reveal("#why-lim-a", at("why-5", 1.5), { y: 0, x: -40, duration: 0.6 });
	pq.reveal("#why-lim-a .why__ltitle", at("why-5", 1.8), { y: 14 });
	[0, 1, 2].forEach((i) => pq.reveal("#why-ring-" + i, at("why-5", 2.7 + i * 0.3), { y: 0, duration: 0.4 }));
	pq.reveal("#why-run", at("why-5", 4.0), { y: 12 });
	pq.reveal("#why-lim-a .why__lsub", at("why-5", 4.5), { y: 10 });
	// "the regression only works this well because we picked the right shape for the data."
	pq.reveal("#why-lim-b", at("why-5", 4.8), { y: 0, x: 40, duration: 0.6 });
	pq.reveal("#why-lim-b .why__ltitle", at("why-5", 5.1), { y: 14 });
	pq.reveal("#why-mini-raw", at("why-5", 6.3), { y: 14 });
	pq.reveal("#why-mini-log", at("why-5", 7.5), { y: 14 });
	// a calm closing line, held until the video ends
	pq.reveal("#why-closing", pq.end("why-5", 0.1), { y: 10, duration: 1.0 });
});
