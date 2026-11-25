window.PQ.scene("demo", (tl, pq) => {
	// The view of each screenshot frame is 1772 x 732 px; the screenshots are laid out at
	// 1568 x 882. A camera pose {cx, cy, s} puts screenshot point (cx, cy) in the middle of
	// the view at zoom s.
	const VW = 1772;
	const VH = 732;
	const pose = ({ cx, cy, s }) => ({ x: VW / 2 - cx * s, y: VH / 2 - cy * s, scale: s });
	const move = (el, from, to, time, duration = 1.3, ease = "power2.inOut") =>
		tl.fromTo(el, pose(from), { ...pose(to), duration, ease, immediateRender: false }, time);
	const vx = (c, bx) => VW / 2 + (bx - c.cx) * c.s;
	const vy = (c, by) => VH / 2 + (by - c.cy) * c.s;
	const $ = (id) => document.getElementById(id);
	const HL = { y: 0, scale: 1.06, duration: 0.45 };
	const CO_FROM_LEFT = { y: 0, x: -26, duration: 0.5 };
	const CO_FROM_BELOW = { y: 18, duration: 0.5 };
	const CO_FROM_RIGHT = { y: 0, x: 26, duration: 0.5 };

	// Camera poses (screenshot coordinates)
	const A0 = { cx: 784, cy: 324, s: 1.13 }; // whole app
	const A1 = { cx: 690, cy: 290, s: 1.35 }; // question, buttons, first answers
	const B = { cx: 578, cy: 482, s: 1.95 }; // left answer (with RAG)
	const C = { cx: 1030, cy: 466, s: 1.95 }; // right answer (without RAG)
	const Q1 = { cx: 785, cy: 340, s: 1.8 }; // quiz: topic, question, answer box
	const Q2 = { cx: 785, cy: 673, s: 1.8 }; // quiz: verdict, reference answer

	const camAsk = $("demo-cam-ask");
	const camQuiz = $("demo-cam-quiz");
	tl.set(camAsk, { ...pose(A0), transformOrigin: "0 0" }, 0);
	tl.set(camQuiz, { ...pose(Q1), transformOrigin: "0 0" }, 0);
	// the second screenshot (graded) is stacked above the first and fades in at beat 7 (hidden in CSS)

	// Callout positions in view pixels (callouts do not move with the camera).
	// "right of" callouts are anchored by their right edge so their width can stay automatic.
	const rightOf = (id, c, targetLeft, midY, h) =>
		tl.set($(id), { right: VW - (vx(c, targetLeft) - 24), top: vy(c, midY) - h / 2 }, 0);
	const at = (id, left, top) => tl.set($(id), { left, top }, 0);
	// above a target: anchored by its bottom edge, 22 px above the target's top
	const above = (id, c, left, targetTop) =>
		tl.set($(id), { left: vx(c, left), bottom: VH - (vy(c, targetTop) - 22) }, 0);

	above("demo-co-button", A1, 620, 238);
	rightOf("demo-co-53", B, 339, 408, 95);
	rightOf("demo-co-source", B, 343, 580, 140);
	at("demo-co-83", vx(C, 801), vy(C, 476) + 26);
	at("demo-co-topic", vx(Q1, 742) + 24, vy(Q1, 187) - 36);
	at("demo-co-question", 300, 292);
	at("demo-co-graded", vx(Q2, 613) + 24, vy(Q2, 695) - 38);

	// ---- beat 1: overview, the compare button ----
	const { start } = pq.chapter("demo");
	move(camAsk, A0, A1, start, pq.at("demo-1", 1.6) - start, "sine.inOut");
	// "one button"
	pq.reveal("#demo-hl-button", pq.at("demo-1", 1.9), HL);
	pq.reveal("#demo-co-button", pq.at("demo-1", 2.1), { y: -18, duration: 0.5 });
	// "with retrieval, and without"
	pq.dim(["#demo-hl-button", "#demo-co-button"], pq.at("demo-1", 4.3), 0.3);
	pq.reveal("#demo-hl-cardleft", pq.at("demo-1", 4.5), HL);
	pq.reveal("#demo-hl-cardright", pq.at("demo-1", 5.5), HL);

	// ---- beat 2: with RAG ----
	pq.dismiss(["#demo-hl-button", "#demo-co-button", "#demo-hl-cardleft", "#demo-hl-cardright"], pq.end("demo-1", 0.2));
	move(camAsk, A1, B, pq.at("demo-2"), 1.5);
	// "fifty-three known moons"
	pq.reveal("#demo-hl-answer", pq.at("demo-2", 1.7), HL);
	pq.reveal("#demo-co-53", pq.at("demo-2", 1.9), CO_FROM_LEFT);
	// "taken from the twenty thirteen sources"
	pq.reveal("#demo-hl-2013", pq.at("demo-2", 3.6), HL);
	pq.reveal("#demo-hl-source", pq.at("demo-2", 5.0), HL);
	pq.dismiss("#demo-hl-2013", pq.at("demo-2", 5.0));
	pq.reveal("#demo-co-source", pq.at("demo-2", 5.2), CO_FROM_LEFT);

	// ---- beat 3: without RAG ----
	pq.dismiss(["#demo-hl-answer", "#demo-co-53", "#demo-hl-source", "#demo-co-source"], pq.at("demo-3", 0));
	move(camAsk, B, C, pq.at("demo-3"), 1.1);
	pq.reveal("#demo-veil-left", pq.at("demo-3", 0.2), { y: 0, duration: 0.6 });
	// "eighty-three"
	pq.reveal("#demo-hl-83", pq.at("demo-3", 1.2), HL);
	pq.reveal("#demo-co-83", pq.at("demo-3", 1.4), CO_FROM_BELOW);
	// "from memory"
	pq.reveal("#demo-hl-nosrc", pq.at("demo-3", 2.5), HL);

	// ---- beat 4: 53 is old, faithful to its sources ----
	const shotAsk = $("demo-shot-ask");
	tl.to(shotAsk, { opacity: 0, scale: 0.94, duration: 0.7, ease: "power2.in" }, pq.at("demo-4", 0));
	pq.reveal("#demo-fact-then", pq.at("demo-4", 0.7), { y: 26 });
	pq.reveal("#demo-vs", pq.at("demo-4", 2.3), { y: 0, scale: 0.8 });
	pq.reveal("#demo-fact-now", pq.at("demo-4", 2.6), { y: 26 });
	pq.reveal("#demo-st-1", pq.at("demo-4", 4.5), { y: 22 });
	pq.reveal("#demo-st-2", pq.at("demo-4", 6.3), { y: 22 });

	// ---- beat 5: document quality = answer quality ----
	pq.dim(["#demo-fact-then", "#demo-vs", "#demo-fact-now", "#demo-st-1", "#demo-st-2"], pq.at("demo-5", 0), 0.3);
	pq.reveal("#demo-eq-doc", pq.at("demo-5", 0.6), { y: 24 });
	pq.reveal("#demo-eq-sign", pq.at("demo-5", 1.6), { y: 0, scale: 0.7 });
	pq.reveal("#demo-eq-ans", pq.at("demo-5", 2.1), { y: 24 });

	// ---- beat 6: quiz mode, the question ----
	pq.dismiss("#demo-takeaway", pq.at("demo-6", -0.1));
	pq.reveal("#demo-shot-quiz", pq.at("demo-6", 0), { y: 26, duration: 0.6 });
	pq.reveal("#demo-hl-topic", pq.at("demo-6", 1.1), HL);
	pq.reveal("#demo-co-topic", pq.at("demo-6", 1.3), CO_FROM_RIGHT);
	pq.dismiss(["#demo-hl-topic", "#demo-co-topic"], pq.at("demo-6", 2.7));
	pq.reveal("#demo-hl-question", pq.at("demo-6", 2.6), HL);
	pq.reveal("#demo-co-question", pq.at("demo-6", 3.9), CO_FROM_BELOW);

	// ---- beat 7: free-text answer, graded ----
	pq.dismiss(["#demo-hl-question", "#demo-co-question"], pq.at("demo-7", 0));
	pq.reveal("#demo-hl-typed", pq.at("demo-7", 0.7), HL);
	tl.fromTo("#demo-img-graded", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.inOut", immediateRender: false }, pq.at("demo-7", 0));
	move(camQuiz, Q1, Q2, pq.at("demo-7", 1.8), 1.2);
	pq.dismiss("#demo-hl-typed", pq.at("demo-7", 1.8));
	pq.reveal("#demo-hl-verdict", pq.at("demo-7", 3.0), HL);
	pq.reveal("#demo-hl-reference", pq.at("demo-7", 3.7), HL);
	pq.reveal("#demo-co-graded", pq.at("demo-7", 3.9), CO_FROM_RIGHT);
});
