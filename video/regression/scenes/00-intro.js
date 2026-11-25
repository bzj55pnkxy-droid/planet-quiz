window.PQ.scene("intro", (tl, pq) => {
	// Fade an element in to a given opacity (for the "faded hint" of the quiz app).
	const fadeTo = (target, time, opacity, duration = 0.7) => {
		tl.set(target, { opacity: 0 }, 0);
		tl.fromTo(
			target,
			{ opacity: 0 },
			{ opacity, duration, ease: "power2.out", immediateRender: false },
			time,
		);
	};

	// ---- beat 1: "Our exam project has a second part: a small experiment, separate from the quiz app." ----
	pq.reveal("#intro-kicker", pq.at("intro-1", -0.35), { y: 14 });
	pq.reveal("#intro-part", pq.at("intro-1", 1.3), { y: 30, duration: 0.7 });
	pq.reveal("#intro-title", pq.at("intro-1", 2.5), { y: 22 });
	pq.reveal("#intro-sub", pq.at("intro-1", 3.7), { y: 14 });
	fadeTo("#intro-quiz", pq.at("intro-1", 3.7), 0.38, 0.9);
	pq.reveal("#intro-quiztag", pq.at("intro-1", 4.1), { y: 10 });
	pq.dismiss("#intro-b1", pq.end("intro-1", 0.15));

	// ---- beat 2: two contestants, one number ----
	// "a linear regression model" ... "and a local language model with RAG" ... "predict the same number" ... "compare them"
	pq.reveal("#intro-reg", pq.at("intro-2", 1.5), { y: 0, x: -50, duration: 0.7 });
	pq.reveal("#intro-vs", pq.at("intro-2", 3.1), { y: 0, scale: 0.6, duration: 0.5 });
	pq.reveal("#intro-llm", pq.at("intro-2", 3.5), { y: 0, x: 50, duration: 0.7 });
	fadeTo("#intro-target", pq.at("intro-2", 0.8), 0.3, 0.8);
	tl.to("#intro-target", { opacity: 1, duration: 0.5, ease: "power2.out" }, pq.at("intro-2", 5.8));
	pq.reveal("#intro-ttext", pq.at("intro-2", 5.8), { y: 12, duration: 0.6 });
	pq.reveal("#intro-arrow-reg", pq.at("intro-2", 6.2), { y: -20, duration: 0.5 });
	pq.reveal("#intro-arrow-llm", pq.at("intro-2", 6.3), { y: -20, duration: 0.5 });
	pq.reveal("#intro-compare", pq.at("intro-2", 7.4), { y: 14 });
	pq.dismiss("#intro-b2", pq.end("intro-2", 0.15));

	// ---- beat 3: the roadmap ----
	// "You do not need to know anything about machine learning." ... "what linear regression is" ... "our task" ... "our code" ... "the results"
	pq.reveal("#intro-head3", pq.at("intro-3", 0.2), { y: 18 });
	pq.reveal("#intro-step-1", pq.at("intro-3", 3.6), { y: 30, duration: 0.6 });
	pq.reveal("#intro-chev-1", pq.at("intro-3", 5.5), { y: 0, x: -14, duration: 0.4 });
	pq.reveal("#intro-step-2", pq.at("intro-3", 5.9), { y: 30, duration: 0.6 });
	pq.reveal("#intro-chev-2", pq.at("intro-3", 6.6), { y: 0, x: -14, duration: 0.4 });
	pq.reveal("#intro-step-3", pq.at("intro-3", 6.9), { y: 30, duration: 0.6 });
	pq.reveal("#intro-chev-3", pq.at("intro-3", 7.2), { y: 0, x: -14, duration: 0.4 });
	pq.reveal("#intro-step-4", pq.at("intro-3", 7.5), { y: 30, duration: 0.6 });
});
