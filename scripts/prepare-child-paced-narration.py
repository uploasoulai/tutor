"""Explicit operator recording of the approved revised Grade-2 lesson. No learner data.
Eleven short clips maximum; successful/ambiguous requests never auto-resubmit.
Existing illustration, opener and welcome are reused. Run with --record.
"""
import argparse
import base64
import hashlib
import json
import math
from pathlib import Path
import urllib.request
import urllib.error

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "data/child-paced-v5"
MODEL = "FunAudioLLM/CosyVoice2-0.5B"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", action="store_true")
    record = parser.parse_args().record
    from mutagen.mp3 import MP3
    values = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8-sig").splitlines():
        key, sep, value = line.partition("=")
        if sep:
            values[key.strip()] = value.strip().strip('"').strip("'")
    headers = {"Authorization": "Bearer " + values["SILICONFLOW_API_KEY"], "Content-Type": "application/json"}
    story = json.loads((ROOT / "lib/curriculum/multiplication-storyboard.json").read_text(encoding="utf-8"))
    WORK.mkdir(exist_ok=True)
    state_path = WORK / "recording.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
    if record:
        with urllib.request.urlopen(urllib.request.Request("https://api.siliconflow.cn/v1/models", headers=headers), timeout=30) as response:
            assert MODEL in [item["id"] for item in json.load(response)["data"]], "Configured speech model is unavailable"
    voice, companions = {}, {}
    for shot in [shot for chapter in story["chapters"] for shot in chapter["shots"]]:
        entries = [(shot["id"], shot["text"], "diana", False)]
        friend = shot["pause"].get("friend")
        if friend:
            entries.append((shot["id"] + "-friend", friend["text"], "david" if friend["name"] == "小宇" else "claire", True))
        for clip_id, text, preset, is_friend in entries:
            instruction = "用亲切活泼的语气，像和二年级小朋友面对面聊天。短句说清楚，不要赶。<|endofprompt|>"
            payload = {"model": MODEL, "voice": MODEL + ":" + preset, "input": instruction + text,
                       "response_format": "mp3", "sample_rate": 44100, "speed": 0.9}
            digest = hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
            target = WORK / (digest + ".mp3")
            was_cached = digest in state
            if digest not in state:
                if not record:
                    raise RuntimeError("Recording missing; explicit --record required")
                state[digest] = {"id": clip_id, "status": "submitting", "model": MODEL, "preset": preset}
                state_path.write_text(json.dumps(state, indent=2))
                try:
                    request = urllib.request.Request("https://api.siliconflow.cn/v1/audio/speech", data=json.dumps(payload).encode(), headers=headers)
                    with urllib.request.urlopen(request, timeout=120) as response:
                        audio = response.read()
                    target.write_bytes(audio)
                    state[digest].update(status="saved", seconds=MP3(target).info.length, bytes=len(audio))
                except Exception as error:
                    state[digest].update(status="failed-or-unknown", error=type(error).__name__)
                    state_path.write_text(json.dumps(state, indent=2))
                    raise RuntimeError("Speech request failed; no automatic paid resubmission") from None
                state_path.write_text(json.dumps(state, indent=2))
            if state[digest]["status"] != "saved":
                raise RuntimeError("Unresolved prior request: " + clip_id)
            seconds = MP3(target).info.length
            clip = {"text": text, "frames": math.ceil(seconds * 30), "captions": [],
                    "src": "data:audio/mpeg;base64," + base64.b64encode(target.read_bytes()).decode()}
            (companions if is_friend else voice)[shot["id"]] = clip
            print(json.dumps({"clip": clip_id, "seconds": round(seconds, 2), "cached": was_cached}), flush=True)
    output = ROOT / "data/narrated-multiplication-siliconflow"
    (output / "voice.ts").write_text("export const VOICE = " + json.dumps(voice, ensure_ascii=False) + ";\n", encoding="utf-8")
    (output / "companion-audio.json").write_text(json.dumps(companions, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
