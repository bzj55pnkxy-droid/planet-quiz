window.PQ.scene("task", (tl, pq) => {
	const { start } = pq.chapter("task");
	const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	const trainRows = [0, 1, 2, 4, 5, 7, 8];
	const testRows = [3, 6, 9];
	const row = (i) => "#task-row-" + i;
	const part = (i, selector) => "#task-row-" + i + " " + selector;

	// ---- beat 1: a near body and a far body go round the Sun ----
	// One lap of the near body takes 3.2 s of video, one lap of the far body 12.8 s: the far
	// body is slower, as in the real thing.
	const spinTime = pq.end("task-1", 0.4) - start;
	[
		["#task-spin-near", 200, 3.2],
		["#task-spin-far", 20, 12.8],
	].forEach(([target, phase, lap]) => {
		tl.fromTo(
			target,
			{ rotation: phase, svgOrigin: "380 390" },
			{
				rotation: phase + (360 * spinTime) / lap,
				svgOrigin: "380 390",
				duration: spinTime,
				ease: "none",
				immediateRender: false,
			},
			start,
		);
	});
	// "Now our task."
	pq.reveal("#task-kicker", pq.at("task-1", 0.0), { y: 14 });
	// "We predict how long a body takes to go around the Sun,"
	pq.reveal("#task-near", pq.at("task-1", 2.2), { y: 0, x: 40 });
	pq.reveal("#task-far", pq.at("task-1", 3.2), { y: 0, x: 40 });
	// "from its distance to the Sun."
	pq.reveal("#task-flow .task__fnode:first-child", pq.at("task-1", 4.4), { y: 0, x: -30 });
	pq.reveal("#task-flow .task__farrow", pq.at("task-1", 4.9), { y: 0, x: -20, duration: 0.4 });
	pq.reveal("#task-flow .task__fnode:last-child", pq.at("task-1", 5.2), { y: 0, x: -30 });
	pq.dismiss("#task-b1", pq.end("task-1", 0.15));

	// ---- beat 2: input and output ----
	// "The input is the distance in astronomical units, where Earth is at one."
	pq.reveal("#task-in", pq.at("task-2", 0.1), { y: 24 });
	pq.reveal("#task-in .task__iotag", pq.at("task-2", 0.3), { y: 10, duration: 0.4 });
	pq.reveal("#task-in .task__ioname", pq.at("task-2", 0.7), { y: 12 });
	pq.reveal("#task-in .task__ionote", pq.at("task-2", 2.0), { y: 12 });
	pq.reveal("#task-in svg", pq.at("task-2", 3.0), { y: 0 });
	pq.reveal("#task-in .task__iocap", pq.at("task-2", 3.3), { y: 10 });
	// "The output is the orbital period in Earth years."
	pq.reveal("#task-b2-arrow", pq.at("task-2", 4.4), { y: 0, x: -24, duration: 0.45 });
	pq.reveal("#task-out", pq.at("task-2", 4.6), { y: 24 });
	pq.reveal("#task-out .task__iotag", pq.at("task-2", 4.7), { y: 10, duration: 0.4 });
	pq.reveal("#task-out .task__ioname", pq.at("task-2", 5.2), { y: 12 });
	pq.reveal("#task-out .task__ionote", pq.at("task-2", 6.2), { y: 12 });
	pq.reveal("#task-out svg", pq.at("task-2", 6.7), { y: 0 });
	pq.reveal("#task-out .task__iocap", pq.at("task-2", 7.0), { y: 10 });
	pq.dismiss("#task-b2", pq.end("task-2", 0.15));

	// ---- beat 3: nine bodies from the NASA fact tables ----
	// "The data comes from the fact tables in the same NASA document the quiz app uses."
	pq.reveal("#task-source", pq.at("task-3", 0.3), { y: 24 });
	pq.reveal("#task-head", pq.at("task-3", 2.4), { y: 14 });
	// "Nine bodies, from Mercury to Pluto."
	pq.reveal("#task-count", pq.at("task-3", 3.2), { y: 24 });
	rows.slice(0, 9).forEach((i) => {
		const t = pq.at("task-3", 3.4 + i * 0.5);
		pq.reveal(row(i), t, { y: 14, duration: 0.45 });
		pq.count("#task-countnum", i, i + 1, t + 0.1, { duration: 0.3 });
	});
	// the table card ends with the tenth row, which is not there yet
	pq.reveal(row(9), pq.at("task-4", 1.3), { y: 14, duration: 0.5 });

	// ---- beat 4: the tenth, made-up body ----
	// "We add a tenth, made-up body at fifteen astronomical units."
	pq.dim("#task-source", pq.at("task-4", 0.0), 0.35);
	pq.reveal("#task-made", pq.at("task-4", 1.9), { y: 0, duration: 0.5 });
	pq.count("#task-countnum", 9, 10, pq.at("task-4", 1.5), { duration: 0.4 });
	pq.dismiss("#task-countlab-1", pq.at("task-4", 1.5));
	tl.to("#task-countlab-2", { opacity: 1, duration: 0.5, ease: "power2.out" }, pq.at("task-4", 1.8));
	// "The language model cannot have memorised that one."
	pq.reveal("#task-tag", pq.at("task-4", 4.2), { y: 0, x: 36, duration: 0.6 });
	pq.reveal("#task-note", pq.at("task-4", 5.6), { y: 10 });

	// ---- beat 5: seven for training, three for testing ----
	// "Seven bodies are for training."
	pq.dismiss("#task-count", pq.at("task-5", 0.0));
	pq.reveal("#task-box-train", pq.at("task-5", 0.3), { y: 0, x: 40 });
	pq.reveal("#task-splithead", pq.at("task-5", 0.3), { y: 0, duration: 0.4 });
	trainRows.forEach((i, k) => {
		const t = pq.at("task-5", 0.5 + k * 0.25);
		pq.reveal(part(i, ".task__tint"), t, { y: 0, duration: 0.4 });
		pq.reveal(part(i, ".task__role"), t, { y: 0, duration: 0.4 });
		pq.count("#task-trainnum", k, k + 1, t, { duration: 0.2 });
	});
	// "Three are held back for testing: Mars, Uranus and the made-up body."
	pq.reveal("#task-box-test", pq.at("task-5", 2.8), { y: 0, x: 40 });
	[
		[3, 4.5],
		[6, 5.1],
		[9, 5.8],
	].forEach(([i, offset], k) => {
		const t = pq.at("task-5", offset);
		pq.reveal(part(i, ".task__tint"), t, { y: 0, duration: 0.4 });
		pq.reveal(part(i, ".task__role"), t, { y: 0, duration: 0.4 });
		pq.count("#task-testnum", k, k + 1, t, { duration: 0.2 });
	});
	pq.dismiss("#task-made", pq.at("task-5", 5.8));
	pq.dim("#task-tag", pq.at("task-5", 0.0), 0.45);
	pq.dim("#task-note", pq.at("task-5", 0.0), 0.45);

	// pq.count leaves its last "from" value in the element; each counter must read 0 until its first tween
	["task-countnum", "task-trainnum", "task-testnum"].forEach((id) => {
		document.getElementById(id).textContent = "0";
	});
});
