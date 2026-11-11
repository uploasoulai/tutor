import unittest
from deeptutor.multi_user.host_navigation import host_learning_destination


class HostLearningNavigationTests(unittest.TestCase):
    def test_ordinary_personal_launch_opens_learning_hub(self):
        self.assertEqual(host_learning_destination("personal"), "/learning")

    def test_mistake_handoff_opens_chat_instead_of_learning_hub(self):
        self.assertEqual(host_learning_destination("personal", has_handoff=True), "/chat")

    def test_handoff_cannot_redirect_into_another_learning_surface(self):
        with self.assertRaises(ValueError):
            host_learning_destination("guardian", has_handoff=True)
