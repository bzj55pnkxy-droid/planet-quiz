window.PQ.scene("indexing", (tl, pq) => {
	const at = pq.at;
	const end = pq.end;
	const $ = (id) => document.getElementById(id);
	const AMBER = "#fbbf24";
	const GREEN = "#4ade80";
	const RED = "#f87171";

	// ---- the pipeline strip: current step glows, finished steps keep an outline and show their result
	const activate = (i, t) => {
		tl.to($("indexing-box-" + i), { opacity: 1, duration: 0.4, ease: "power1.out" }, t);
		tl.to($("indexing-on-" + i), { opacity: 1, duration: 0.4, ease: "power1.out" }, t);
	};
	const finish = (i, t) => {
		tl.to($("indexing-on-" + i), { opacity: 0, duration: 0.5, ease: "power1.inOut" }, t);
		tl.to($("indexing-done-" + i), { opacity: 1, duration: 0.5, ease: "power1.inOut" }, t);
	};
	const result = (i, t) => pq.reveal($("indexing-res-" + i), t, { y: 14, duration: 0.5 });
	const leave = (panelId, t) => pq.dismiss($(panelId), t);

	// ======== beat 1: the sources (13.4 s) ========
	// "Indexing starts with the sources." 0-2.0 | "We use two P D F files" 2.6-4.2 | "from twenty thirteen" 4.2-5.4
	// "a NASA fact sheet set" 5.8-7.3 | "a brochure from the German Aerospace Center" 7.7-10.2 | "142 pages in total" 10.8-13.4
	const b1 = "indexing-1";
	pq.reveal("#indexing-strip", at(b1, 0.2), { y: -20 });
	pq.reveal("#indexing-nasa-doc", at(b1, 0.9), { y: 30 });
	pq.reveal("#indexing-dlr-doc", at(b1, 1.3), { y: 30 });
	pq.reveal("#indexing-nasa-pdf", at(b1, 3.1), { y: 0, scale: 0.6, duration: 0.4 });
	pq.reveal("#indexing-dlr-pdf", at(b1, 3.4), { y: 0, scale: 0.6, duration: 0.4 });
	pq.reveal("#indexing-nasa-year", at(b1, 4.5), { y: 0, scale: 0.6, duration: 0.4 });
	pq.reveal("#indexing-dlr-year", at(b1, 4.8), { y: 0, scale: 0.6, duration: 0.4 });
	pq.reveal("#indexing-nasa-label", at(b1, 5.9), { y: 20 });
	pq.reveal("#indexing-dlr-label", at(b1, 7.8), { y: 20 });
	pq.reveal("#indexing-plus", at(b1, 10.2), { y: 0, scale: 0.7, duration: 0.4 });
	pq.reveal("#indexing-eq", at(b1, 10.6), { y: 0, scale: 0.7, duration: 0.4 });
	pq.reveal("#indexing-total", at(b1, 10.9), { y: 20 });
	pq.count("#indexing-total-n", 0, 142, at(b1, 11.0), { duration: 1.4 });
	leave("indexing-p1", end(b1, 0.05));

	// ======== beat 2: extraction (6.7 s) ========
	// "Step one is extraction." 0-1.6 | "A library called PyMuPDF" 2.2-4.8 | "pulls the text out of each page." 5.0-6.7
	const b2 = "indexing-2";
	activate(1, at(b2, 0));
	pq.reveal("#indexing-page", at(b2, 0.4), { y: 30 });
	pq.reveal("#indexing-page-cap", at(b2, 1.0), { y: 10 });
	pq.reveal("#indexing-tool", at(b2, 2.3), { x: -30, y: 0 });
	pq.reveal("#indexing-text", at(b2, 4.8), { y: 20 });
	pq.reveal("#indexing-text-cap", at(b2, 4.8), { y: 10 });
	[4.95, 5.3, 5.65, 6.0].forEach((offset, i) => {
		pq.reveal($("indexing-line-" + (i + 1)), at(b2, offset), { x: -20, y: 0, duration: 0.45 });
		tl.to($("indexing-bar-" + (i + 1)), { backgroundColor: AMBER, duration: 0.3 }, at(b2, offset));
	});
	finish(1, end(b2, -0.2));
	result(1, end(b2, -0.2));
	leave("indexing-p2", end(b2, 0.05));

	// ======== beat 3: cleaning (10.5 s) ========
	// "Step two is cleaning." 0-1.4 | "repair words split across lines" 1.9-4.0 | "drop pages with almost no text, like covers" 4.4-7.6
	// "One hundred and nineteen pages remain." 8.3-10.5
	const b3 = "indexing-3";
	activate(2, at(b3, 0));
	pq.reveal("#indexing-fix", at(b3, 0.3), { y: 30 });
	tl.to($("indexing-w1"), { color: AMBER, duration: 0.3 }, at(b3, 2.4));
	tl.to($("indexing-w2"), { color: AMBER, duration: 0.3 }, at(b3, 2.65));
	pq.reveal("#indexing-down", at(b3, 3.1), { y: -10, duration: 0.4 });
	pq.reveal("#indexing-aftersnip", at(b3, 3.4), { y: 20 });
	tl.to($("indexing-w3"), { color: GREEN, duration: 0.4 }, at(b3, 3.9));

	pq.reveal("#indexing-drop", at(b3, 4.5), { y: 30 });
	tl.to($("indexing-flag"), { opacity: 1, duration: 0.3 }, at(b3, 5.3));
	pq.reveal("#indexing-cap-0", at(b3, 5.6), { y: 10 });
	[6.2, 6.4, 6.6].forEach((offset, i) => pq.reveal($("indexing-cap-" + (i + 1)), at(b3, offset), { y: 10 }));
	tl.to($("indexing-cross"), { opacity: 1, duration: 0.3 }, at(b3, 7.1));
	pq.reveal("#indexing-countrow", at(b3, 8.3), { y: 20 });
	pq.count("#indexing-count", 142, 119, at(b3, 8.6), { duration: 1.4 });
	pq.reveal("#indexing-dropped", at(b3, 9.1), { y: 0, scale: 0.8, duration: 0.4 });
	tl.to($("indexing-count"), { color: GREEN, duration: 0.4 }, at(b3, 10.0));
	result(2, at(b3, 9.9));
	finish(2, at(b3, 10.0));
	leave("indexing-p3", end(b3, 0.05));

	// ======== beat 4: chunking (8.9 s) ========
	// "Step three is chunking." 0-1.5 | "A whole page is too big and too mixed to search well" 2.0-5.1
	// "so we cut the text into chunks of about one thousand characters" 5.5-8.9
	const b4 = "indexing-4";
	activate(3, at(b4, 0));
	[1, 2, 3, 4].forEach((n) => pq.reveal($("indexing-blk-" + n), at(b4, 0.4 + (n - 1) * 0.08), { y: 24 }));
	pq.reveal("#indexing-pagelabel", at(b4, 0.8), { x: -20, y: 0 });
	[3.2, 3.9, 4.5].forEach((offset, i) => pq.reveal($("indexing-topic-" + (i + 1)), at(b4, offset), { x: 24, y: 0 }));
	[1, 2, 3].forEach((n) => pq.dismiss($("indexing-topic-" + n), at(b4, 5.5)));
	[5.7, 6.0, 6.3].forEach((offset, i) => pq.reveal($("indexing-cut-" + (i + 1)), at(b4, offset), { y: 0, duration: 0.35 }));
	pq.dismiss($("indexing-pagelabel"), at(b4, 6.4));
	[0, 1, 2, 3].forEach((i) => {
		// sideways first (blocks stay on separate rows), then up (blocks are already in separate columns)
		tl.to($("indexing-blk-" + (i + 1)), { x: 13 + 450 * i - 688, duration: 0.6, ease: "power2.inOut" }, at(b4, 6.5 + i * 0.05));
		tl.to($("indexing-blk-" + (i + 1)), { y: 140 - (30 + 130 * i), duration: 0.6, ease: "power2.inOut" }, at(b4, 7.2 + i * 0.05));
		pq.reveal($("indexing-blkcap-" + (i + 1)), at(b4, 7.9 + i * 0.1), { y: 10 });
	});
	[1, 2, 3].forEach((n) => pq.dismiss($("indexing-cut-" + n), at(b4, 6.5), { duration: 0.3 }));
	pq.reveal("#indexing-size", at(b4, 7.9), { y: 16 });
	leave("indexing-p4", end(b4, 0.05));

	// ======== beat 5: overlap, 532 chunks (9.6 s) ========
	// "Neighbouring chunks overlap by 150 characters" 0-3.5 | "so a sentence at the border is not cut in half" 3.9-6.5
	// "That gives five hundred and thirty-two chunks." 7.1-9.6
	const b5 = "indexing-5";
	pq.reveal("#indexing-c1", at(b5, 0.3), { y: 30 });
	pq.reveal("#indexing-c2", at(b5, 0.55), { y: 30 });
	tl.to($("indexing-ov-1"), { backgroundColor: "rgba(124, 156, 255, 0.32)", duration: 0.5 }, at(b5, 1.5));
	tl.to($("indexing-ov-2"), { backgroundColor: "rgba(124, 156, 255, 0.32)", duration: 0.5 }, at(b5, 1.7));
	pq.reveal("#indexing-overlap-label", at(b5, 2.3), { y: 14 });
	tl.to($("indexing-s-1"), { color: RED, duration: 0.4 }, at(b5, 4.2));
	pq.reveal("#indexing-cutmark", at(b5, 4.4), { y: 0, duration: 0.3 });
	pq.reveal("#indexing-note-1", at(b5, 4.7), { y: 12 });
	[2, 3].forEach((n) => tl.to($("indexing-s-" + n), { color: GREEN, duration: 0.4 }, at(b5, 5.3)));
	pq.reveal("#indexing-note-2", at(b5, 5.6), { y: 12 });
	leave("indexing-p5", at(b5, 6.8));

	pq.reveal("#indexing-sum-from", at(b5, 7.2), { x: -30, y: 0 });
	pq.reveal("#indexing-sum-arrow", at(b5, 7.5), { x: -20, y: 0 });
	pq.reveal("#indexing-sum-to", at(b5, 7.7), { x: 30, y: 0 });
	pq.count("#indexing-chunkcount", 0, 532, at(b5, 7.8), { duration: 1.5 });
	result(3, at(b5, 9.2));
	finish(3, at(b5, 9.3));
	leave("indexing-p5b", end(b5, 0.05));

	// ======== beat 6: embedding (6.6 s) ========
	// "Step four is embedding." 0-1.4 | "An embedding model turns each chunk into a long list of numbers" 2.0-5.5 | "called a vector" 5.8-6.6
	const b6 = "indexing-6";
	activate(4, at(b6, 0));
	pq.reveal("#indexing-embchunk", at(b6, 0.4), { x: -30, y: 0 });
	pq.reveal("#indexing-emb-a1", at(b6, 2.1), { x: -20, y: 0 });
	pq.reveal("#indexing-model", at(b6, 2.4), { y: 0, scale: 0.92 });
	pq.reveal("#indexing-emb-a2", at(b6, 3.3), { x: -20, y: 0 });
	pq.reveal("#indexing-vec", at(b6, 3.5), { x: 30, y: 0 });
	[3.9, 4.25, 4.6, 4.95, 5.3, 5.6].forEach((offset, i) => {
		pq.reveal($("indexing-num-" + (i + 1)), at(b6, offset), { y: 14, duration: 0.4 });
	});
	pq.reveal("#indexing-vec-label", at(b6, 5.8), { y: 0, scale: 0.8, duration: 0.4 });
	pq.reveal("#indexing-vec-foot", at(b6, 6.0), { y: 10 });
	leave("indexing-p6", end(b6, 0.05));

	// ======== beat 7: meaning space (4.4 s) ========
	// "Texts with similar meaning" 0-1.4 | "get vectors that point in similar directions" 1.8-4.4
	const b7 = "indexing-7";
	pq.reveal("#indexing-plot", at(b7, 0.1), { y: 0, duration: 0.4 });
	pq.reveal("#indexing-sketch", at(b7, 0.3), { y: 10 });
	const arrows = [
		["indexing-va-1", 22, 640, 0.5],
		["indexing-va-2", 33, 600, 0.8],
		["indexing-va-3", 44, 560, 1.1],
		["indexing-va-4", 112, 440, 3.0],
	];
	arrows.forEach(([id, angle, length, offset]) => {
		const el = $(id);
		tl.set(el, { rotation: -angle, transformOrigin: "0% 50%" }, 0);
		pq.reveal(el, at(b7, offset), { y: 0, duration: 0.2 });
		tl.fromTo(
			el,
			{ width: 0 },
			{ width: length, duration: 0.8, ease: "power2.out", immediateRender: false },
			at(b7, offset),
		);
	});
	pq.reveal("#indexing-tip-1", at(b7, 1.2), { x: -14, y: 0, duration: 0.4 });
	pq.reveal("#indexing-tip-2", at(b7, 1.5), { x: -14, y: 0, duration: 0.4 });
	pq.reveal("#indexing-tip-3", at(b7, 1.8), { x: -14, y: 0, duration: 0.4 });
	pq.reveal("#indexing-arc-small", at(b7, 2.2), { y: 0, duration: 0.4 });
	pq.reveal("#indexing-legend-small", at(b7, 2.3), { x: 30, y: 0 });
	pq.reveal("#indexing-tip-4", at(b7, 3.6), { x: -14, y: 0, duration: 0.4 });
	pq.reveal("#indexing-arc-big", at(b7, 3.5), { y: 0, duration: 0.4 });
	pq.reveal("#indexing-legend-big", at(b7, 3.6), { x: 30, y: 0 });
	result(4, at(b7, 3.5));
	finish(4, at(b7, 3.6));
	leave("indexing-p7", end(b7, 0.05));

	// ======== beat 8: storing (7.8 s) ========
	// "Step five is storing." 0-1.5 | "Every vector is saved" 2.1-3.4 | "together with its text and page number" 3.6-5.6
	// "in a vector database called Chroma" 5.9-7.8
	const b8 = "indexing-8";
	activate(5, at(b8, 0));
	pq.reveal("#indexing-db", at(b8, 0.4), { y: 30 });
	pq.reveal("#indexing-table", at(b8, 0.7), { x: 40, y: 0 });
	// Row cells in order: 0 vector, 1 text, 2 file, 3 page.
	const cell = (row, col) => $("indexing-row-" + row).children[col];
	[2.2, 2.55, 2.9, 3.25].forEach((offset, i) => {
		pq.reveal(cell(i + 1, 0), at(b8, offset), { x: -30, y: 0, duration: 0.45 });
	});
	[3.7, 4.0, 4.3, 4.6].forEach((offset, i) => {
		pq.reveal(cell(i + 1, 1), at(b8, offset), { y: 0, x: 0, duration: 0.45 });
	});
	[4.8, 5.0, 5.2, 5.4].forEach((offset, i) => {
		pq.reveal(cell(i + 1, 2), at(b8, offset), { y: 0, x: 0, duration: 0.45 });
		pq.reveal(cell(i + 1, 3), at(b8, offset), { y: 0, scale: 0.7, duration: 0.45 });
	});
	pq.reveal("#indexing-row-more", at(b8, 5.7), { y: 10 });
	tl.to($("indexing-table"), { boxShadow: "0 0 44px rgba(45, 212, 191, 0.45)", duration: 0.5 }, at(b8, 6.0));
	tl.to($("indexing-db"), { scale: 1.08, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" }, at(b8, 6.0));
	pq.reveal("#indexing-dblabel", at(b8, 6.5), { y: 14 });
	result(5, at(b8, 6.9));
	finish(5, at(b8, 7.0));
	leave("indexing-p8", end(b8, 0.05));

	// ======== beat 9: one file (5.1 s) ========
	// "In our project, all of this is one file," 0-2.4 | "ingest dot pie," 2.7-3.9 | "and you run it once." 4.1-5.1
	const b9 = "indexing-9";
	[1, 2, 3, 4, 5].forEach((i) => {
		tl.to($("indexing-on-" + i), { opacity: 1, duration: 0.5, ease: "power1.out" }, at(b9, 0.3 + (i - 1) * 0.12));
		tl.to($("indexing-on-" + i), { opacity: 0, duration: 0.6, ease: "power1.inOut" }, at(b9, 3.6));
	});
	pq.reveal("#indexing-file", at(b9, 0.3), { y: 30 });
	pq.reveal("#indexing-summary", at(b9, 2.4), { y: 20 });
	pq.reveal("#indexing-run .ix-cmd", at(b9, 4.0), { y: 20 });
	pq.reveal("#indexing-badge", at(b9, 4.4), { y: 0, scale: 0.7, duration: 0.45 });
});
