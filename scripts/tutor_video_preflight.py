"""Read-only checks inside the Tutor container; never installs tooling or prints credentials."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import shutil
import subprocess


def version(command: str) -> str | None:
    executable = shutil.which(command)
    if not executable:
        return None
    try:
        result = subprocess.run([executable, "--version"], capture_output=True, text=True, timeout=10)
        return result.stdout.strip().splitlines()[0] if result.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        return None


def main() -> None:
    node_version = version("node")
    node_major = int(node_version.lstrip("v").split(".")[0]) if node_version else 0
    report = {
        "node_version": node_version,
        "node_22_or_later": node_major >= 22,
        "npm_version": version("npm"),
        "video_source_present": Path("/app/deeptutor/agents/video_lesson/capability.py").is_file(),
        "edge_narration_dependency": importlib.util.find_spec("edge_tts") is not None,
        "free_disk_mib": shutil.disk_usage(".").free // (1024 * 1024),
        "model_request_sent": False,
        "dependencies_installed_by_check": False,
    }
    try:
        from deeptutor.agents.video_lesson.runtime import runtime_dir, _installed
        directory = runtime_dir()
        report["video_runtime_packages_ready"] = directory.is_dir() and _installed(directory)
    except Exception as error:
        report["video_runtime_packages_ready"] = None
        report["runtime_check_error_type"] = type(error).__name__
    for name in ("memory.max", "memory.current"):
        path = Path("/sys/fs/cgroup") / name
        if path.is_file():
            report[name.replace(".", "_")] = path.read_text().strip()
    print(json.dumps(report, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
