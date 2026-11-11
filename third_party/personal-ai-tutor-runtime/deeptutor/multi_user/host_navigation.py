"""Host launch destinations, with mistake coaching kept on the chat surface."""


def host_learning_destination(mode: str, *, has_handoff: bool = False) -> str:
    if has_handoff:
        if mode != "personal":
            raise ValueError("A tutoring handoff requires personal mode")
        return "/chat"
    return {
        "personal": "/learning",
        "school": "/learning",
        "practice": "/learning/practice",
        "mastery": "/learning/mastery",
        "progress": "/settings/progress",
        "profile": "/settings#learner-profile",
        "guardian": "/settings#guardian",
    }[mode]
