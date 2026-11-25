window.PQ.scene("test", (tl, pq) => {
	const idx = [0, 1, 2, 3, 4, 5, 6];
	const trainDots = [0, 1, 3, 4, 6];
	const testDots = [2, 5];

	// ---- beat 1: a model that has already seen the answers ----
	// "How do we know the model is any good?"
	pq.reveal("#test-tab", pq.at("test-1", 0.0), { y: 24 });
	pq.reveal("#test-guess-head", pq.at("test-1", 1.3), { y: 0, x: 20, duration: 0.45 });
	// "It can look good ..."
	idx.forEach((i) => {
		pq.reveal("#test-guess-" + i, pq.at("test-1", 2.9 + i * 0.12), { y: 0, x: 20, duration: 0.35 });
	});
	pq.reveal("#test-verdict", pq.at("test-1", 3.0), { y: 24 });
	// "... simply because it has already seen the answers."
	pq.reveal("#test-seen", pq.at("test-1", 3.9), { y: 0, duration: 0.5 });
	pq.reveal("#test-eye", pq.at("test-1", 4.0), { y: 0, scale: 0.6, duration: 0.5 });
	idx.forEach((i) => {
		pq.reveal("#test-copy-" + i, pq.at("test-1", 4.2 + i * 0.1), { y: 0, x: -24, duration: 0.35 });
	});
	pq.reveal("#test-msg", pq.at("test-1", 4.5), { y: 24 });
	pq.dismiss("#test-b1", pq.end("test-1", 0.15));

	// ---- beat 2: split the data ----
	pq.reveal("#test-chart", pq.end("test-1", 0.45), { y: 0, duration: 0.5 });
	// "So we split the data."
	testDots.forEach((i) => {
		tl.to(
			"#test-dot-" + i,
			{ fill: "rgba(124, 156, 255, 0.18)", stroke: "#7c9cff", strokeWidth: 5, duration: 0.5 },
			pq.at("test-2", 0.8),
		);
	});
	// "The training set is used to fit the line."
	pq.reveal("#test-train", pq.at("test-2", 1.5), { y: 24 });
	tl.fromTo(
		"#test-line",
		{ attr: { x2: 110, y2: 570.4 }, opacity: 0 },
		{ attr: { x2: 1110, y2: 70.2 }, opacity: 1, duration: 1.0, ease: "power2.inOut", immediateRender: false },
		pq.at("test-2", 2.6),
	);
	pq.reveal("#test-lab-line", pq.at("test-2", 3.3), { y: 12 });
	// "The test set is hidden until the end."
	pq.reveal("#test-hold", pq.at("test-2", 4.1), { y: 24 });
	pq.reveal("#test-cover-0", pq.at("test-2", 4.7), { y: 0, scale: 0.4, duration: 0.45 });
	pq.reveal("#test-cover-1", pq.at("test-2", 4.9), { y: 0, scale: 0.4, duration: 0.45 });
	pq.dismiss("#test-train", pq.end("test-2", 0.15));
	pq.dismiss("#test-hold", pq.end("test-2", 0.15));

	// ---- beat 3: predict the hidden cases, compare, take the gap ----
	trainDots.forEach((i) => pq.dim("#test-dot-" + i, pq.at("test-3", 0.0), 0.4));
	pq.reveal("#test-legend", pq.at("test-3", 0.2), { y: 10 });
	// "Then we predict the test cases"
	pq.reveal("#test-guide-0", pq.at("test-3", 0.6), { y: 0, duration: 0.5 });
	pq.reveal("#test-pin-0", pq.at("test-3", 0.9), { y: 0, scale: 2, duration: 0.4 });
	pq.reveal("#test-pl-0", pq.at("test-3", 1.0), { y: 0, duration: 0.35 });
	pq.reveal("#test-case-0", pq.at("test-3", 0.6), { y: 24 });
	pq.reveal("#test-c0-pred", pq.at("test-3", 1.0), { y: 0, x: 20, duration: 0.4 });
	pq.reveal("#test-guide-1", pq.at("test-3", 1.5), { y: 0, duration: 0.5 });
	pq.reveal("#test-pin-1", pq.at("test-3", 1.8), { y: 0, scale: 2, duration: 0.4 });
	pq.reveal("#test-pl-1", pq.at("test-3", 1.9), { y: 0, duration: 0.35 });
	pq.reveal("#test-case-1", pq.at("test-3", 1.5), { y: 24 });
	pq.reveal("#test-c1-pred", pq.at("test-3", 1.9), { y: 0, x: 20, duration: 0.4 });
	// "and compare with the true values."
	pq.dismiss("#test-cover-0", pq.at("test-3", 2.7));
	pq.dismiss("#test-cover-1", pq.at("test-3", 2.9));
	pq.reveal("#test-tl-0", pq.at("test-3", 3.0), { y: 0, duration: 0.35 });
	pq.reveal("#test-c0-true", pq.at("test-3", 3.0), { y: 0, x: 20, duration: 0.4 });
	pq.reveal("#test-tl-1", pq.at("test-3", 3.4), { y: 0, duration: 0.35 });
	pq.reveal("#test-c1-true", pq.at("test-3", 3.4), { y: 0, x: 20, duration: 0.4 });
	pq.reveal("#test-gap-0", pq.at("test-3", 3.8), { y: 0, duration: 0.4 });
	pq.reveal("#test-gap-1", pq.at("test-3", 4.1), { y: 0, duration: 0.4 });
	// "The difference, ignoring plus or minus, is the absolute error."
	pq.reveal("#test-c0-err", pq.at("test-3", 5.2), { y: 0, x: 20, duration: 0.45 });
	pq.reveal("#test-el-0", pq.at("test-3", 5.3), { y: 0, duration: 0.35 });
	pq.reveal("#test-c1-err", pq.at("test-3", 6.4), { y: 0, x: 20, duration: 0.45 });
	pq.reveal("#test-el-1", pq.at("test-3", 6.5), { y: 0, duration: 0.35 });
	pq.dismiss("#test-chart", pq.end("test-3", 0.15));
	pq.dismiss("#test-case-0", pq.end("test-3", 0.15));
	pq.dismiss("#test-case-1", pq.end("test-3", 0.15));

	// ---- beat 4: the average of the absolute errors ----
	// "The average over all test cases is the mean absolute error."
	pq.reveal("#test-bars", pq.at("test-4", 0.0), { y: 0, duration: 0.4 });
	[
		["#test-bar-0", 520, 0.3],
		["#test-bar-1", 460, 0.9],
	].forEach(([bar, width, offset]) => {
		tl.fromTo(
			bar,
			{ width: 0, opacity: 0 },
			{ width, opacity: 1, duration: 0.6, ease: "power2.out", immediateRender: false },
			pq.at("test-4", offset),
		);
	});
	pq.reveal("#test-avg", pq.at("test-4", 1.7), { y: 0, duration: 0.5 });
	pq.reveal("#test-mae", pq.at("test-4", 1.5), { y: 24 });
	pq.reveal("#test-f1", pq.at("test-4", 1.9), { y: 12, duration: 0.45 });
	pq.reveal("#test-f2", pq.at("test-4", 2.5), { y: 12, duration: 0.45 });
	pq.reveal("#test-f3", pq.at("test-4", 2.9), { y: 12, duration: 0.5 });
	pq.reveal("#test-f4", pq.at("test-4", 3.3), { y: 8, duration: 0.4 });
	// "Lower is better."
	pq.reveal("#test-lower", pq.at("test-4", 3.5), { y: 24 });
	pq.reveal("#test-pin", pq.at("test-4", 4.2), { y: -16, duration: 0.5 });
});
