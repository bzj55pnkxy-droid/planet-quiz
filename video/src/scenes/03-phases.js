window.PQ.scene("phases", (tl, pq) => {
	// Time inside a beat as a fraction (0..1) of its sentence, so the picture still follows the
	// voice when the narration is regenerated. Fractions come from the pauses in the recordings.
	const at = (id, f) => pq.at(id, f * (pq.end(id) - pq.at(id)));

	// ---- Beat 1: "A RAG system has two phases. Indexing happens once, before anyone asks anything.
	// We turn our documents into a searchable store."
	pq.reveal("#phases-lane-1", at("phases-1", 0.02), { y: 24 });
	pq.reveal("#phases-lane-2", at("phases-1", 0.12), { y: 24 });
	pq.dim("#phases-lane-2", at("phases-1", 0.3), 0.3);
	// "Indexing happens once"
	pq.reveal("#phases-when-1", at("phases-1", 0.341), { y: 0, scale: 0.7, duration: 0.5 });
	// "before anyone asks anything"
	pq.reveal("#phases-note-1", at("phases-1", 0.52), { y: 10 });
	// "We turn our documents into a searchable store"
	pq.reveal("#phases-doc", at("phases-1", 0.75), { y: 20 });
	tl.fromTo(
		"#phases-a1",
		{ scaleX: 0, transformOrigin: "left center" },
		{ scaleX: 1, duration: 0.5, ease: "power2.out", immediateRender: true },
		at("phases-1", 0.83),
	);
	pq.reveal("#phases-store", at("phases-1", 0.9), { y: 20 });

	// ---- Beat 2: "Answering happens on every question."
	const t = (f) => at("phases-2", f);
	tl.to("#phases-lane-2", { opacity: 1, duration: 0.4 }, t(0));
	pq.reveal("#phases-when-2", t(0.3), { y: 0, scale: 0.7, duration: 0.5 });
	pq.reveal("#phases-n-question", t(0.02), { y: 20 });
	pq.reveal("#phases-a2", t(0.1), { x: -10, y: 0, duration: 0.3 });
	pq.reveal("#phases-n-retrieval", t(0.14), { y: 20 });
	// The store feeds retrieval.
	pq.reveal("#phases-feed", t(0.2), { y: 0, duration: 0.1 });
	tl.fromTo("#phases-feed", { height: 0 }, { height: 232, duration: 0.5, ease: "power1.inOut", immediateRender: true }, t(0.2));
	pq.reveal("#phases-feed-chip", t(0.36), { x: -10, y: 0 });
	pq.reveal("#phases-a3", t(0.26), { x: -10, y: 0, duration: 0.3 });
	pq.reveal("#phases-n-prompt", t(0.34), { y: 20 });
	pq.reveal("#phases-a4", t(0.42), { x: -10, y: 0, duration: 0.3 });
	pq.reveal("#phases-n-generation", t(0.5), { y: 20 });
	pq.reveal("#phases-a5", t(0.58), { x: -10, y: 0, duration: 0.3 });
	pq.reveal("#phases-n-answer", t(0.66), { y: 20 });
	// Every question starts the lane again.
	tl.fromTo("#phases-loop-line", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut", immediateRender: true }, t(0.8));
	pq.reveal("#phases-loop-head", t(0.8) + 0.5, { y: 0, duration: 0.2 });
	pq.reveal("#phases-loop-chip", t(0.8) + 0.2, { y: 0, duration: 0.3 });
});
