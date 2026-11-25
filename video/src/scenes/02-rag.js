window.PQ.scene("rag", (tl, pq) => {
	// Time inside a beat as a fraction (0..1) of its sentence, so the picture still follows the
	// voice when the narration is regenerated. Fractions come from the pauses in the recordings.
	const at = (id, f) => pq.at(id, f * (pq.end(id) - pq.at(id)));
	const el = (id) => document.getElementById(id);
	const glowOff = (rgb) => `rgba(${rgb}, 0) 0px 0px 0px 0px`;
	const glowOn = (rgb) => `rgba(${rgb}, 0.4) 0px 0px 44px 0px`;
	const BORDER = "#2e3b6b";
	// A step card lights up (coloured rim and glow) or goes back to normal.
	const light = (id, rgb, hex, t) => {
		tl.to(el(id), { borderColor: hex, duration: 0.4 }, t);
		tl.fromTo(el(id), { boxShadow: glowOff(rgb) }, { boxShadow: glowOn(rgb), duration: 0.4, immediateRender: false }, t);
	};
	const unlight = (id, rgb, t) => {
		tl.to(el(id), { borderColor: BORDER, duration: 0.4 }, t);
		tl.to(el(id), { boxShadow: glowOff(rgb), duration: 0.4 }, t);
	};

	// ---- Beat 1: "RAG stands for retrieval augmented generation."
	pq.reveal("#rag-letter-r", pq.at("rag-1", -0.3), { y: 0, scale: 0.6, duration: 0.5 });
	pq.reveal("#rag-letter-a", at("rag-1", 0.07), { y: 0, scale: 0.6, duration: 0.5 });
	pq.reveal("#rag-letter-g", at("rag-1", 0.14), { y: 0, scale: 0.6, duration: 0.5 });
	pq.reveal("#rag-word-r", at("rag-1", 0.29), { y: 24 });
	pq.reveal("#rag-word-a", at("rag-1", 0.53), { y: 24 });
	pq.reveal("#rag-word-g", at("rag-1", 0.72), { y: 24 });
	pq.dismiss("#rag-b1", pq.end("rag-1", 0.2));

	// ---- Beat 2: "Think of an open-book exam. Instead of answering from memory, the model first gets
	// the relevant pages, and then answers from those pages."
	pq.reveal("#rag-exam", at("rag-2", 0.0), { y: -10 });
	pq.reveal("#rag-closed", at("rag-2", 0.08), { x: -30, y: 0 });
	pq.reveal("#rag-open", at("rag-2", 0.15), { x: 30, y: 0 });
	// "Instead of answering from memory": the closed-book side.
	pq.reveal("#rag-closed-icon", at("rag-2", 0.26), { y: -14 });
	pq.reveal("#rag-closed-a1", at("rag-2", 0.29), { y: 0, duration: 0.4 });
	pq.reveal("#rag-closed-x", at("rag-2", 0.31), { y: 0, scale: 0.5, duration: 0.4 });
	pq.reveal("#rag-closed-model", at("rag-2", 0.33), { y: 14 });
	pq.reveal("#rag-closed-a2", at("rag-2", 0.38), { y: 0, duration: 0.4 });
	pq.reveal("#rag-closed-answer", at("rag-2", 0.42), { y: 14 });
	// "the model first gets the relevant pages": pages travel from the book to the model.
	pq.dim("#rag-closed", at("rag-2", 0.5), 0.4);
	pq.reveal("#rag-open-icon", at("rag-2", 0.475), { y: -14 });
	pq.reveal("#rag-open-a1", at("rag-2", 0.5), { y: 0, duration: 0.4 });
	[0.52, 0.57, 0.62].forEach((f, i) => {
		const fly = el("rag-fly-" + (i + 1));
		const t = at("rag-2", f);
		tl.set(fly, { opacity: 0 }, 0);
		tl.fromTo(fly, { y: 0 }, { y: 84, duration: 0.7, ease: "power1.in", immediateRender: false }, t);
		tl.to(fly, { opacity: 1, duration: 0.15 }, t);
		tl.to(fly, { opacity: 0, duration: 0.15 }, t + 0.55);
	});
	pq.reveal("#rag-open-model", at("rag-2", 0.54), { y: 14 });
	// "and then answers from those pages"
	pq.reveal("#rag-open-a2", at("rag-2", 0.785), { y: 0, duration: 0.4 });
	pq.reveal("#rag-open-answer", at("rag-2", 0.81), { y: 14 });
	pq.dismiss("#rag-b2", pq.end("rag-2", 0.2));

	// ---- Beat 3: "Three words, three steps. Retrieval: find the passages that match the question."
	pq.reveal("#rag-step-1", at("rag-3", 0.04), { y: 30 });
	pq.reveal("#rag-link-1", at("rag-3", 0.1), { x: -14, y: 0, duration: 0.4 });
	pq.reveal("#rag-step-2", at("rag-3", 0.12), { y: 30 });
	pq.reveal("#rag-link-2", at("rag-3", 0.18), { x: -14, y: 0, duration: 0.4 });
	pq.reveal("#rag-step-3", at("rag-3", 0.2), { y: 30 });
	// "Retrieval:" lights up the first step and pushes the others back.
	const retrieval = at("rag-3", 0.367);
	light("rag-step-1", "124, 156, 255", "#7c9cff", retrieval);
	pq.dim(["#rag-step-2", "#rag-step-3"], retrieval, 0.45);
	pq.reveal("#rag-s1-q", at("rag-3", 0.42), { y: -12 });
	pq.reveal("#rag-s1-down", at("rag-3", 0.5), { y: 0, duration: 0.3 });
	// "find the passages that match": four passages, numbered.
	[0.56, 0.65, 0.74, 0.83].forEach((f, i) => {
		pq.reveal(el("rag-p-" + (i + 1)), at("rag-3", f), { y: 16, scale: 0.92 });
	});

	// ---- Beat 4: "Augmented: paste those passages into the prompt. Generation: the model writes
	// the answer from them."
	const augmented = at("rag-4", 0.0);
	unlight("rag-step-1", "124, 156, 255", augmented);
	pq.dim("#rag-step-1", augmented, 0.5);
	tl.to("#rag-step-2", { opacity: 1, duration: 0.4 }, augmented);
	light("rag-step-2", "251, 191, 36", "#fbbf24", augmented);
	pq.reveal("#rag-s2-title", at("rag-4", 0.02), { y: 0 });
	pq.reveal("#rag-step-2 .rag__sheet-rows", at("rag-4", 0.03), { y: 0 });
	// "paste those passages into the prompt": the four passages travel across into the prompt sheet.
	[0.133, 0.21, 0.29, 0.36].forEach((f, i) => {
		tl.fromTo(
			el("rag-pr-" + (i + 1)),
			{ x: -560, scale: 0.5, opacity: 0 },
			{ x: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power2.out", immediateRender: true },
			at("rag-4", f),
		);
	});
	pq.reveal("#rag-pr-q", at("rag-4", 0.45), { y: 12 });
	// "Generation:" the model reads the prompt and writes the answer.
	const generation = at("rag-4", 0.528);
	unlight("rag-step-2", "251, 191, 36", generation);
	pq.dim("#rag-step-2", generation, 0.5);
	tl.to("#rag-step-3", { opacity: 1, duration: 0.4 }, generation);
	light("rag-step-3", "183, 148, 255", "#b794ff", generation);
	pq.reveal("#rag-s3-model", at("rag-4", 0.54), { y: -12 });
	pq.reveal("#rag-s3-down", at("rag-4", 0.62), { y: 0, duration: 0.3 });
	pq.reveal("#rag-s3-ans", at("rag-4", 0.715), { y: 0, scale: 0.9 });
	pq.reveal("#rag-s3-cite", at("rag-4", 0.85), { y: 10 });
	pq.dismiss("#rag-b3", pq.end("rag-4", 0.2));

	// ---- Beat 5: "RAG does not retrain the model. The weights stay exactly the same. Only the input changes."
	pq.reveal("#rag-w-title-l", at("rag-5", 0.0), { y: -10 });
	pq.reveal("#rag-sheet-l", at("rag-5", 0.04), { y: 20 });
	pq.reveal("#rag-w-arrow-l", at("rag-5", 0.1), { y: 0, duration: 0.3 });
	pq.reveal("#rag-block-l", at("rag-5", 0.16), { y: 20 });
	// "RAG does not retrain the model": the same setup on the right, retraining crossed out.
	pq.reveal("#rag-w-title-r", at("rag-5", 0.262), { y: -10 });
	pq.reveal("#rag-sheet-r", at("rag-5", 0.27), { y: 20 });
	pq.reveal("#rag-w-arrow-r", at("rag-5", 0.29), { y: 0, duration: 0.3 });
	pq.reveal("#rag-block-r", at("rag-5", 0.31), { y: 20 });
	pq.reveal("#rag-retrain", at("rag-5", 0.37), { x: -10, y: 0 });
	tl.fromTo("#rag-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out", immediateRender: true }, at("rag-5", 0.43));
	// "The weights stay exactly the same": an equals sign, both blocks glow green.
	const same = at("rag-5", 0.562);
	pq.dismiss("#rag-retrain", same);
	pq.reveal("#rag-eq", same, { y: 0, scale: 0.6, duration: 0.5 });
	["rag-block-l", "rag-block-r"].forEach((id) => {
		tl.to(el(id), { borderColor: "#4ade80", duration: 0.4 }, same);
		tl.fromTo(el(id), { boxShadow: glowOff("74, 222, 128") }, { boxShadow: glowOn("74, 222, 128"), duration: 0.4, immediateRender: false }, same);
	});
	// "Only the input changes": the right-hand sheet grows by the four passages.
	const changed = at("rag-5", 0.823);
	pq.reveal("#rag-neq", changed, { y: 0, scale: 0.6, duration: 0.5 });
	tl.fromTo(
		"#rag-sheet-r",
		{ height: 80 },
		{ height: 240, duration: 0.9, ease: "power2.inOut", immediateRender: true },
		changed,
	);
	tl.to("#rag-sheet-r", { borderColor: "#fbbf24", duration: 0.4 }, changed);
	["rag-w-p4", "rag-w-p3", "rag-w-p2", "rag-w-p1"].forEach((id, i) => {
		pq.reveal(el(id), changed + 0.25 + i * 0.14, { y: 10 });
	});
});
