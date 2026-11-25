// Builds the Planet Quiz explainer videos.
//
//   bun build.ts                 narration audio -> timing -> render -> final MP4 with sound
//   bun build.ts --audio-only    only (re)generate narration and print the timing table
//   bun build.ts --stage-only    assemble the composition into .build/<stage> without rendering
//   bun build.ts --stage=NAME    use .build/NAME as the staging folder (default: video)
//   bun build.ts --scenes=04,05  include only the scene files with these number prefixes
//   bun build.ts --video=NAME    build the second video kept in NAME/ (script.json, scenes/);
//                                without it the RAG video (script.json, src/scenes/) is built
//
// How it fits together:
//   script.json   chapters and beats; each beat is one or two narrated sentences
//   audio/        one WAV per beat (Kokoro, local), cached by a hash of voice + text
//   timing        beat start/end times are computed from the measured audio lengths, so the
//                 pictures always follow the voice, also after the script is edited
//   src/          the Hyperframes composition: index.html, core.js, styles.css and one
//                 html/css/js triple per chapter in src/scenes/
import { createHash } from "node:crypto";
import {
	copyFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

const HERE = import.meta.dir;
const SRC = join(HERE, "src");
const SCRIPT_FIELDS = "voice, speed, beatGap, chapterGap, leadIn, tailOut, output?, chapters";
const RENDERS = join(HERE, "renders");
const OUT_DIR = join(HERE, "../docs/video");
const HYPERFRAMES = join(HERE, "node_modules/.bin/hyperframes");
const GSAP = join(HERE, "node_modules/gsap/dist/gsap.min.js");
const TTS_PYTHON = join(HERE, ".tts-venv/bin/python");
const FPS = 30;

type Beat = { id: string; caption: string; say: string };
type Script = {
	voice: string;
	speed: number;
	beatGap: number;
	chapterGap: number;
	leadIn: number;
	tailOut: number;
	/** File name of the finished video, without extension. */
	output?: string;
	chapters: Array<{ id: string; title: string; beats: Beat[] }>;
};
type Timing = {
	duration: number;
	chapters: Array<{ id: string; title: string; start: number; end: number }>;
	beats: Array<{ id: string; chapter: string; caption: string; start: number; end: number }>;
};

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
// A named video keeps its own script, scenes and audio in a subfolder and shares src/.
const video = option("video");
const BASE = video ? join(HERE, video) : HERE;
const SCENES = video ? join(BASE, "scenes") : join(SRC, "scenes");
const AUDIO = video ? join(HERE, "audio", video) : join(HERE, "audio");
const STAGE = join(HERE, ".build", option("stage") ?? video ?? "video");
const onlyScenes = option("scenes")?.split(",");
const script: Script = JSON.parse(readFileSync(join(BASE, "script.json"), "utf8"));
if (!script.chapters) throw new Error(`script.json needs: ${SCRIPT_FIELDS}`);
const OUTPUT = script.output ?? "planet-quiz-rag-explained";

function run(cmd: string[], quiet = true): string {
	const proc = Bun.spawnSync(cmd, {
		cwd: HERE,
		stdout: quiet ? "pipe" : "inherit",
		stderr: quiet ? "pipe" : "inherit",
		env: {
			...process.env,
			HYPERFRAMES_NO_TELEMETRY: "1",
			DO_NOT_TRACK: "1",
			HYPERFRAMES_PYTHON: TTS_PYTHON,
		},
	});
	if (proc.exitCode !== 0) {
		const detail = quiet ? `\n${proc.stdout?.toString()}\n${proc.stderr?.toString()}` : "";
		throw new Error(`Command failed (${proc.exitCode}): ${cmd.join(" ")}${detail}`);
	}
	return proc.stdout?.toString() ?? "";
}

const seconds = (file: string) =>
	Number(
		run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]),
	);

/** One WAV per beat. A beat is spoken again only when its text or the voice changed. */
function narrate(): Map<string, number> {
	mkdirSync(AUDIO, { recursive: true });
	const manifestFile = join(AUDIO, "manifest.json");
	const manifest: Record<string, string> = existsSync(manifestFile)
		? JSON.parse(readFileSync(manifestFile, "utf8"))
		: {};
	const lengths = new Map<string, number>();
	for (const beat of script.chapters.flatMap((c) => c.beats)) {
		const wav = join(AUDIO, `${beat.id}.wav`);
		const hash = createHash("sha256")
			.update(`${script.voice}|${script.speed}|${beat.say}`)
			.digest("hex")
			.slice(0, 16);
		if (manifest[beat.id] !== hash || !existsSync(wav)) {
			console.log(`  speaking ${beat.id}`);
			run([
				HYPERFRAMES,
				"tts",
				beat.say,
				"--voice",
				script.voice,
				"--speed",
				String(script.speed),
				"--output",
				wav,
			]);
			manifest[beat.id] = hash;
			writeFileSync(manifestFile, `${JSON.stringify(manifest, null, "\t")}\n`);
		}
		lengths.set(beat.id, seconds(wav));
	}
	return lengths;
}

/** Lays the beats end to end with short pauses; the result drives both picture and sound. */
function schedule(lengths: Map<string, number>): Timing {
	const round = (n: number) => Math.round(n * 1000) / 1000;
	const timing: Timing = { duration: 0, chapters: [], beats: [] };
	let t = script.leadIn;
	for (const chapter of script.chapters) {
		const start = timing.chapters.length === 0 ? 0 : round(t - script.chapterGap / 2);
		for (const beat of chapter.beats) {
			const length = lengths.get(beat.id) ?? 0;
			timing.beats.push({
				id: beat.id,
				chapter: chapter.id,
				caption: beat.caption,
				start: round(t),
				end: round(t + length),
			});
			t += length + script.beatGap;
		}
		t += script.chapterGap - script.beatGap;
		timing.chapters.push({ id: chapter.id, title: chapter.title, start, end: 0 });
	}
	const lastEnd = timing.beats.at(-1)?.end ?? 0;
	// Whole number of frames, so the video and the narration track end together.
	timing.duration = Math.ceil((lastEnd + script.tailOut) * FPS) / FPS;
	timing.chapters.forEach((c, i) => {
		c.end = timing.chapters[i + 1]?.start ?? timing.duration;
	});
	return timing;
}

