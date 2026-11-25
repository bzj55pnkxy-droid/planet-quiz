window.PQ.scene("experiment", (tl, pq) => {
	const { start } = pq.chapter("experiment");

	// ---- beat 1: orbits (distance -> period) and the task ----
	// Every planet laps at its real relative speed (1 year = 8 s of video), so the farther
	// the ring, the longer one lap takes.
	const periods = [0.241, 0.615, 1.0, 1.881, 11.86]; // Mercury ... Jupiter, in years
	const phase = [20, 150, 255, 70, 200];
	const spinTime = pq.at("experiment-2", 0.5) - start;
	periods.forEach((years, i) => {
		const sweep = (360 / (8 * years)) * spinTime;
		tl.fromTo(
			document.getElementById("experiment-ring-" + i),
			{ rotation: phase[i] },
			{ rotation: phase[i] - sweep, duration: spinTime, ease: "none", immediateRender: false },
			start,
		);
	});
	pq.reveal("#experiment-orbits", pq.at("experiment-1", -0.6), { y: 0, scale: 0.92, duration: 1 });
	// "In a separate experiment" ... "how long a body takes to orbit the Sun" ... "from its distance"
	pq.reveal("#experiment-task-kicker", pq.at("experiment-1", 2.9), { y: 16 });
	pq.reveal("#experiment-node-out", pq.at("experiment-1", 5.3), { y: 0, x: 40 });
	pq.reveal("#experiment-node-in", pq.at("experiment-1", 7.8), { y: 0, x: -40 });
	pq.reveal("#experiment-flow-arrow", pq.at("experiment-1", 8.2), { y: 0, x: -20, duration: 0.4 });
	pq.reveal("#experiment-facts", pq.at("experiment-1", 8.6), { y: 18 });
	pq.dismiss("#experiment-b1", pq.at("experiment-2", 0));

	// ---- beat 2: mean absolute error, to scale (1000 px = 38.73 years) ----
	pq.reveal("#experiment-err-title", pq.at("experiment-2", 0.3), { y: 14 });
	pq.reveal("#experiment-axis", pq.at("experiment-2", 0.4), { y: 0, duration: 0.5 });
	pq.reveal("#experiment-row-reg", pq.at("experiment-2", 0.5), { y: 18 });
	// "zero point zero two years"
	pq.reveal("#experiment-bar-reg", pq.at("experiment-2", 2.2), { y: 0, duration: 0.4 });
	pq.reveal("#experiment-val-reg", pq.at("experiment-2", 3.3), { y: 0, x: -16 });
	pq.count("#experiment-num-reg", 0, 0.02, pq.at("experiment-2", 3.3), { duration: 0.6, decimals: 2 });
	// Uranus, regression
	pq.reveal("#experiment-ur-title", pq.at("experiment-2", 4.6), { y: 14 });
	pq.reveal("#experiment-ur-actual", pq.at("experiment-2", 4.7), { y: 24 });
	pq.reveal("#experiment-ur-reg", pq.at("experiment-2", 5.3), { y: 24 });
	// "The language model with RAG ... almost thirty-nine years"
	pq.reveal("#experiment-row-rag", pq.at("experiment-2", 5.7), { y: 18 });
	tl.set("#experiment-bar-rag", { width: 0 }, 0);
	tl.fromTo(
		"#experiment-bar-rag",
		{ width: 0 },
		{ width: 1000, duration: 1.7, ease: "power2.out", immediateRender: false },
		pq.at("experiment-2", 7.8),
	);
	pq.count("#experiment-num-rag", 0, 38.73, pq.at("experiment-2", 7.8), { duration: 1.7, decimals: 2 });
	pq.reveal("#experiment-ur-rag", pq.at("experiment-2", 9.0), { y: 24 });
	pq.dismiss("#experiment-b2", pq.end("experiment-2", 0.2));

	// ---- beat 3: two reasons ----
	pq.reveal("#experiment-reason-a", pq.at("experiment-3", 0.1), { y: 24 });
	pq.reveal("#experiment-q-0", pq.at("experiment-3", 0.6), { y: 0, x: -30 });
	pq.reveal("#experiment-q-1", pq.at("experiment-3", 1.1), { y: 0, x: -30 });
	pq.reveal("#experiment-q-2", pq.at("experiment-3", 1.6), { y: 0, x: -30 });
	pq.reveal("#experiment-note-a", pq.at("experiment-3", 2.5), { y: 12 });
	// "And the model does not calculate."
	pq.reveal("#experiment-reason-b", pq.at("experiment-3", 3.2), { y: 24 });
	pq.reveal("#experiment-q-b", pq.at("experiment-3", 3.8), { y: 0, x: -30 });
	pq.reveal("#experiment-actual", pq.at("experiment-3", 4.5), { y: 12 });
	pq.reveal("#experiment-note-b", pq.at("experiment-3", 5.0), { y: 12 });
	pq.dismiss("#experiment-b3", pq.end("experiment-3", 0.2));

	// ---- beat 4: rule of thumb ----
	// "use RAG when the answer is a fact you can quote from a document"
	pq.reveal("#experiment-col-rag", pq.at("experiment-4", 0.1), { y: 24 });
	pq.reveal("#experiment-rag-top", pq.at("experiment-4", 0.5), { y: 18 });
	pq.reveal("#experiment-rag-tool", pq.at("experiment-4", 1.4), { y: 18 });
	// "Use a trained model when the answer is a number that follows a pattern."
	pq.reveal("#experiment-col-model", pq.at("experiment-4", 4.3), { y: 24 });
	pq.reveal("#experiment-model-top", pq.at("experiment-4", 4.45), { y: 18 });
	pq.reveal("#experiment-model-tool", pq.at("experiment-4", 6.0), { y: 18 });
});
