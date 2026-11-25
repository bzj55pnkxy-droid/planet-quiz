window.PQ.scene("line", (tl, pq) => {
	const hide = (target) => tl.set(target, { opacity: 0 }, 0);
	const fromTo = (target, time, from, to) =>
		tl.fromTo(target, from, { ...to, immediateRender: false }, time);

	// ---- beat 1: "Put every example on a chart. The input goes along the bottom, the output goes up the side. Each example is one dot." ----
	pq.reveal("#line-frame", pq.at("line-1", -0.4), { y: 0, duration: 0.7 });
	pq.reveal("#line-p1", pq.at("line-1", 0.4), { y: 0, x: 40, duration: 0.7 });
	pq.reveal("#line-xaxis", pq.at("line-1", 2.3), { y: 0, x: -40, duration: 0.6 });
	pq.reveal("#line-xtitle", pq.at("line-1", 2.7), { y: 12 });
	pq.reveal("#line-yaxis", pq.at("line-1", 4.5), { y: 40, duration: 0.6 });
	pq.reveal("#line-ytitle", pq.at("line-1", 4.9), { y: 0, x: 12 });
	for (let i = 0; i < 7; i++) {
		const dot = "#line-dot-" + i;
		const flash = "#line-row-" + i + " .line__flash";
		const t = pq.at("line-1", 6.1 + 0.23 * i);
		tl.set(dot, { attr: { r: 0 } }, 0);
		fromTo(dot, t, { attr: { r: 0 } }, { attr: { r: 11 }, duration: 0.4, ease: "back.out(2.5)" });
		hide(flash);
		fromTo(flash, t, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "power1.out" });
		tl.to(flash, { opacity: 0.35, duration: 0.6, ease: "power1.inOut" }, t + 0.15);
	}
	pq.dismiss("#line-p1", pq.end("line-1", 0.1));

	// ---- beat 2: "Linear regression draws the straight line that fits the dots best." ----
	pq.reveal("#line-p2", pq.at("line-2", 0.4), { y: 0, x: 40, duration: 0.7 });
	tl.fromTo(
		"#line-fit",
		{ strokeDashoffset: 990 },
		{ strokeDashoffset: 0, duration: 2.4, ease: "power1.inOut" },
		pq.at("line-2", 1.0),
	);
	pq.reveal("#line-p2-key", pq.at("line-2", 2.6), { y: 12 });
	pq.dismiss("#line-p2", pq.end("line-2", 0.1));

	// ---- beat 3: "A straight line is just two numbers. The slope says how steep it is. The intercept says where it starts." ----
	pq.reveal("#line-p3-head", pq.at("line-3", 0.4), { y: 16 });
	pq.reveal("#line-p3-slope", pq.at("line-3", 2.3), { y: 0, x: 40, duration: 0.6 });
	pq.reveal("#line-slope-run", pq.at("line-3", 2.7), { y: 0, x: -20, duration: 0.5 });
	pq.reveal("#line-slope-rise", pq.at("line-3", 3.1), { y: 20, duration: 0.5 });
	pq.reveal("#line-slope-chip", pq.at("line-3", 3.5), { y: 10 });
	pq.reveal("#line-p3-icpt", pq.at("line-3", 4.5), { y: 0, x: 40, duration: 0.6 });
	pq.reveal("#line-icpt", pq.at("line-3", 4.9), { y: 0, x: -20, duration: 0.5 });
	pq.dismiss("#line-p3", pq.end("line-3", 0.1));
	pq.dismiss("#line-slope", pq.end("line-3", 0.1));
	pq.dismiss("#line-icpt", pq.end("line-3", 0.1));

	// ---- beat 4: "output equals slope times input, plus intercept. Training means finding those two numbers." ----
	pq.reveal("#line-fa", pq.at("line-4", 1.5), { y: 20, duration: 0.6 });
	pq.reveal("#line-w-out", pq.at("line-4", 2.5), { y: 10, duration: 0.4 });
	pq.reveal("#line-w-eq", pq.at("line-4", 3.0), { y: 10, duration: 0.4 });
	pq.reveal("#line-w-slope", pq.at("line-4", 3.4), { y: 10, duration: 0.4 });
	pq.reveal("#line-w-times", pq.at("line-4", 3.85), { y: 10, duration: 0.4 });
	pq.reveal("#line-w-input", pq.at("line-4", 4.25), { y: 10, duration: 0.4 });
	pq.reveal("#line-w-plus", pq.at("line-4", 4.85), { y: 10, duration: 0.4 });
	pq.reveal("#line-w-int", pq.at("line-4", 5.2), { y: 10, duration: 0.4 });
	// the same formula with our numbers
	pq.reveal("#line-farrow", pq.at("line-4", 5.7), { y: -14, duration: 0.4 });
	pq.reveal("#line-fb", pq.at("line-4", 5.85), { y: 20, duration: 0.6 });
	pq.reveal("#line-train", pq.at("line-4", 6.3), { y: 14 });
	// "those two numbers": light both up
	const numbers = "#line-n-slope, #line-n-int";
	fromTo(
		numbers,
		pq.at("line-4", 7.4),
		{ backgroundColor: "rgba(74,222,128,0.14)" },
		{ backgroundColor: "rgba(74,222,128,0.5)", duration: 0.4, ease: "power1.out" },
	);
	fromTo(numbers, pq.at("line-4", 7.4), { scale: 1 }, { scale: 1.12, duration: 0.25, ease: "power1.inOut", yoyo: true, repeat: 1 });
	pq.dismiss("#line-p4", pq.end("line-4", 0.1));

	// ---- beat 5: "take a new input, go up to the line, and read off the output." ----
	pq.reveal("#line-r-in", pq.at("line-5", 0.9), { y: 20, duration: 0.5 });
	pq.reveal("#line-pred-in", pq.at("line-5", 1.0), { y: -10, duration: 0.5 });
	tl.set("#line-guide-v", { opacity: 1 }, pq.at("line-5", 1.93));
	fromTo("#line-guide-v", pq.at("line-5", 1.9), { attr: { y2: 620 } }, { attr: { y2: 199 }, duration: 0.9, ease: "power1.inOut" });
	tl.set("#line-pred-dot", { attr: { r: 0 } }, 0);
	fromTo("#line-pred-dot", pq.at("line-5", 2.75), { attr: { r: 0 } }, { attr: { r: 13 }, duration: 0.4, ease: "back.out(2.5)" });
	tl.set("#line-guide-h", { opacity: 1 }, pq.at("line-5", 3.03));
	fromTo("#line-guide-h", pq.at("line-5", 3.0), { attr: { x2: 714 } }, { attr: { x2: 214 }, duration: 0.8, ease: "power1.inOut" });
	pq.reveal("#line-pred-out", pq.at("line-5", 3.75), { y: 0, x: 14, duration: 0.4 });
	pq.reveal("#line-r-arrow", pq.at("line-5", 3.2), { y: -14, duration: 0.4 });
	pq.reveal("#line-r-out", pq.at("line-5", 3.4), { y: 20, duration: 0.6 });
});
