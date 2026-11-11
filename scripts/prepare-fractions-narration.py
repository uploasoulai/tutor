"""Operator-only fixed storyboard recording. No learner data, LLM, key, or paid provider.

Uses the pinned native narration module's Edge path, then measures actual MP3 duration.
Run with the isolated data/narration-tooling Python. --record explicitly enables network;
existing matching clips are reused. Ordinary builds/player requests make no voice call.
"""
import argparse
import asyncio
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
LESSON = "multiplication" if "--multiplication" in sys.argv else "fractions"
WORK = ROOT / ("data/narrated-" + LESSON)
STORY = json.loads((ROOT / ("lib/curriculum/" + LESSON + "-storyboard.json")).read_text(encoding="utf-8"))
VOICE = "zh-CN-XiaoxiaoNeural"


async def main(record: bool):
    from mutagen.mp3 import MP3
    source = ROOT / "third_party/personal-ai-tutor-runtime/deeptutor/agents/video_lesson/narration.py"
    spec = importlib.util.spec_from_file_location("coastal_pilot_narration", source)
    native = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = native
    spec.loader.exec_module(native)
    WORK.mkdir(parents=True, exist_ok=True)
    clips, report = {}, []
    for chapter in STORY["chapters"]:
        for shot in chapter["shots"]:
            digest = hashlib.sha256((VOICE + "\n" + shot["text"]).encode()).hexdigest()
            path = WORK / (digest + ".mp3")
            if not path.exists():
                if not record:
                    raise RuntimeError("Missing reviewed narration. Run with --record explicitly.")
                clip = await asyncio.wait_for(native.speak(shot["text"], VOICE), 60)
                if not clip.audio:
                    raise RuntimeError("No narration audio; do not publish a voiced asset.")
                path.write_bytes(clip.audio)
            seconds = MP3(path).info.length
            if not math.isfinite(seconds) or seconds <= 0:
                raise RuntimeError("Invalid recorded duration")
            # One short utterance per shot: its caption and matching visual begin together.
            clips[shot["id"]] = native.Clip(shot["text"], math.ceil(seconds * STORY["fps"]),
                                            [(0, shot["text"])], path.read_bytes())
            report.append({"id": shot["id"], "seconds": seconds, "frames": clips[shot["id"]].frames,
                           "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size})
            print(json.dumps({"clip": shot["id"], "seconds": round(seconds, 3), "bytes": path.stat().st_size}))
    (WORK / "voice.ts").write_text(native.voice_module(clips), encoding="utf-8")
    (WORK / "recording.json").write_text(json.dumps({"voice": VOICE, "clips": report}, indent=2), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", action="store_true")
    parser.add_argument("--multiplication", action="store_true")
    asyncio.run(main(parser.parse_args().record))
