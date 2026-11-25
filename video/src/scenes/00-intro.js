window.PQ.scene("intro", (tl, pq) => {
	pq.reveal("#intro-kicker", pq.at("intro-1", -0.5));
	pq.reveal("#intro-title", pq.at("intro-1", -0.3));
	pq.reveal("#scene-intro .intro__planet", pq.at("intro-1", 0), { y: 0, scale: 0.85, duration: 1 });
	pq.reveal("#intro-sub", pq.at("intro-1", 1.6));
	// The planet drifts slowly for the whole chapter, so the frame never sits completely still.
	const { start, end } = pq.chapter("intro");
	tl.fromTo(
		"#scene-intro .intro__globe",
		{ y: -8 },
		{ y: 8, duration: end - start, ease: "sine.inOut", immediateRender: false },
		start,
	);
	// "what RAG is, how its pipeline works, and exactly how this project uses it"
	pq.reveal("#intro-item-1", pq.at("intro-2", 2.4));
	pq.reveal("#intro-item-2", pq.at("intro-2", 3.9));
	pq.reveal("#intro-item-3", pq.at("intro-2", 5.6));
});
