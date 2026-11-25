window.PQ.scene("ml", (tl, pq) => {
	const hide = (target) => tl.set(target, { opacity: 0 }, 0);
	const fromTo = (target, time, from, to) =>
		tl.fromTo(target, from, { ...to, immediateRender: false }, time);
	// Cross-fade two overlapping labels: the old one out, then the new one in.
	const swap = (oldEl, newEl, time) => {
		hide(newEl);
		tl.to(oldEl, { opacity: 0, duration: 0.25, ease: "power1.in" }, time);
		tl.to(newEl, { opacity: 1, duration: 0.3, ease: "power1.out" }, time + 0.22);
	};

	// ---- beat 1: normal programming. "a person writes the rule. Input goes in, the rule runs, output comes out." ----
	pq.reveal("#ml-head-a", pq.at("ml-1", 0.1), { y: 16 });
	pq.reveal("#ml-rule", pq.at("ml-1", 1.3), { y: 28 });
	pq.reveal("#ml-comp", pq.at("ml-1", 2.9), { y: 24 });
	pq.reveal("#ml-lab-in", pq.at("ml-1", 3.2), { y: 10 });
	pq.reveal("#ml-input", pq.at("ml-1", 3.3), { y: 28 });
	pq.reveal("#ml-lab-out", pq.at("ml-1", 5.2), { y: 10 });
	pq.reveal("#ml-arr-out", pq.at("ml-1", 5.2), { y: 0, x: -24, duration: 0.45 });
	pq.reveal("#ml-output", pq.at("ml-1", 5.5), { y: 28 });
	pq.reveal("#ml-arr-in", pq.at("ml-1", 3.8), { y: 0, x: -24, duration: 0.45 });

	// ---- beat 2: machine learning. The rule moves from the input side to the output side. ----
	// "In machine learning we turn that around."
	pq.dismiss("#ml-head-a", pq.at("ml-2", 0), { duration: 0.3 });
	pq.reveal("#ml-head-b", pq.at("ml-2", 0.3), { y: 16 });
	pq.dismiss("#ml-input", pq.at("ml-2", 0.1));
	pq.dismiss("#ml-output", pq.at("ml-2", 0.1));
	pq.dismiss("#ml-arr-in", pq.at("ml-2", 0.1));
	// The rule swoops under the Computer, then up into the output slot, so it never crosses another box.
	fromTo("#ml-rule", pq.at("ml-2", 0.7), { x: 0 }, { x: 1176, duration: 1.8, ease: "power2.inOut" });
	fromTo("#ml-rule", pq.at("ml-2", 0.7), { y: 0 }, { y: 130, duration: 0.4, ease: "power2.out" });
	fromTo("#ml-rule", pq.at("ml-2", 2.1), { y: 130 }, { y: -125, duration: 0.4, ease: "power2.inOut" });
	tl.to("#ml-arr-out", { opacity: 0, duration: 0.25, ease: "power1.in" }, pq.at("ml-2", 0.1));
	tl.to("#ml-arr-out", { opacity: 1, duration: 0.4, ease: "power1.out" }, pq.at("ml-2", 2.6));
	swap(".ml__sub-a", ".ml__sub-q", pq.at("ml-2", 0.7));
	fromTo("#ml-rule", pq.at("ml-2", 1.5), { opacity: 1 }, { opacity: 0.6, duration: 0.6, ease: "power1.inOut" });
	swap(".ml__comp-a", ".ml__comp-b", pq.at("ml-2", 0.7));
	// "We give the computer examples"
	pq.reveal("#ml-examples", pq.at("ml-2", 2.6), { y: 0, x: -50, duration: 0.7 });
	pq.reveal("#ml-arr-ex", pq.at("ml-2", 3.4), { y: 0, x: -24, duration: 0.45 });
	// "inputs together with their correct outputs"
	pq.reveal("#ml-hl-in", pq.at("ml-2", 4.6), { y: 0, duration: 0.4 });
	pq.reveal("#ml-hl-out", pq.at("ml-2", 6.0), { y: 0, duration: 0.4 });
	// "and it finds the rule itself."
	fromTo("#ml-rule", pq.at("ml-2", 7.4), { opacity: 0.6 }, { opacity: 1, duration: 0.5, ease: "power1.out" });
	swap(".ml__sub-q", ".ml__sub-b", pq.at("ml-2", 7.4));

	// ---- beat 3: the two names ----
	// "Finding the rule is called training." / "The finished rule is called a model."
	pq.reveal("#ml-pill-train", pq.at("ml-3", 1.0), { y: -12, scale: 0.7, duration: 0.5 });
	fromTo("#ml-comp", pq.at("ml-3", 1.0), { borderColor: "#9daad0" }, { borderColor: "#7c9cff", duration: 0.5 });
	pq.reveal("#ml-pill-model", pq.at("ml-3", 3.2), { y: -12, scale: 0.7, duration: 0.5 });
	pq.dismiss("#ml-diagram", pq.end("ml-3", 0.15));

	// ---- beat 4: the output is a number -> regression ----
	// "When the output is a number, such as a price, a temperature or a time, the job is called regression."
	pq.reveal("#ml-numcard", pq.at("ml-4", 0.2), { y: 24 });
	pq.reveal("#ml-such", pq.at("ml-4", 1.6), { y: 10 });
	pq.reveal("#ml-chip-1", pq.at("ml-4", 2.1), { y: 30, scale: 0.92 });
	pq.reveal("#ml-chip-2", pq.at("ml-4", 3.0), { y: 30, scale: 0.92 });
	pq.reveal("#ml-chip-3", pq.at("ml-4", 3.8), { y: 30, scale: 0.92 });
	pq.reveal("#ml-down", pq.at("ml-4", 4.4), { y: -16, duration: 0.45 });
	pq.reveal("#ml-regcard", pq.at("ml-4", 4.6), { y: 24 });
	pq.reveal(".ml__reg-word", pq.at("ml-4", 5.2), { y: 14 });
});
