window.PQ.scene("results", (tl, pq) => {
	const at = (id, off) => pq.at(id, off);

	// A group is invisible until its beat starts; it fades out just after `lastBeat` ends.
	const box = (sel, firstBeat, lastBeat) => {
		tl.set(sel, { opacity: 0 }, 0);
		tl.set(sel, { opacity: 1 }, at(firstBeat, -0.12));
		if (lastBeat) {
			tl.fromTo(
				sel,
				{ opacity: 1 },
				{ opacity: 0, duration: 0.4, ease: "power1.in", immediateRender: false },
				pq.end(lastBeat, 0.12),
			);
		}
	};
	// A prediction slides along its track from 0 years and lands on its value.
	const land = (dot, offset, time, duration) => {
		tl.set(dot, { opacity: 0 }, 0);
		tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, time);
		tl.fromTo(
			dot,
			{ x: offset },
			{ x: 0, duration, ease: "power3.out", immediateRender: false },
			time,
		);
	};
	const grow = (seg, time) => {
		tl.set(seg, { scaleX: 0 }, 0);
		tl.fromTo(seg, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out", immediateRender: false }, time);
	};
	const light = (name, color, time) => {
		tl.to(name, { color, duration: 0.4 }, time);
	};

	// ---------- beats 1 and 2: Uranus on a scale of 0 to 180 years ----------
	box("#results-scale", "results-1", "results-2");
	pq.reveal("#results-head", at("results-1", 0.1), { y: 12 });
	pq.reveal("#results-scale .results__axis", at("results-1", 0.4), { y: 0, duration: 0.5 });
	pq.reveal("#results-scale .results__tick", at("results-1", 0.5), { y: 0, duration: 0.5 });
	pq.reveal("#results-scale .results__axistitle", at("results-1", 0.6), { y: 0, duration: 0.5 });
	[0, 1, 2, 3].forEach((i) => pq.reveal("#results-row-" + i, at("results-1", 0.7 + i * 0.1), { y: 0, duration: 0.5 }));

	// "Uranus really takes eighty-four point zero two years."
	pq.reveal("#results-actual", at("results-1", 2.6), { y: -16 });
	tl.set("#results-actual-line", { scaleY: 0 }, 0);
	tl.fromTo(
		"#results-actual-line",
		{ scaleY: 0 },
		{ scaleY: 1, duration: 0.9, ease: "power2.out", immediateRender: false },
		at("results-1", 2.8),
	);

	// "The log-log regression says eighty-four point zero zero."
	light("#results-name-0", "#4ade80", at("results-1", 6.6));
	land("#results-dot-0", -606.7, at("results-1", 6.9), 1.5);
	pq.reveal("#results-val-0", at("results-1", 7.9), { y: 10 });
	pq.reveal("#results-off-0", at("results-1", 8.3), { y: 10 });

	// "The straight-line baseline says one hundred and eight."
	light("#results-name-1", "#f87171", at("results-1", 10.0));
	land("#results-dot-1", -778.9, at("results-1", 10.2), 1.4);
	pq.reveal("#results-val-1", at("results-1", 11.0), { y: 10 });
	grow("#results-seg-1", at("results-1", 11.4));
	pq.reveal("#results-off-1", at("results-1", 11.6), { y: 10 });

	// beat 2: the log-log and baseline rows step back
	tl.to("#results-row-0", { opacity: 0.55, duration: 0.5 }, at("results-2", 0));
	tl.to("#results-row-1", { opacity: 0.55, duration: 0.5 }, at("results-2", 0));

	// "The language model with RAG says fourteen years."
	light("#results-name-2", "#b794ff", at("results-2", 1.0));
	land("#results-dot-2", -101.9, at("results-2", 1.2), 1.2);
	pq.reveal("#results-val-2", at("results-2", 2.0), { y: 10 });
	grow("#results-seg-2", at("results-2", 2.3));
	pq.reveal("#results-off-2", at("results-2", 2.5), { y: 10 });

	// "Without RAG it says one hundred and seventy-six."
	light("#results-name-3", "#b794ff", at("results-2", 4.4));
	land("#results-dot-3", -1273.5, at("results-2", 4.6), 1.6);
	pq.reveal("#results-val-3", at("results-2", 5.7), { y: 10 });
	grow("#results-seg-3", at("results-2", 6.0));
	pq.reveal("#results-off-3", at("results-2", 6.3), { y: 10 });

	// ---------- beat 3: mean absolute error, bars to scale ----------
	box("#results-bars", "results-3");
	pq.reveal("#results-title", at("results-3", 0.2), { y: 14 });
	pq.reveal("#results-subtitle", at("results-3", 0.8), { y: 10 });
	pq.reveal("#results-bars .results__grid", at("results-3", 1.0), { y: 0, duration: 0.5 });
	pq.reveal("#results-bars .results__gtick", at("results-3", 1.0), { y: 0, duration: 0.5 });
	pq.reveal("#results-bars .results__gunit", at("results-3", 1.0), { y: 0, duration: 0.5 });

	const bar = (i, value, width, rowTime, barTime, duration) => {
		pq.reveal("#results-brow-" + i, at("results-3", rowTime), { y: 0, x: -24, duration: 0.45 });
		tl.set("#results-bar-" + i, { width: i === 0 ? 0.49 : 0 }, 0);
		tl.fromTo(
			"#results-bar-" + i,
			{ width: i === 0 ? 0.49 : 0 },
			{ width: Math.max(width, 0.49), duration, ease: "power1.out", immediateRender: false },
			at("results-3", barTime),
		);
		pq.count("#results-num-" + i, 0, value, at("results-3", barTime), { duration, decimals: 2 });
	};
	// "zero point zero two years for the log-log regression"
	bar(0, 0.02, 0.49, 3.6, 4.0, 0.8);
	pq.reveal("#results-thin", at("results-3", 5.2), { y: 0, x: -20 });
	// "seventeen for the baseline"
	bar(1, 17.24, 423.0, 7.3, 7.5, 1.3);
	// "thirty-nine for the language model with RAG"
	bar(2, 38.73, 950.3, 9.5, 9.7, 1.5);
	// "and forty-five without"
	bar(3, 44.83, 1100, 12.1, 12.3, 1.5);
});
