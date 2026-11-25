window.PQ.scene("fourt", (tl, pq) => {
	const at = (n, o = 0) => pq.at("fourt-" + n, o);
	const fade = (target, time, duration = 0.35) => {
		tl.set(target, { opacity: 0 }, 0);
		tl.to(target, { opacity: 1, duration, ease: "power1.out" }, time);
	};
	const VIOLET_TINT = "rgba(183, 148, 255, 0.3)";
	const mark = (id, time) => tl.to("#fourt-m-" + id, { backgroundColor: VIOLET_TINT, duration: 0.4 }, time);
	// light one T: the row comes up to full strength, its gloss and quote appear
	const light = (key, time) => {
		tl.to("#fourt-row-" + key, { opacity: 1, duration: 0.4, ease: "power1.out" }, time);
		fade("#fourt-g-" + key, time + 0.3);
		fade("#fourt-q-" + key, time + 0.1, 0.5);
	};
	const settle = (key, time) => tl.to("#fourt-row-" + key, { opacity: 0.45, duration: 0.5 }, time);

	// ---------- beat 1: the sheet with its four labels, Traits first ----------
	pq.reveal("#fourt-sheet", at(1, 0.3), { y: 20 });
	light("traits", at(1, 2.5));
	mark("traits-1", at(1, 4.9));
	mark("traits-2", at(1, 6.4));

	// ---------- beat 2: Task ----------
	settle("traits", at(2, 0.1));
	light("task", at(2, 0.1));
	mark("task-1", at(2, 1.8));
	mark("task-2", at(2, 2.6));

	// ---------- beat 3: Tone, then Target ----------
	settle("task", at(3, 0.1));
	light("tone", at(3, 0.1));
	mark("tone-1", at(3, 0.7));
	settle("tone", at(3, 2.6));
	light("target", at(3, 2.6));
	mark("target-1", at(3, 3.4));
	mark("target-2", at(3, 5.5));

	// ---------- beat 4: one small word changes the answer ----------
	pq.dismiss("#fourt-sheet", at(4, 0.0));
	pq.reveal("#fourt-before", at(4, 0.5), { y: 20 });
	tl.set("#fourt-after", { opacity: 0 }, 0);
	tl.to("#fourt-after", { opacity: 0.35, duration: 0.5, ease: "power1.out" }, at(4, 0.9));
	fade("#fourt-persona-bad", at(4, 3.3));
	fade("#fourt-ans-bad", at(4, 4.3));
	pq.reveal("#fourt-extra", at(4, 5.3), { x: 0, y: 14 });
	pq.dim("#fourt-before", at(4, 7.3), 0.4);
	tl.to("#fourt-after", { opacity: 1, duration: 0.5, ease: "power1.out" }, at(4, 7.3));
	fade("#fourt-persona-good", at(4, 8.0));
	fade("#fourt-ans-good", at(4, 8.5));
	pq.reveal("#fourt-check", at(4, 9.0), { y: 0, scale: 0.5 });
});
