window.PQ.scene("fit", (tl, pq) => {
	const $ = (id) => document.getElementById(id);

	// The seven ice-cream dots and the chart's pixel scale (see 03-fit.html).
	const T = [12, 15, 18, 21, 24, 27, 30];
	const V = [20, 34, 41, 58, 63, 80, 88];
	const X0 = 110;
	const STEP = 1000 / 22;
	const Y0 = 650;
	const SCALE = 6;
	const px = T.map((t) => X0 + (t - 10) * STEP);
	const py = V.map((v) => Y0 - v * SCALE);
	const BIG = [0, 5, 6]; // squares large enough to carry their number

	// sold = m x temperature + b. The first guess, and the least-squares line.
	const BAD = { m: 2, b: 10 };
	const BEST = { m: 3.79, b: -24.6 };
	const lineY = (m, b, t) => Y0 - (m * t + b) * SCALE;

	const idx = [0, 1, 2, 3, 4, 5, 6];
	const line = $("fit-line");
	const seg = idx.map((i) => $("fit-seg-" + i));
	const sq = idx.map((i) => $("fit-sq-" + i));
	const errLab = idx.map((i) => $("fit-err-" + i));
	const cellE = idx.map((i) => $("fit-e-" + i));
	const cellS = idx.map((i) => $("fit-s-" + i));
	const sqLab = {};
	BIG.forEach((i) => {
		sqLab[i] = $("fit-sqlab-" + i);
	});
	const totalEl = $("fit-total");

	const num = (x, d) => String(parseFloat(x.toFixed(d)));
	const put = (el, attrs) => {
		for (const k in attrs) el.setAttribute(k, attrs[k]);
	};

	// Everything on the chart and in the table is a pure function of the line (m, b).
	function render(m, b) {
		put(line, { y1: lineY(m, b, 10), y2: lineY(m, b, 32) });
		let total = 0;
		idx.forEach((i) => {
			const pred = m * T[i] + b;
			const err = Math.abs(V[i] - pred);
			const ly = Y0 - pred * SCALE;
			const side = err * SCALE;
			const top = Math.min(py[i], ly);
			put(seg[i], { y2: ly });
			put(sq[i], { x: px[i] - side, y: top, width: side, height: side });
			put(errLab[i], { y: (py[i] + ly) / 2 + 9 });
			errLab[i].textContent = num(err, 2);
			if (sqLab[i]) {
				put(sqLab[i], { x: px[i] - side / 2, y: top + side / 2 + 9 });
				sqLab[i].textContent = num(err * err, 0);
			}
			cellE[i].textContent = num(err, 2);
			cellS[i].textContent = num(err * err, 2);
			total += err * err;
		});
		totalEl.textContent = num(total, 1);
	}
	render(BAD.m, BAD.b);
	const badY = idx.map((i) => Y0 - (BAD.m * T[i] + BAD.b) * SCALE);
	const badSide = idx.map((i) => Math.abs(py[i] - badY[i]));
	const badSq = idx.map((i) => Math.round(((V[i] - (BAD.m * T[i] + BAD.b)) ** 2) * 100) / 100);

	// ---- beat 1: a clearly bad line, and the gap from every dot to it ----
	// "But which line is best?"
	pq.reveal("#fit-line", pq.at("fit-1", 0.2), { y: 0, duration: 0.7 });
	pq.reveal("#fit-lab-bad", pq.at("fit-1", 0.7), { y: 12 });
	// "For each dot, measure how far the line is from it."
	idx.forEach((i) => {
		const t = pq.at("fit-1", 1.7 + i * 0.22);
		tl.set(seg[i], { opacity: 0 }, 0);
		tl.fromTo(
			seg[i],
			{ attr: { y2: py[i] }, opacity: 0 },
			{ attr: { y2: badY[i] }, opacity: 1, duration: 0.45, ease: "power2.out", immediateRender: false },
			t,
		);
		pq.reveal(errLab[i], t + 0.35, { y: 0, duration: 0.3 });
	});
	// "That gap is the error." One dot worked out in numbers.
	pq.reveal("#fit-ring", pq.at("fit-1", 3.2), { y: 0, scale: 1.5, duration: 0.5 });
	pq.reveal("#fit-ex", pq.at("fit-1", 3.2), { y: 24 });
	pq.reveal("#fit-ex-0", pq.at("fit-1", 3.5), { y: 0, x: 20, duration: 0.4 });
	pq.reveal("#fit-ex-1", pq.at("fit-1", 3.9), { y: 0, x: 20, duration: 0.4 });
	pq.reveal("#fit-ex-2", pq.at("fit-1", 4.3), { y: 0, x: 20, duration: 0.4 });
	pq.reveal("#fit-ex-3", pq.at("fit-1", 4.7), { y: 0, x: 20, duration: 0.4 });
	pq.reveal("#fit-legend", pq.at("fit-1", 4.5), { y: 10 });
	pq.dismiss("#fit-ex", pq.end("fit-1", 0.2));
	pq.dismiss("#fit-ring", pq.end("fit-1", 0.2));
	pq.dismiss("#fit-legend", pq.end("fit-1", 0.2));

	// ---- beat 2: square every error, add them up ----
	pq.reveal("#fit-tab", pq.at("fit-2", 0.0), { y: 24 });
	pq.dismiss("#fit-errlabels", pq.at("fit-2", 0.4));
	// the squared column and the running total fill in square by square
	let running = 0;
	idx.forEach((i) => {
		const t = pq.at("fit-2", 0.6 + i * 0.25);
		tl.set(sq[i], { opacity: 0 }, 0);
		tl.fromTo(
			sq[i],
			{ attr: { x: px[i], width: 0 }, opacity: 0 },
			{
				attr: { x: px[i] - badSide[i], width: badSide[i] },
				opacity: 1,
				duration: 0.45,
				ease: "power2.out",
				immediateRender: false,
			},
			t,
		);
		pq.reveal(cellS[i], t + 0.15, { y: 0, duration: 0.3 });
		pq.count(totalEl, running, running + badSq[i], t + 0.1, { duration: 0.35 });
		running += badSq[i];
		if (sqLab[i]) pq.reveal(sqLab[i], t + 0.35, { y: 0, duration: 0.3 });
	});
	// pq.count leaves its last "from" value in the element; the total must read 0 until the first square lands
	totalEl.textContent = "0";
	// "Squaring makes big misses count much more than small ones."
	const hot = "rgba(248, 113, 113, 0.28)";
	tl.to("#fit-sq-6", { stroke: "#ffffff", strokeWidth: 7, duration: 0.3 }, pq.at("fit-2", 3.7));
	tl.to("#fit-trow-6", { backgroundColor: hot, duration: 0.3 }, pq.at("fit-2", 3.7));
	pq.reveal("#fit-co-big", pq.at("fit-2", 3.7), { y: 0, x: 24, duration: 0.45 });
	tl.to("#fit-sq-1", { stroke: "#ffffff", strokeWidth: 7, duration: 0.3 }, pq.at("fit-2", 4.9));
	tl.to("#fit-trow-1", { backgroundColor: hot, duration: 0.3 }, pq.at("fit-2", 4.9));
	pq.reveal("#fit-co-small", pq.at("fit-2", 4.9), { y: 0, x: 24, duration: 0.45 });
	pq.reveal("#fit-co-ratio", pq.at("fit-2", 5.4), { y: 12, duration: 0.45 });

	// ---- beat 3: slide the line to the smallest total ----
	pq.dismiss("#fit-callout", pq.at("fit-3", 0.0));
	pq.dismiss("#fit-sqlabels", pq.at("fit-3", 0.0));
	pq.dismiss("#fit-lab-bad", pq.at("fit-3", 0.0));
	tl.to("#fit-sq-6", { stroke: "#f87171", strokeWidth: 3, duration: 0.3 }, pq.at("fit-3", 0.0));
	tl.to("#fit-sq-1", { stroke: "#f87171", strokeWidth: 3, duration: 0.3 }, pq.at("fit-3", 0.0));
	tl.to("#fit-trow-6", { backgroundColor: "rgba(248, 113, 113, 0)", duration: 0.3 }, pq.at("fit-3", 0.0));
	tl.to("#fit-trow-1", { backgroundColor: "rgba(248, 113, 113, 0)", duration: 0.3 }, pq.at("fit-3", 0.0));
	pq.dim("#fit-ghost", pq.at("fit-3", 0.1), 0.55);
	pq.dim("#fit-lab-ghost", pq.at("fit-3", 0.1), 1);
	// "The best line is the one with the smallest total."
	const slide = { u: 0 };
	tl.to(
		slide,
		{
			u: 1,
			duration: 2.6,
			ease: "power2.inOut",
			onUpdate: () =>
				render(BAD.m + (BEST.m - BAD.m) * slide.u, BAD.b + (BEST.b - BAD.b) * slide.u),
		},
		pq.at("fit-3", 0.4),
	);
	tl.to("#fit-line", { attr: { stroke: "#4ade80" }, duration: 1.2 }, pq.at("fit-3", 1.8));
	tl.to("#fit-total", { color: "#4ade80", duration: 0.8 }, pq.at("fit-3", 2.2));
	pq.reveal("#fit-lab-best", pq.at("fit-3", 2.9), { y: 12 });
	// "This method is called least squares"
	pq.reveal("#fit-verdict", pq.at("fit-3", 3.8), { y: 14 });
	// "and the computer solves it in an instant."
	pq.reveal("#fit-lab-fast", pq.at("fit-3", 5.8), { y: 10 });
});