const sceneFiles = (ext: string) =>
	readdirSync(SCENES)
		.filter((f) => f.endsWith(ext) && (!onlyScenes || onlyScenes.includes(f.slice(0, 2))))
		.sort()
		.map((f) => readFileSync(join(SCENES, f), "utf8"));

/** Assembles src/ and the per-chapter scene files into one composition folder. */
function stage(timing: Timing) {
	rmSync(STAGE, { recursive: true, force: true });
	mkdirSync(join(STAGE, "vendor"), { recursive: true });
	cpSync(join(SRC, "assets"), join(STAGE, "assets"), { recursive: true });
	copyFileSync(GSAP, join(STAGE, "vendor/gsap.min.js"));
	writeFileSync(
		join(STAGE, "styles.css"),
		[readFileSync(join(SRC, "styles.css"), "utf8"), ...sceneFiles(".css")].join("\n"),
	);
	// Hyperframes lints and assembles inline scripts, so every script is inlined here.
	// Replacement functions keep "$" in the scripts from being read as a pattern.
	const scripts = [
		`window.TIMING = ${JSON.stringify(timing)};`,
		readFileSync(join(SRC, "core.js"), "utf8"),
		...sceneFiles(".js"),
		"window.PQ.finish();",
	].join("\n");
	const html = readFileSync(join(SRC, "index.html"), "utf8")
		.replace(/data-duration="[\d.]+"/, `data-duration="${timing.duration}"`)
		.replace("<!-- SCENES -->", () => sceneFiles(".html").join("\n"))
		.replace('<script src="./core.js"></script>', () => `<script>\n${scripts}\n</script>`);
	writeFileSync(join(STAGE, "index.html"), html);
}

/** Mixes the beat recordings into one track, each delayed to its start time. */
function mixNarration(timing: Timing, out: string) {
	const inputs = timing.beats.flatMap((b) => ["-i", join(AUDIO, `${b.id}.wav`)]);
	const delays = timing.beats
		.map((b, i) => `[${i}:a]adelay=${Math.round(b.start * 1000)}:all=1[a${i}]`)
		.join(";");
	const mix = `${timing.beats.map((_, i) => `[a${i}]`).join("")}amix=inputs=${timing.beats.length}:normalize=0,apad=whole_dur=${timing.duration},loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
	run([
		"ffmpeg",
		"-hide_banner",
		"-loglevel",
		"error",
		"-y",
		...inputs,
		"-filter_complex",
		`${delays};${mix}`,
		"-map",
		"[out]",
		"-ar",
		"48000",
		"-t",
		String(timing.duration),
		out,
	]);
}

function writeSubtitles(timing: Timing, out: string) {
	const stamp = (t: number) => {
		const ms = Math.round(t * 1000);
		const pad = (n: number, w = 2) => String(n).padStart(w, "0");
		return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
	};
	writeFileSync(
		out,
		timing.beats
			.map((b, i) => `${i + 1}\n${stamp(b.start)} --> ${stamp(b.end)}\n${b.caption}\n`)
			.join("\n"),
	);
}

console.log("Narration");
const timing = schedule(narrate());
for (const c of timing.chapters)
	console.log(`  ${c.start.toFixed(1).padStart(6)} s  ${c.id}`);
console.log(`  total ${timing.duration.toFixed(1)} s (${(timing.duration / 60).toFixed(1)} min)`);
mkdirSync(join(HERE, ".build"), { recursive: true });
writeFileSync(
	join(HERE, ".build", video ? `timing.${video}.json` : "timing.json"),
	`${JSON.stringify(timing, null, "\t")}\n`,
);

if (!flag("audio-only")) {
	stage(timing);
	console.log(`Staged ${STAGE}`);
}

if (!flag("audio-only") && !flag("stage-only")) {
	mkdirSync(RENDERS, { recursive: true });
	mkdirSync(OUT_DIR, { recursive: true });
	const silent = join(RENDERS, `${OUTPUT}.silent.mp4`);
	const narration = join(RENDERS, `${OUTPUT}.wav`);
	const final = join(OUT_DIR, `${OUTPUT}.mp4`);
	console.log("Rendering picture with Hyperframes");
	run([HYPERFRAMES, "render", STAGE, "--output", silent, "--fps", String(FPS), "--strict", "--quiet"], false);
	console.log("Mixing narration");
	mixNarration(timing, narration);
	run([
		"ffmpeg",
		"-hide_banner",
		"-loglevel",
		"error",
		"-y",
		"-i",
		silent,
		"-i",
		narration,
		"-map",
		"0:v",
		"-map",
		"1:a",
		"-c:v",
		"libx264",
		"-preset",
		"slow",
		"-crf",
		"20",
		"-pix_fmt",
		"yuv420p",
		"-c:a",
		"aac",
		"-b:a",
		"160k",
		"-movflags",
		"+faststart",
		"-shortest",
		final,
	]);
	writeSubtitles(timing, join(OUT_DIR, `${OUTPUT}.srt`));
	console.log(`Wrote ${final} (${seconds(final).toFixed(1)} s)`);
}
