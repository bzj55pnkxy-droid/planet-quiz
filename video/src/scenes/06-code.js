window.PQ.scene("code", (tl, pq) => {
	const at = (n, o = 0) => pq.at("code-" + n, o);
	const fade = (target, time, duration = 0.35) => {
		tl.set(target, { opacity: 0 }, 0);
		tl.to(target, { opacity: 1, duration, ease: "power1.out" }, time);
	};
	const up = (id, time) => pq.reveal("#code-" + id, time, { y: 20 });
	const arrow = (id, time) => pq.reveal("#code-" + id, time, { x: -16, y: 0 });

	// the dashed frame is the app/ folder
	fade("#code-frame", at(1, -0.6), 0.6);

	// ---------- beat 1: ingest.py -> Chroma store -> rag.py ----------
	up("ingest", at(1, 3.3));
	fade("#code-ingest-job", at(1, 4.4));
	up("store", at(1, 5.0));
	arrow("a-ing", at(1, 5.0));
	fade("#code-store-job", at(1, 5.5));
	up("rag", at(1, 5.7));
	arrow("a-chr", at(1, 6.0));
	fade("#code-rag-job", at(1, 6.7));
	tl.to("#code-rag-model", { color: "#b794ff", fontWeight: 700, duration: 0.4 }, at(1, 7.6));

	// ---------- beat 2: prompts.py, main.py, index.html ----------
	up("prompts", at(2, 0.1));
	arrow("a-pr", at(2, 0.9));
	fade("#code-prompts-job", at(2, 1.0));
	up("main", at(2, 2.4));
	arrow("a-main", at(2, 3.0));
	fade("#code-main-job", at(2, 3.7));
	up("index", at(2, 4.8));
	arrow("a-idx", at(2, 5.4));
	fade("#code-index-job", at(2, 6.7));

	// ---------- beat 3: LangChain parts hang under the file that uses them ----------
	pq.dim("#code-index, #code-main, #code-a-idx, #code-a-main", at(3, 0.2), 0.3);
	pq.dim("#code-ingest, #code-store, #code-rag, #code-prompts, #code-a-ing, #code-a-chr, #code-a-pr", at(3, 0.2), 0.5);
	up("lc", at(3, 2.8));
	fade("#code-lcsub", at(3, 3.8));
	const light = (card, time) => tl.to("#code-" + card, { opacity: 1, duration: 0.4 }, time);
	pq.reveal("#code-t-loader", at(3, 5.3), { y: 14 });
	light("ingest", at(3, 5.3));
	pq.reveal("#code-t-splitter", at(3, 6.7), { y: 14 });
	pq.reveal("#code-t-embed", at(3, 7.9), { y: 14 });
	light("rag", at(3, 7.9));
	pq.reveal("#code-t-chat", at(3, 8.8), { y: 14 });
	pq.reveal("#code-t-template", at(3, 9.4), { y: 14 });
	light("prompts", at(3, 9.4));
	pq.reveal("#code-t-chroma", at(3, 10.2), { y: 14 });
	light("store", at(3, 10.2));
});
