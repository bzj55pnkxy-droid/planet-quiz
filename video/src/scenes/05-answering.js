window.PQ.scene("answering", (tl, pq) => {
	const at = (n, o = 0) => pq.at("answering-" + n, o);
	const el = (id) => document.getElementById("answering-" + id);
	const fade = (target, time, duration = 0.35) => {
		tl.set(target, { opacity: 0 }, 0);
		tl.to(target, { opacity: 1, duration, ease: "power1.out" }, time);
	};

	// ---------- the pipeline strip: current step lit, finished steps dimmer ----------
	const STEP = [
		{ c: "#2dd4bf", tint: "rgba(45, 212, 191, 0.16)" },
		{ c: "#7c9cff", tint: "rgba(124, 156, 255, 0.18)" },
		{ c: "#fbbf24", tint: "rgba(251, 191, 36, 0.14)" },
		{ c: "#b794ff", tint: "rgba(183, 148, 255, 0.18)" },
	];
	const stepTo = (i, state, time) => {
		const s = STEP[i - 1];
		const to =
			state === "active"
				? { opacity: 1, borderColor: s.c, backgroundColor: s.tint }
				: { opacity: 0.6, borderColor: s.c, backgroundColor: "#161f3d" };
		tl.to(el("step-" + i), { ...to, duration: 0.45, ease: "power1.inOut" }, time);
	};
	pq.reveal("#answering-strip", at(1, -0.6), { y: -24 });
	stepTo(1, "active", at(1, -0.5));
	stepTo(1, "done", at(2));
	stepTo(2, "active", at(2));
	stepTo(2, "done", at(4));
	stepTo(3, "active", at(4));
	stepTo(3, "done", at(5));
	stepTo(4, "active", at(5));

	// ---------- the grid of chunk dots (532 = 38 x 14) ----------
	const COLS = 38;
	const ROWS = 14;
	const PITCH = 21.6;
	const DOT = 11;
	const DOT_OP = 0.55;
	const grid = el("grid");
	for (let i = 0; i < COLS * ROWS; i++) {
		const d = document.createElement("span");
		d.className = "answering__dot";
		d.id = "answering-dot-" + i;
		d.style.left = (i % COLS) * PITCH + "px";
		d.style.top = Math.floor(i / COLS) * PITCH + "px";
		grid.appendChild(d);
	}
	const dots = [];
	for (let i = 0; i < COLS * ROWS; i++) dots.push(document.getElementById("answering-dot-" + i));
	// the four chunks Chroma returns: (row, column) in the grid
	const LIT_RC = [
		[2, 33],
		[5, 28],
		[9, 35],
		[12, 30],
	];
	const LIT = LIT_RC.map(([r, c]) => r * COLS + c);
	const lit = LIT.map((i) => dots[i]);
	const others = dots.filter((_, i) => !LIT.includes(i));
	const halos = LIT_RC.map(([r, c], k) => {
		const h = document.createElement("span");
		h.className = "answering__halo";
		h.id = "answering-halo-" + k;
		h.style.left = c * PITCH + DOT / 2 - 22 + "px";
		h.style.top = r * PITCH + DOT / 2 - 22 + "px";
		grid.appendChild(h);
		return h;
	});

	// ---------- beat 1: question -> nomic-embed-text -> vector ----------
	pq.reveal("#answering-bubble", at(1, 0.3), { x: -50, y: 0 });
	pq.reveal("#answering-a1", at(1, 3.2), { x: -20, y: 0 });
	pq.reveal("#answering-embed", at(1, 3.5), { y: 0, scale: 0.9 });
	pq.reveal("#answering-same", at(1, 4.9), { y: 10 });
	pq.reveal("#answering-a2", at(1, 5.5), { x: -20, y: 0 });
	pq.reveal("#answering-qvec", at(1, 5.8), { y: 0, scale: 0.9 });
	// the numbers of the vector appear one by one
	const rows = pq.$$("#answering-qvec .answering__num-row");
	tl.set(rows, { opacity: 0 }, 0);
	rows.forEach((row, i) => {
		tl.fromTo(
			row,
			{ opacity: 0, y: 8 },
			{ opacity: 1, y: 0, duration: 0.35, ease: "power2.out", immediateRender: false },
			at(1, 6.1 + i * 0.22),
		);
	});

	// ---------- beat 2: compare with all 532 chunk vectors ----------
	["bubble", "a1", "embed", "a2"].forEach((id) => pq.dismiss("#answering-" + id, at(2)));
	pq.reveal("#answering-chroma", at(2, 0.1), { y: 0, x: -40 });
	tl.set(dots, { opacity: 0, scale: 0.2 }, 0);
	tl.to(
		dots,
		{
			opacity: DOT_OP,
			scale: 1,
			duration: 0.3,
			ease: "power2.out",
			stagger: { amount: 1.0, grid: [COLS, ROWS], from: "center" },
		},
		at(2, 0.4),
	);
	pq.reveal("#answering-cmp", at(2, 1.2), { x: 20, y: 0 });
	const byColumn = (i) => (i % COLS) * (1.7 / COLS);
	tl.to(dots, { opacity: 1, scale: 1.8, duration: 0.2, ease: "power1.out", stagger: byColumn }, at(2, 1.9));
	tl.to(dots, { opacity: DOT_OP, scale: 1, duration: 0.3, ease: "power1.in", stagger: byColumn }, at(2, 2.1));
	pq.reveal("#answering-counttext", at(2, 2.3), { y: 0, scale: 0.9 });
	pq.count("#answering-count", 0, 532, at(2, 2.3), { duration: 1.3 });
	// the question vector "listens" while Chroma compares
	tl.to("#answering-qvec", { borderColor: "#eef1fb", duration: 0.3 }, at(2, 1.2));
	tl.to("#answering-qvec", { borderColor: "#2dd4bf", duration: 0.5 }, at(2, 3.6));

	// ---------- beat 3: cosine similarity, then the top 4 ----------
	pq.dismiss("#answering-qvec", at(3));
	pq.dismiss("#answering-cmp", at(3));
	tl.to("#answering-chroma", { x: -190, duration: 0.9, ease: "power2.inOut" }, at(3, 0.3));
	pq.reveal("#answering-t3a", at(3, 1.4), { y: 14 });

	// Two sketches from one origin: a small angle (similar) and a wide angle (different).
	const OX = 60;
	const OY = 218;
	const LEN = 210;
	const RAD = 120;
	const HEAD = 24;
	const HALF = 12;
	const pt = (deg, r) => {
		const a = (deg * Math.PI) / 180;
		return [OX + r * Math.cos(a), OY - r * Math.sin(a)];
	};
	const f = (n) => n.toFixed(1);
	const arrow = (key, name, deg, color, label, dx, dy) => {
		const a = (deg * Math.PI) / 180;
		const ux = Math.cos(a);
		const uy = -Math.sin(a);
		const [tx, ty] = pt(deg, LEN);
		const bx = tx - HEAD * ux;
		const by = ty - HEAD * uy;
		const head = `${f(tx)},${f(ty)} ${f(bx - HALF * uy)},${f(by + HALF * ux)} ${f(bx + HALF * uy)},${f(by - HALF * ux)}`;
		return (
			`<line id="${key}-${name}-line" x1="${OX}" y1="${OY}" x2="${f(bx)}" y2="${f(by)}" stroke="${color}" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" />` +
			`<polygon id="${key}-${name}-head" points="${head}" fill="${color}" />` +
			`<text id="${key}-${name}-label" x="${f(tx + dx)}" y="${f(ty + dy)}" fill="${color}">${label}</text>`
		);
	};
	const sketch = (key, hostId, chunkDeg, chunkColor, big, small, bigColor) => {
		const q = 8;
		const [x1, y1] = pt(q, RAD);
		const [x2, y2] = pt(chunkDeg, RAD);
		const wedge = `M${OX},${OY} L${f(x1)},${f(y1)} A${RAD},${RAD} 0 0 0 ${f(x2)},${f(y2)} Z`;
		const arc = `M${f(x1)},${f(y1)} A${RAD},${RAD} 0 0 0 ${f(x2)},${f(y2)}`;
		const host = document.getElementById(hostId);
		host.innerHTML =
			`<svg width="430" height="236" viewBox="0 0 430 236">` +
			`<path id="${key}-wedge" d="${wedge}" fill="rgba(238,241,251,0.14)" />` +
			arrow(key, "q", q, "#2dd4bf", "question", 14, 10) +
			arrow(key, "c", chunkDeg, chunkColor, "chunk", 14, 0) +
			`<path id="${key}-arc" d="${arc}" fill="none" stroke="#eef1fb" stroke-width="4" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" />` +
			`<circle cx="${OX}" cy="${OY}" r="8" fill="#eef1fb" />` +
			`</svg>` +
			`<div class="answering__skcopy"><div class="answering__skbig" id="${key}-big" style="color:${bigColor}">${big}</div>` +
			`<div class="answering__sksmall" id="${key}-small" style="color:${bigColor}">${small}</div></div>`;
	};
	sketch("answering-s1", "answering-sk1", 30, "#7c9cff", "small angle", "similar meaning", "#7c9cff");
	sketch("answering-s2", "answering-sk2", 80, "#9daad0", "wide angle", "different meaning", "#9daad0");

	const draw = (id, time, duration = 0.6) => {
		const node = document.getElementById(id);
		tl.fromTo(
			node,
			{ strokeDashoffset: 1 },
			{ strokeDashoffset: 0, duration, ease: "power2.out", immediateRender: false },
			time,
		);
	};
	const playSketch = (key, host, t0, tBig, tSmall) => {
		fade(host, t0, 0.2);
		draw(key + "-q-line", t0);
		fade("#" + key + "-q-head", t0 + 0.5, 0.2);
		fade("#" + key + "-q-label", t0 + 0.4);
		draw(key + "-c-line", t0 + 0.5);
		fade("#" + key + "-c-head", t0 + 1.0, 0.2);
		fade("#" + key + "-c-label", t0 + 0.9);
		fade("#" + key + "-wedge", t0 + 1.0, 0.5);
		draw(key + "-arc", t0 + 1.0, 0.5);
		pq.reveal("#" + key + "-big", tBig, { y: 10 });
		pq.reveal("#" + key + "-small", tSmall, { y: 10 });
	};
	playSketch("answering-s1", "#answering-sk1", at(3, 2.0), at(3, 3.0), at(3, 4.5));
	playSketch("answering-s2", "#answering-sk2", at(3, 3.9), at(3, 4.9), at(3, 5.4));
	pq.dismiss("#answering-sk1", at(3, 6.0));
	pq.dismiss("#answering-sk2", at(3, 6.0));
	pq.dismiss("#answering-t3a", at(3, 6.0));

	// "We keep the top four chunks": four dots light up, everything else fades back.
	pq.reveal("#answering-t3b", at(3, 6.2), { y: 14 });
	tl.to(others, { opacity: 0.12, duration: 0.5, ease: "power1.inOut" }, at(3, 6.1));
	tl.to(
		lit,
		{ opacity: 1, scale: 2, backgroundColor: "#7c9cff", duration: 0.45, ease: "power2.out", stagger: 0.3 },
		at(3, 6.2),
	);
	tl.set(halos, { opacity: 0, scale: 0.4 }, 0);
	tl.to(halos, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out", stagger: 0.3 }, at(3, 6.2));

	// lines from each lit dot (in the panel, after it slid left) to its result card
	const links = el("links");
	const CARD_TOP = [240, 366, 492, 618];
	LIT_RC.forEach(([r, c], k) => {
		const x1 = 28 + c * PITCH + DOT / 2;
		const y1 = 240 + 82 + r * PITCH + DOT / 2;
		const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line.setAttribute("id", "answering-link-" + k);
		line.setAttribute("x1", String(x1 + 14));
		line.setAttribute("y1", String(y1));
		line.setAttribute("x2", "960");
		line.setAttribute("y2", String(CARD_TOP[k] + 56));
		line.setAttribute("stroke", "#7c9cff");
		line.setAttribute("stroke-width", "3");
		line.setAttribute("stroke-linecap", "round");
		links.appendChild(line);
		fade(line, at(3, 6.35 + k * 0.3), 0.3);
		pq.reveal("#answering-hit-" + (k + 1), at(3, 6.5 + k * 0.3), { x: 30, y: 0 });
	});

	// ---------- beat 4: build the prompt ----------
	pq.dismiss("#answering-chroma", at(4));
	pq.dismiss("#answering-t3b", at(4));
	pq.dismiss("#answering-links", at(4));
	[1, 2, 3, 4].forEach((k) => pq.dismiss("#answering-hit-" + k, at(4)));
	pq.reveal("#answering-sheet", at(4, 0.3), { y: 30 });
	tl.set("#answering-sheet", { transformOrigin: "0 0" }, 0);
	// passages first (numbered one by one), then the question, then the instructions
	[1, 2, 3, 4].forEach((k) => pq.reveal("#answering-p" + k, at(4, 0.55 + (k - 1) * 0.42), { y: 12, duration: 0.4 }));
	tl.to("#answering-sheet", { borderColor: "#7c9cff", duration: 0.4 }, at(4, 2.7));
	tl.to("#answering-sheet", { borderColor: "#2e3b6b", duration: 0.5 }, at(4, 3.8));
	pq.reveal("#answering-qrow", at(4, 4.4), { y: 12 });
	pq.reveal("#answering-sysbody", at(4, 5.4), { y: 10 });
	tl.to("#answering-sys", { borderColor: "#b794ff", duration: 0.4 }, at(4, 5.4));

	// ---------- beat 5: the model writes the answer ----------
	// the sheet shrinks into a small icon on the left
	tl.to(
		"#answering-sheet",
		{ x: -318, y: 216, scale: 0.3, duration: 0.9, ease: "power2.inOut" },
		at(5, 0.1),
	);
	pq.reveal("#answering-thumblabel", at(5, 1.0), { y: 8 });
	pq.reveal("#answering-gemma", at(5, 0.9), { y: 0, scale: 0.9 });
	pq.reveal("#answering-gnote1", at(5, 1.5), { y: 8 });
	pq.reveal("#answering-gnote2", at(5, 2.4), { y: 8 });
	pq.reveal("#answering-ollama", at(5, 3.5), { y: 0, scale: 0.95 });
	pq.reveal("#answering-a3", at(5, 4.3), { x: -15, y: 0 });
	// the prompt slides into the model ...
	tl.to(
		"#answering-sheet",
		{ x: 190, y: 236, scale: 0.18, opacity: 0, duration: 0.7, ease: "power2.in" },
		at(5, 4.5),
	);
	pq.dismiss("#answering-thumblabel", at(5, 4.5));
	tl.to("#answering-gemma", { backgroundColor: "rgba(183, 148, 255, 0.28)", duration: 0.3 }, at(5, 5.1));
	tl.to("#answering-gemma", { backgroundColor: "#161f3d", duration: 0.6 }, at(5, 5.9));
	// ... and the answer streams out word by word
	pq.reveal("#answering-a4", at(5, 5.2), { x: -15, y: 0 });
	pq.reveal("#answering-answer", at(5, 5.3), { x: 30, y: 0 });
	const atext = el("atext");
	const words = [];
	"Saturn has 53 known moons (plus 9 awaiting official confirmation).".split(" ").forEach((w, i) => {
		const s = document.createElement("span");
		s.id = "answering-w-" + i;
		s.textContent = w;
		atext.appendChild(s);
		atext.appendChild(document.createTextNode(" "));
		words.push(s);
	});
	const cite = document.createElement("span");
	cite.className = "answering__cite";
	cite.id = "answering-cite";
	cite.textContent = "[4]";
	atext.appendChild(cite);
	words.push(cite);
	tl.set(words, { opacity: 0 }, 0);
	tl.to(words, { opacity: 1, duration: 0.15, ease: "none", stagger: 0.1 }, at(5, 5.6));

	// ---------- beat 6: the citation points at its source ----------
	tl.to(
		"#answering-cite",
		{ backgroundColor: "rgba(74, 222, 128, 0.2)", borderColor: "#4ade80", color: "#4ade80", duration: 0.4 },
		at(6, 0.5),
	);
	["ollama", "gemma", "a3", "a4"].forEach((id) => pq.dismiss("#answering-" + id, at(6, 1.0)));
	["src-1", "src-2", "src-3"].forEach((id, i) => pq.reveal("#answering-" + id, at(6, 2.0 + i * 0.25), { x: -40, y: 0 }));
	pq.reveal("#answering-source", at(6, 2.8), { x: -40, y: 0 });
	tl.fromTo(
		"#answering-link",
		{ scaleX: 0, opacity: 1 },
		{ scaleX: 1, opacity: 1, duration: 0.6, ease: "power2.out", immediateRender: false },
		at(6, 3.3),
	);
	tl.to("#answering-hl", { backgroundColor: "rgba(74, 222, 128, 0.28)", duration: 0.4 }, at(6, 5.0));
	pq.reveal("#answering-check", at(6, 5.5), { y: 0, scale: 0.5 });
});
