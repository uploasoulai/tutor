"""Operator-only, bounded SiliconFlow preparation for the approved Grade-2 demo.

Run with data/narration-tooling/Scripts/python.exe and --generate or --poll-video.
No learner data. Never called by the application. Successful calls are cached;
ambiguous/failed submissions are not automatically retried or billed again.
"""
import argparse
import base64
import hashlib
import json
import math
import subprocess
from pathlib import Path
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "data/investor-lesson"
PUBLIC = ROOT / "public/lessons/multiplication-demo-v3"
STORY = ROOT / "lib/curriculum/multiplication-storyboard.json"
SPEECH = "FunAudioLLM/CosyVoice2-0.5B"
IMAGE = "Qwen/Qwen-Image"
VIDEO = "MiniMaxAI/MiniMax-H3"
WELCOME = "小小数学家，你好呀！欢迎来到海边数学乐园。今天，我们要帮小伙伴整理探险圆片。先看一看，再摆一摆，最后说说你的发现。准备好了吗？我们一起出发！"
IMAGE_PROMPT = "A premium children's educational picture book illustration, welcoming coastal discovery classroom, soft sculpted 3D clay animation style, turquoise and warm butter yellow palette, a friendly small original sea otter explorer with a teal backpack waves beside a round wooden table, a sunny ocean bay through arched windows, little leafy plants, beautiful soft cinematic light, tactile materials, inviting imaginative environment for seven year old children, clean spacious composition, no writing, no letters, no numbers, no arithmetic, no logos, no worksheets. Wide 16:9 landscape."
VIDEO_PROMPT = "A premium 3D clay animated children's educational opening, 16:9. A sunny magical coastal discovery classroom in turquoise, butter yellow and coral. An adorable original little sea otter explorer wearing a teal backpack walks into the cozy room, turns toward camera, smiles and waves, inviting children to a math adventure. Ocean sparkling through arched windows, soft sunlight and tiny floating sparkles. Slow gentle camera dolly forward, smooth coherent character movement, warm welcoming expression, high quality cinematic animation, no text, no letters, no numerals, no equations. One continuous shot."


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--generate", action="store_true")
    parser.add_argument("--poll-video", action="store_true")
    args = parser.parse_args()
    if not (args.generate or args.poll_video):
        parser.error("Explicit generation or status retrieval required")
    WORK.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    state_path = WORK / "state.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
    values = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8-sig").splitlines():
        key, sep, value = line.partition("=")
        if sep:
            values[key.strip()] = value.strip().strip('"').strip("'")
    key = values["SILICONFLOW_API_KEY"]

    def save():
        state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    def api(endpoint, payload, binary=False):
        req = urllib.request.Request("https://api.siliconflow.cn/v1/" + endpoint,
            data=json.dumps(payload).encode(), headers={"Authorization": "Bearer " + key,
            "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                return response.read() if binary else json.load(response)
        except urllib.error.HTTPError as error:
            # Status only: raw provider payload/URLs/headers never enter logs.
            raise RuntimeError("Provider HTTP " + str(error.code)) from None

    def download(url, target):
        if not url.startswith("https://"):
            raise RuntimeError("Expected secure provider asset")
        with urllib.request.urlopen(url, timeout=120) as response:
            body = response.read(80 * 1024 * 1024 + 1)
        if len(body) > 80 * 1024 * 1024:
            raise RuntimeError("Demo asset exceeds publication limit")
        target.write_bytes(body)

    if args.generate:
        # Persist before submitting: a timeout cannot silently resubmit a paid job.
        if "video" not in state:
            state["video"] = {"status": "submitting", "model": VIDEO}
            save()
            try:
                result = api("video/submit", {"model": VIDEO, "prompt": VIDEO_PROMPT,
                    "duration": 5, "resolution": "768p", "ratio": "16:9"})
                state["video"].update(status="submitted", requestId=result["requestId"])
            except Exception as error:
                state["video"]["status"] = "failed-or-unknown"
                state["video"]["error"] = type(error).__name__
                print("video submission failed; no automatic resubmission", flush=True)
            save()
        if "image" not in state:
            state["image"] = {"status": "submitting", "model": IMAGE}
            save()
            try:
                result = api("images/generations", {"model": IMAGE, "prompt": IMAGE_PROMPT,
                    "image_size": "1664x928", "num_inference_steps": 40, "cfg": 4,
                    "seed": 20261113})
                download(result["images"][0]["url"], WORK / "welcome-original.png")
                subprocess.run(["node", "-e", "require('sharp')(process.argv[1]).webp({quality:90}).toFile(process.argv[2])",
                    str(WORK / "welcome-original.png"), str(PUBLIC / "welcome.webp")], cwd=ROOT, check=True)
                state["image"]["status"] = "saved"
                print("welcome image saved", flush=True)
            except Exception as error:
                state["image"].update(status="failed-or-unknown", error=type(error).__name__)
                print("image failed; no automatic resubmission", flush=True)
            save()
        # Recover a downloaded original without another paid image request.
        if (WORK / "welcome-original.png").exists() and (PUBLIC / "welcome.webp").exists():
            state["image"]["status"] = "saved"
            save()
        story = json.loads(STORY.read_text(encoding="utf-8"))
        shots = [shot for chapter in story["chapters"] for shot in chapter["shots"]]
        shots.append({"id": "welcome", "text": WELCOME})
        from mutagen.mp3 import MP3
        voice = {}
        for shot in shots:
            entry = "speech-" + shot["id"]
            target = WORK / (shot["id"] + ".mp3")
            text_hash = hashlib.sha256(shot["text"].encode()).hexdigest()
            if entry not in state:
                state[entry] = {"status": "submitting", "model": SPEECH, "textSha256": text_hash}
                save()
                try:
                    audio = api("audio/speech", {"model": SPEECH, "voice": SPEECH + ":diana",
                        "input": "请用亲切、活泼的小学老师语气，清楚地讲解，留一点思考时间。<|endofprompt|>" + shot["text"],
                        "response_format": "mp3", "sample_rate": 44100, "speed": 0.93}, True)
                    target.write_bytes(audio)
                    seconds = MP3(target).info.length
                    state[entry].update(status="saved", seconds=seconds, bytes=len(audio))
                    print(json.dumps({"clip": shot["id"], "seconds": round(seconds, 2)}), flush=True)
                except Exception as error:
                    state[entry].update(status="failed-or-unknown", error=type(error).__name__)
                    print(entry + " failed; no automatic resubmission", flush=True)
                save()
            if state[entry]["status"] != "saved" or state[entry]["textSha256"] != text_hash:
                raise RuntimeError("Missing/changed narration: " + shot["id"])
            seconds = MP3(target).info.length
            if shot["id"] == "welcome":
                (PUBLIC / "welcome.mp3").write_bytes(target.read_bytes())
            else:
                voice[shot["id"]] = {"src": "data:audio/mpeg;base64," + base64.b64encode(target.read_bytes()).decode(),
                    "frames": math.ceil(seconds * story["fps"]), "text": shot["text"],
                    "captions": [{"at": 0, "text": shot["text"]}]}
        output = ROOT / "data/narrated-multiplication-siliconflow"
        output.mkdir(exist_ok=True)
        (output / "voice.ts").write_text("export const VOICE = " + json.dumps(voice, ensure_ascii=False) + ";", encoding="utf-8")
    if state.get("video", {}).get("requestId") and state["video"].get("status") != "saved":
        result = api("video/status", {"requestId": state["video"]["requestId"]})
        status = result.get("status")
        print("video status: " + str(status), flush=True)
        state["video"]["providerStatus"] = status
        if status == "Succeed":
            download(result["results"]["videos"][0]["url"], PUBLIC / "opening.mp4")
            state["video"]["status"] = "saved"
        save()


if __name__ == "__main__":
    main()
