window.PQ.scene("code", (tl, pq) => {
	const at = (n, o = 0) => pq.at("code-" + n, o);
	const end = (n, o = 0) => pq.end("code-" + n, o);
	const $ = (id) => document.getElementById("code-" + id);
	const fadeOut = (target, time, duration = 0.4) => {
		tl.to(target, { opacity: 0, duration, ease: "power1.in" }, time);
	};
	// Fade and slide something in, ending at opacity `to`.
	const slide = (target, time, to = 1, y = 20) => {
		tl.set(target, { opacity: 0 }, 0);
		tl.fromTo(target, { opacity: 0, y }, { opacity: to, y: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, time);
	};

	// ---------- highlighting the line being talked about ----------
	const DIM = 0.5;
	const hl = (step, on, off) => {
		tl.fromTo($("l-" + step), { opacity: DIM }, { opacity: 1, duration: 0.3, immediateRender: false }, on);
		tl.fromTo($("band-" + step), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, on);
		if (off !== undefined) {
			tl.fromTo($("l-" + step), { opacity: 1 }, { opacity: DIM, duration: 0.3, immediateRender: false }, off);
			tl.fromTo($("band-" + step), { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, off);
		}
	};
	// Colour a part of a line (a token) so it matches its callout card.
	const COLOR = {
		accent: ["#7c9cff", "rgba(124, 156, 255, 0.30)", "rgba(124, 156, 255, 0)"],
		amber: ["#fbbf24", "rgba(251, 191, 36, 0.30)", "rgba(251, 191, 36, 0)"],
		teal: ["#2dd4bf", "rgba(45, 212, 191, 0.30)", "rgba(45, 212, 191, 0)"],
	};
	const tok = (id, time, color, off) => {
		const [fg, bg, clear] = COLOR[color];
		tl.fromTo(
			$("tk-" + id),
			{ color: "#eef1fb", backgroundColor: clear },
			{ color: fg, backgroundColor: bg, duration: 0.3, immediateRender: false },
			time,
		);
		if (off !== undefined) {
			tl.fromTo(
				$("tk-" + id),
				{ color: fg, backgroundColor: bg },
				{ color: "#eef1fb", backgroundColor: clear, duration: 0.3, immediateRender: false },
				off,
			);
		}
	};

	// =====================================================================
	// beat 1: "Now the code. Everything is in one file: run experiment dot pie, in the experiment folder."
	// =====================================================================
	slide($("path"), at(1, 1.3));
	tl.fromTo($("fname"), { color: "#9daad0" }, { color: "#eef1fb", duration: 0.4, immediateRender: false }, at(1, 3.2));
	tl.fromTo($("dir"), { color: "#9daad0" }, { color: "#eef1fb", duration: 0.4, immediateRender: false }, at(1, 4.95));
	// the outline, in the order the functions run; only the first two belong to this chapter
	for (let i = 0; i < 5; i++) {
		const t = at(1, 3.4 + i * 0.4);
		const level = i < 2 ? 1 : 0.4;
		slide($("n-" + i), t, level);
		if (i < 4) slide($("a-" + i), t + 0.25, level, 0);
	}
	slide($("br-now"), at(1, 5.4), 1, 10);
	slide($("br-later"), at(1, 5.7), 1, 10);
	fadeOut($("v1"), end(1, 0.1));

	// =====================================================================
	// beat 2: build_dataset() reads the numbers with two text patterns, converts the units, marks train / test
	// =====================================================================
	pq.reveal($("panel-2"), at(2, -0.05), { y: 20 });
	hl("b0", at(2, 0.3), at(2, 1.9)); // "The function build dataset"
	hl("b2", at(2, 2.05), at(2, 6.3)); // "the distance"
	hl("b3", at(2, 3.05), at(2, 6.3)); // "the orbit period"
	pq.reveal($("note-1"), at(2, 4.9), { y: 20 }); // "with two text patterns"
	tok("rx0", at(2, 5.2), "accent", at(2, 6.3));
	tok("rx1", at(2, 5.2), "accent", at(2, 6.3));
	hl("b5", at(2, 6.4), at(2, 7.95)); // "converts the units"
	hl("b6", at(2, 6.4), at(2, 7.95));
	pq.reveal($("note-2"), at(2, 6.5), { y: 20 });
	hl("b7", at(2, 8.0)); // "marks each row as train or test"
	pq.reveal($("note-3"), at(2, 8.05), { y: 20 });
	fadeOut($("v2"), end(2, 0.1));

	// =====================================================================
	// beat 3: fit_regressions() gets the train rows: x is the distance, y is the period
	// =====================================================================
	pq.reveal($("panel-3"), at(3, -0.05), { y: 20 });
	hl("f0", at(3, 0.2), at(3, 3.3)); // "The function fit regressions"
	tok("train", at(3, 2.3), "accent", at(3, 3.3)); // "gets the train rows"
	hl("f2", at(3, 3.35), at(3, 4.5)); // "X is the distance"
	tok("x", at(3, 3.4), "accent", at(3, 4.5));
	pq.reveal($("note-x"), at(3, 3.4), { y: 20 });
	hl("f3", at(3, 4.55), at(3, 5.9)); // "Y is the period"
	tok("y", at(3, 4.6), "accent", at(3, 5.9));
	pq.reveal($("note-y"), at(3, 4.6), { y: 20 });
	fadeOut($("ns-3"), end(3, 0.1));

	// =====================================================================
	// beat 4: one line trains the model: LinearRegression().fit(...) on the logarithms of x and y
	// =====================================================================
	hl("f5", at(4, 0.0), end(4, 0.1)); // "One line trains the model"
	tok("lr", at(4, 2.1), "accent", end(4, 0.1)); // "LinearRegression"
	pq.reveal($("note-lr"), at(4, 2.1), { y: 20 });
	pq.reveal($("note-lr-text"), at(4, 4.2), { y: 10 }); // "from the scikit-learn library"
	tok("fit", at(4, 3.3), "amber", end(4, 0.1)); // ".fit"
	pq.reveal($("note-fit"), at(4, 3.3), { y: 20 });
	tok("l0", at(4, 6.35), "teal", end(4, 0.1)); // "on the logarithms of x and y"
	tok("l1", at(4, 6.35), "teal", end(4, 0.1));
	pq.reveal($("note-log"), at(4, 6.35), { y: 20 });
	tok("lx", at(4, 7.35), "teal", end(4, 0.1));
	tok("ly", at(4, 7.7), "teal", end(4, 0.1));
	fadeOut($("ns-4"), end(4, 0.1));

	// =====================================================================
	// beat 5: a second model on the raw numbers, as a baseline
	// =====================================================================
	hl("f6", at(5, 0.0), end(5, 0.1)); // "A second model is fitted"
	tok("raw", at(5, 1.85), "accent", end(5, 0.1)); // "on the raw numbers"
	pq.reveal($("note-raw"), at(5, 2.8), { y: 20 }); // "without logarithms ... baseline"
	fadeOut($("ns-5"), end(5, 0.1));

	// =====================================================================
	// beat 6: predict gives the logarithm of the period, 10 ** turns it back into years
	// =====================================================================
	hl("f8", at(6, 0.0)); // "Predict gives the logarithm of the period"
	tok("pred", at(6, 0.1), "accent");
	pq.reveal($("note-pred"), at(6, 0.9), { y: 20 });
	tok("pow", at(6, 3.15), "amber"); // "So ten to that power turns it back into years"
	pq.reveal($("note-pow"), at(6, 3.2), { y: 20 });
});
