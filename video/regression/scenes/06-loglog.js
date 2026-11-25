window.PQ.scene("loglog", (tl, pq) => {
	const SVG = "http://www.w3.org/2000/svg";
	const at = (n, o = 0) => pq.at("loglog-" + n, o);
	const end = (n, o = 0) => pq.end("loglog-" + n, o);
	const $ = (id) => document.getElementById("loglog-" + id);
	const mk = (tag, attrs, parent, text) => {
		const e = document.createElementNS(SVG, tag);
		for (const k in attrs) e.setAttribute(k, attrs[k]);
		if (text !== undefined) e.textContent = text;
		if (parent) parent.appendChild(e);
		return e;
	};
	const fade = (target, time, duration = 0.4) => {
		tl.set(target, { opacity: 0 }, 0);
		tl.fromTo(target, { opacity: 0 }, { opacity: 1, duration, ease: "power1.out", immediateRender: false }, time);
	};
	const fadeOut = (target, time, duration = 0.4) => {
		tl.to(target, { opacity: 0, duration, ease: "power1.in" }, time);
	};
	// Draw a straight SVG line from its start to (x2, y2) between two times.
	const drawLine = (line, x2, y2, time, duration) => {
		tl.set(line, { opacity: 0 }, 0);
		tl.set(line, { opacity: 1 }, time);
		tl.fromTo(
			line,
			{ attr: { x2: line.getAttribute("x1"), y2: line.getAttribute("y1") } },
			{ attr: { x2, y2 }, duration, ease: "power1.inOut", immediateRender: false },
			time,
		);
	};

	// ---------- the data (experiment/results.md) ----------
	const BODIES = [
		{ name: "Mercury", au: 0.3871, yr: 0.2408, test: false },
		{ name: "Venus", au: 0.7233, yr: 0.6152, test: false },
		{ name: "Earth", au: 1, yr: 1, test: false },
		{ name: "Mars", au: 1.5237, yr: 1.8807, test: true },
		{ name: "Jupiter", au: 5.2033, yr: 11.8565, test: false },
		{ name: "Saturn", au: 9.5365, yr: 29.4, test: false },
		{ name: "Uranus", au: 19.191, yr: 84.02, test: true },
		{ name: "Neptune", au: 30.0685, yr: 164.79, test: false },
		{ name: "Pluto", au: 39.4811, yr: 247.92, test: false },
		{ name: "Hypothetical body", au: 15, yr: 58.0948, test: true },
	];
	const RAW = { slope: 6.2399, intercept: -11.9006 };
	const LOG = { slope: 1.4998, intercept: -0.0001 };
	const DOT = 11;
	const RING = 9.5; // ring radius + half the 4 px stroke = the same outer size as a filled dot

	// ---------- chart geometry: plot area x 120..1040, y 70..650 ----------
	const PX0 = 120, PX1 = 1040, PY0 = 70, PY1 = 650;
	const linX = (au) => PX0 + au * ((PX1 - PX0) / 40); // 0..40 AU
	const linY = (yr) => PY1 - yr * ((PY1 - PY0) / 250); // 0..250 years
	const LX = [-1, 2]; // log10(distance) shown: 0.1 .. 100
	const LY = [-1, 2.5]; // log10(period) shown: 0.1 .. about 316
	const logXv = (lx) => PX0 + (lx - LX[0]) * ((PX1 - PX0) / (LX[1] - LX[0]));
	const logYv = (ly) => PY1 - (ly - LY[0]) * ((PY1 - PY0) / (LY[1] - LY[0]));
	const logX = (au) => logXv(Math.log10(au));
	const logY = (yr) => logYv(Math.log10(yr));

	// ---------- axes ----------
	const gridLin = $("grid-lin");
	const ticksLin = $("ticks-lin");
	const gridLog = $("grid-log");
	const ticksLog = $("ticks-log");
	const vline = (x, parent) => mk("line", { class: "loglog__grid", x1: x, y1: PY0, x2: x, y2: PY1 }, parent);
	const hline = (y, parent) => mk("line", { class: "loglog__grid", x1: PX0, y1: y, x2: PX1, y2: y }, parent);
	const xtick = (x, label, parent) => mk("text", { class: "loglog__tick", x, y: 690, "text-anchor": "middle" }, parent, label);
	const ytick = (y, label, parent) => mk("text", { class: "loglog__tick", x: 104, y: y + 8, "text-anchor": "end" }, parent, label);
	for (const au of [10, 20, 30, 40]) vline(linX(au), gridLin);
	for (const yr of [50, 100, 150, 200, 250]) hline(linY(yr), gridLin);
	for (const au of [0, 10, 20, 30, 40]) xtick(linX(au), String(au), ticksLin);
	for (const yr of [0, 50, 100, 150, 200, 250]) ytick(linY(yr), String(yr), ticksLin);
	for (const v of [1, 10, 100]) {
		vline(logX(v), gridLog);
		hline(logY(v), gridLog);
	}
	for (const v of [0.1, 1, 10, 100]) {
		xtick(logX(v), String(v), ticksLog);
		ytick(logY(v), String(v), ticksLog);
	}

	// ---------- the bending curve: period = distance^1.5, drawn faintly behind the dots ----------
	const curve = mk("path", { class: "loglog__curve", pathLength: 1 }, $("curve-wrap"));
	{
		let d = "";
		for (let i = 0; i <= 100; i++) {
			const au = (40 * i) / 100;
			d += (i === 0 ? "M" : "L") + linX(au).toFixed(1) + " " + linY(Math.pow(au, 1.5)).toFixed(1);
		}
		curve.setAttribute("d", d);
	}

	// ---------- the raw straight line (period = 6.2399 x distance - 11.9006) ----------
	const rawAt = (au) => RAW.slope * au + RAW.intercept;
	const rawStart = -RAW.intercept / RAW.slope; // where the line crosses zero years (1.907 AU)
	const raw = mk(
		"line",
		{ class: "loglog__raw", x1: linX(rawStart), y1: linY(0), x2: linX(rawStart), y2: linY(0) },
		$("raw-wrap"),
	);

	// ---------- the dots ----------
	const dots = BODIES.map((b) =>
		mk(
			"circle",
			{
				class: "loglog__dot--" + (b.test ? "test" : "train"),
				cx: linX(b.au).toFixed(2),
				cy: linY(b.yr).toFixed(2),
				r: 0,
			},
			$("dots"),
		),
	);

	// ---------- red marks: how far the straight line is from each far-away dot ----------
	const errNames = ["Jupiter", "Saturn", "Hypothetical body", "Uranus", "Neptune", "Pluto"];
	const errs = errNames.map((name) => {
		const b = BODIES.find((x) => x.name === name);
		return mk(
			"line",
			{ class: "loglog__err", x1: linX(b.au).toFixed(2), y1: linY(b.yr).toFixed(2), x2: linX(b.au).toFixed(2), y2: linY(rawAt(b.au)).toFixed(2) },
			$("errs"),
		);
	});

	// ---------- names next to the far-away dots (beat 1 only) ----------
	const nameEls = {};
	const nameAt = (name, dx, dy, anchor) => {
		const b = BODIES.find((x) => x.name === name);
		nameEls[name] = mk(
			"text",
			{ class: "loglog__name", x: (linX(b.au) + dx).toFixed(1), y: (linY(b.yr) + dy).toFixed(1), "text-anchor": anchor },
			$("names"),
			name,
		);
	};
	nameAt("Jupiter", -16, -14, "end");
	nameAt("Saturn", 18, 32, "start");
	nameAt("Uranus", 18, 32, "start");
	nameAt("Neptune", 18, 32, "start");
	nameAt("Pluto", -18, 8, "end");
	nameAt("Hypothetical body", 18, 32, "start");
	const inner = mk("g", {}, $("names"));
	mk("text", { class: "loglog__name", x: 136, y: 508, "text-anchor": "start" }, inner, "Mercury, Venus,");
	mk("text", { class: "loglog__name", x: 136, y: 538, "text-anchor": "start" }, inner, "Earth, Mars");
	mk("line", { x1: 134, y1: 552, x2: 134, y2: 624, stroke: "var(--muted)", "stroke-width": 2.5 }, inner);

	// ---------- zoom callout near the origin: Mars on the straight line ----------
	const IX = 150, IY = 78, IW = 370, IH = 322;
	const iPX0 = 212, iPX1 = 500, iPY0 = 134, iPY1 = 342; // inset plot: 0..2.5 AU, +6 .. -13 years
	const insX = (au) => iPX0 + au * ((iPX1 - iPX0) / 2.5);
	const insY = (yr) => iPY0 + (6 - yr) * ((iPY1 - iPY0) / 19);
	const zoom = $("zoom");
	mk("rect", { x: 110, y: 616, width: 74, height: 50, rx: 6, fill: "none", stroke: "var(--muted)", "stroke-width": 3, "stroke-dasharray": "8 6" }, zoom);
	mk("line", { x1: 110, y1: 616, x2: IX, y2: IY + IH, stroke: "var(--muted)", "stroke-width": 2.5, "stroke-dasharray": "8 6" }, zoom);
	mk("line", { x1: 184, y1: 616, x2: IX + IW, y2: IY + IH, stroke: "var(--muted)", "stroke-width": 2.5, "stroke-dasharray": "8 6" }, zoom);

	const inset = $("inset");
	mk("rect", { x: IX, y: IY, width: IW, height: IH, rx: 16, fill: "#0a0f1f", stroke: "var(--muted)", "stroke-width": 2.5 }, inset);
	mk("text", { class: "loglog__ins-text", x: IX + 22, y: IY + 36, style: "font-weight:700;fill:var(--text)" }, inset, "Zoom near zero");
	const tint = mk(
		"rect",
		{ x: iPX0, y: insY(0), width: iPX1 - iPX0, height: iPY1 - insY(0), fill: "var(--red)", "fill-opacity": 0.16 },
		inset,
	);
	mk("line", { x1: iPX0, y1: insY(0), x2: iPX1, y2: insY(0), stroke: "var(--muted)", "stroke-width": 3 }, inset);
	mk("line", { x1: iPX0, y1: iPY0, x2: iPX0, y2: iPY1, stroke: "var(--muted)", "stroke-width": 3 }, inset);
	mk("text", { class: "loglog__ins-text", x: iPX0 - 12, y: insY(0) + 8, "text-anchor": "end" }, inset, "0");
	mk("text", { class: "loglog__ins-text", x: iPX0 - 12, y: insY(-10) + 8, "text-anchor": "end" }, inset, "\u221210");
	[0, 1, 2].forEach((au) => {
		mk("text", { class: "loglog__ins-text", x: insX(au), y: iPY1 + 30, "text-anchor": "middle" }, inset, au === 2 ? "2 AU" : String(au));
	});
	mk(
		"line",
		{ x1: insX(0), y1: insY(rawAt(0)), x2: insX(2.5), y2: insY(rawAt(2.5)), stroke: "var(--red)", "stroke-width": 5, "stroke-linecap": "round" },
		inset,
	);
	const inDots = BODIES.slice(0, 4).map((b) =>
		mk(
			"circle",
			b.test
				? { cx: insX(b.au), cy: insY(b.yr), r: 7.5, fill: "none", stroke: "var(--accent)", "stroke-width": 4 }
				: { cx: insX(b.au), cy: insY(b.yr), r: 9, fill: "var(--amber)" },
			inset,
		),
	);
	const marsIn = { x: insX(BODIES[3].au), y: insY(BODIES[3].yr), lineY: insY(rawAt(BODIES[3].au)) };
	const marsName = mk("text", { class: "loglog__ins-text", x: marsIn.x, y: marsIn.y - 20, "text-anchor": "middle", style: "fill:var(--accent)" }, inset, "Mars");
	const drop = mk(
		"line",
		{ x1: marsIn.x, y1: marsIn.y + 9, x2: marsIn.x, y2: marsIn.lineY, stroke: "var(--red)", "stroke-width": 4, "stroke-dasharray": "6 5" },
		inset,
	);
	const mark = mk("circle", { cx: marsIn.x, cy: marsIn.lineY, r: 8, fill: "var(--bg)", stroke: "var(--red)", "stroke-width": 4 }, inset);
	const insNum = mk("g", {}, inset);
	mk("text", { x: marsIn.x + 20, y: marsIn.lineY + 27, style: "font-size:30px;font-weight:800;fill:var(--red)" }, insNum, "\u22122.39");
	mk("text", { class: "loglog__ins-text", x: marsIn.x + 20, y: marsIn.lineY + 53, style: "fill:var(--red)" }, insNum, "years");
	const insImp = mk("g", {}, inset);
	mk("text", { class: "loglog__ins-text", x: iPX1 - 8, y: iPY1 - 30, "text-anchor": "end", style: "fill:var(--red)" }, insImp, "below zero:");
	mk("text", { class: "loglog__ins-text", x: iPX1 - 8, y: iPY1 - 4, "text-anchor": "end", style: "font-weight:700;fill:var(--red)" }, insImp, "impossible");

	// ---------- the green line on the log chart, and the slope triangle ----------
	const lxA = -0.55, lxB = 1.66;
	const green = mk(
		"line",
		{ class: "loglog__green", x1: logXv(lxA), y1: logYv(LOG.slope * lxA + LOG.intercept), x2: logXv(lxA), y2: logYv(LOG.slope * lxA + LOG.intercept) },
		$("green-wrap"),
	);
	const tri = $("tri");
	const tx0 = 0, tx1 = 1;
	const triA = { x: logXv(tx0), y: logYv(LOG.slope * tx0 + LOG.intercept) };
	const triB = { x: logXv(tx1), y: triA.y };
	const triC = { x: logXv(tx1), y: logYv(LOG.slope * tx1 + LOG.intercept) };
	mk("line", { class: "loglog__tri", x1: triA.x, y1: triA.y, x2: triB.x, y2: triB.y }, tri);
	mk("line", { class: "loglog__tri", x1: triB.x, y1: triB.y, x2: triC.x, y2: triC.y }, tri);
	mk("text", { class: "loglog__trilabel", x: (triA.x + triB.x) / 2, y: triA.y + 34, "text-anchor": "middle" }, tri, "1");
	mk("text", { class: "loglog__trilabel", x: triB.x + 16, y: (triB.y + triC.y) / 2 + 10, "text-anchor": "start", style: "fill:var(--green)" }, tri, String(LOG.slope));

	// ---------- the table of beat 1 ----------
	const rowsHost = $("rows");
	const rows = BODIES.map((b) => {
		const row = document.createElement("div");
		row.className = "loglog__row";
		const m = document.createElement("span");
		m.className = "loglog__mk loglog__mk--" + (b.test ? "test" : "train");
		const n = document.createElement("span");
		n.textContent = b.name;
		const d = document.createElement("span");
		d.className = "loglog__num";
		d.textContent = String(b.au);
		const p = document.createElement("span");
		p.className = "loglog__num";
		p.textContent = String(b.yr);
		row.append(m, n, d, p);
		rowsHost.append(row);
		return row;
	});
	const found = $("found-dots");
	const foundDots = [];
	for (let i = 0; i < 7; i++) {
		const f = document.createElement("span");
		f.className = "loglog__fdot";
		found.append(f);
		foundDots.push(f);
	}

	// =====================================================================
	// beat 1: "There is one problem. On a chart, our data is not a straight line. It bends upward: far-away bodies take much longer."
	// =====================================================================
	fade($("legend"), at(1, 2.1));
	pq.reveal($("table"), at(1, 1.9), { y: 20 });
	BODIES.forEach((b, i) => {
		const t = at(1, 2.2 + i * 0.17);
		tl.fromTo(dots[i], { attr: { r: 0 } }, { attr: { r: b.test ? RING : DOT }, duration: 0.4, ease: "back.out(2.2)", immediateRender: false }, t);
		pq.reveal(rows[i], t, { y: 0, x: 24, duration: 0.4 });
		if (nameEls[b.name]) fade(nameEls[b.name], t + 0.2);
	});
	fade(inner, at(1, 2.4));
	// "It bends upward"
	tl.fromTo(curve, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: "power1.inOut", immediateRender: false }, at(1, 4.5));
	// "far-away bodies take much longer": Neptune and Pluto
	const hi = "rgba(124, 156, 255, 0.24)";
	const lo = "rgba(124, 156, 255, 0)";
	tl.fromTo(rows[7], { backgroundColor: lo }, { backgroundColor: hi, duration: 0.4, immediateRender: false }, at(1, 5.9));
	tl.fromTo(rows[8], { backgroundColor: lo }, { backgroundColor: hi, duration: 0.4, immediateRender: false }, at(1, 6.5));
	fadeOut($("p1"), end(1, 0.1));
	for (const name in nameEls) fadeOut(nameEls[name], end(1, 0.1));
	fadeOut(inner, end(1, 0.1));

	// =====================================================================
	// beat 2: "A straight line through that curve fits badly. For Mars, it predicts minus 2.4 years, which is impossible."
	// =====================================================================
	pq.reveal($("fcard"), at(2, 0.3), { y: 20 });
	drawLine(raw, linX(40).toFixed(2), linY(rawAt(40)).toFixed(2), at(2, 0.2), 1.7);
	// "fits badly": red marks
	errs.forEach((e, i) => fade(e, at(2, 2.3 + i * 0.14), 0.3));
	// "For Mars": zoom in on the corner and show the straight-line value
	fade(zoom, at(2, 3.3));
	fade(inset, at(2, 3.4));
	pq.reveal($("mars"), at(2, 3.3), { y: 20 });
	pq.reveal($("mars-sum"), at(2, 3.9), { y: 12 });
	// "predicts minus 2.4 years"
	fade(drop, at(2, 4.2));
	fade(mark, at(2, 4.5));
	fade(insNum, at(2, 4.7));
	pq.reveal($("mars-num"), at(2, 4.7), { y: 16 });
	// "which is impossible"
	fade(tint, at(2, 6.5));
	fade(insImp, at(2, 6.5));
	pq.reveal($("mars-stamp"), at(2, 6.5), { y: 10, scale: 0.9 });
	pq.reveal($("mars-actual"), at(2, 6.95), { y: 10 });
	for (const t of [raw, zoom, inset, $("p2")].concat(errs)) fadeOut(t, end(2, 0.1));

	// =====================================================================
	// beat 3: "The trick is to take the logarithm of both numbers. A logarithm counts the size of a number: ten becomes one, one hundred becomes two."
	// =====================================================================
	pq.dim($("plot"), end(2, 0.1), 0.25);
	pq.reveal($("lg-kicker"), at(3, 0.3), { y: 12 });
	pq.reveal($("chip-0"), at(3, 1.4), { y: 14 });
	pq.reveal($("chip-1"), at(3, 2.3), { y: 14 });
	pq.reveal($("lg-note"), at(3, 3.5), { y: 12 });
	pq.reveal($("s-0"), at(3, 4.3), { y: 0, x: 40 });
	pq.reveal($("s-1"), at(3, 6.35), { y: 0, x: 40 });
	pq.reveal($("s-2"), at(3, 7.6), { y: 0, x: 40 });
	pq.reveal($("s-3"), at(3, 8.8), { y: 0, x: 40 });
	fadeOut($("p3"), end(3, 0.15));

	// =====================================================================
	// beat 4: "On this log-log chart, the very same dots fall on a straight line. Now linear regression fits."
	// =====================================================================
	tl.to($("plot"), { opacity: 1, duration: 0.5, ease: "power1.out" }, at(4, 0));
	// normal axes out, log axes in (tick labels show the original numbers 0.1, 1, 10, 100)
	for (const t of [gridLin, ticksLin, $("xt-lin"), $("yt-lin"), $("title-lin")]) fadeOut(t, at(4, 0.6), 0.5);
	for (const t of [gridLog, ticksLog, $("xt-log"), $("yt-log"), $("title-log")]) fade(t, at(4, 1.0), 0.5);
	pq.reveal($("read"), at(4, 0.5), { y: 20 });
	fadeOut(curve, at(4, 0.2));
	// "the very same dots": every dot glides from its normal-axes position to its log10-log10 position
	BODIES.forEach((b, i) => {
		tl.fromTo(
			dots[i],
			{ attr: { cx: linX(b.au).toFixed(2), cy: linY(b.yr).toFixed(2) } },
			{ attr: { cx: logX(b.au).toFixed(2), cy: logY(b.yr).toFixed(2) }, duration: 1.9, ease: "power2.inOut", immediateRender: false },
			at(4, 1.5),
		);
	});
	// "Now linear regression fits."
	drawLine(green, logXv(lxB).toFixed(2), logYv(LOG.slope * lxB + LOG.intercept).toFixed(2), at(4, 4.4), 1.2);
	pq.reveal($("fits"), at(4, 4.4), { y: 20 });
	fadeOut($("p4"), end(4, 0.15));

	// =====================================================================
	// beat 5: "The slope it finds is 1.4998. Kepler's third law of planetary motion says exactly 1.5. The model rediscovered that law from seven examples."
	// =====================================================================
	fade(tri, at(5, 1.9));
	pq.reveal($("k-found"), at(5, 1.0), { y: 20 });
	pq.count($("slope-num"), 0, LOG.slope, at(5, 1.9), { duration: 1.4, decimals: 4 });
	pq.reveal($("k-law"), at(5, 3.9), { y: 20 });
	pq.reveal($("kepler-num"), at(5, 6.9), { y: 16 });
	pq.reveal($("found"), at(5, 9.3), { y: 14 });
	foundDots.forEach((f, i) => pq.reveal(f, at(5, 10.95 + i * 0.1), { y: 0, scale: 0.3, duration: 0.3 }));
});
