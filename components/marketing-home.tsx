import { useState } from "react"

import './marketing-home.css';

type Screen = "home" | "auth" | "role" | "profile" | "ai-choice" | "provider" | "dashboard" | "parent" | "classroom" | "settings"

type Intent = "school" | "tutor" | "classroom" | "general"

function Icon({
  name,
  size = 20,
}: {
  name: "school" | "spark" | "class" | "arrow" | "check" | "family" | "shield" | "book" | "clock" | "menu" | "close" | "user" | "settings" | "logout" | "upload" | "play"
  size?: number
}) {
  const paths = {
    school: (
      <>
        <path d="m3 10 9-5 9 5-9 5-9-5Z" />
        <path d="M7 13v4c3 2 7 2 10 0v-4M21 10v6" />
      </>
    ),
    spark: (
      <>
        <path d="M12 3c.7 4.5 2.5 6.3 7 7-4.5.7-6.3 2.5-7 7-.7-4.5-2.5-6.3-7-7 4.5-.7 6.3-2.5 7-7Z" />
        <path d="M19 16c.3 2 1.2 2.7 3 3-1.8.3-2.7 1-3 3-.3-2-1.2-2.7-3-3 1.8-.3 2.7-1 3-3Z" />
      </>
    ),
    class: (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 22h8M12 18v4M7 9h4M7 13h8" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    family: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M15 15c3-.3 5 1.5 5 4.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    book: (
      <>
        <path d="M4 5c3-1 6 0 8 2v13c-2-2-5-3-8-2V5Z" />
        <path d="M20 5c-3-1-6 0-8 2v13c2-2 5-3 8-2V5Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c0-4 2.8-6.5 7-6.5s7 2.5 7 6.5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 13.5v-3l-2-.6-.7-1.7 1-1.8-2.1-2.1-1.8 1-1.7-.7L11 3H8l-.6 2-1.7.7-1.8-1-2.1 2.1 1 1.8-.7 1.7-2 .7v3l2 .6.7 1.7-1 1.8 2.1 2.1 1.8-1 1.7.7.6 2h3l.6-2 1.7-.7 1.8 1 2.1-2.1-1-1.8.7-1.7 1.6-.6Z" />
      </>
    ),
    logout: <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />,
    upload: (
      <>
        <path d="M12 16V4m0 0L8 8m4-4 4 4" />
        <path d="M5 14v6h14v-6" />
      </>
    ),
    play: <path d="m9 7 8 5-8 5V7Z" />,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const entries = [
  {
    icon: "school" as const,
    number: "01",
    title: "School Learning",
    copy: "Get guided help with school subjects, understand concepts step by step, practise and review what needs more work.",
    action: "Start School Learning",
    intent: "school" as Intent,
    image: "/images/school-study.svg",
    alt: "Student working through a science lesson at a desk",
  },
  {
    icon: "spark" as const,
    number: "02",
    title: "Personal AI Tutor",
    copy: "Ask questions, read and research, organise notes, build a personal knowledge library and keep learning over time.",
    action: "Open My Learning Space",
    intent: "tutor" as Intent,
    image: "/images/ai-tutor.svg",
    alt: "A personal learning workspace with notes and ideas",
  },
  {
    icon: "class" as const,
    number: "03",
    title: "Interactive Classroom",
    copy: "Turn a topic or your own material into a participatory lesson with explanations, quizzes and interactive activities.",
    action: "Create an Interactive Class",
    intent: "classroom" as Intent,
    image: "/images/interactive-class.svg",
    alt: "Students taking part in an interactive classroom",
  },
]

function Brand() {
  return (
    <button className="brand" onClick={() => (window.location.hash = "")}>
      <span className="brand-mark">
        <i />
        <i />
        <i />
      </span>
      <b>CoastalTutor</b>
    </button>
  )
}

function PublicHeader({
  start,
  signIn,
}: {
  start: (intent?: Intent) => void
  signIn: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <header className="public-header">
      <Brand />
      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
        aria-label="Open navigation"
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
      <nav className={open ? "open" : ""}>
        <a href="#how">How It Works</a>
        <a href="#learning">Learning</a>
        <a href="#families">For Families</a>
        <a href="#plans">Plans</a>
        <button className="sign-in-link" onClick={signIn}>
          Sign In
        </button>
        <button className="button small" onClick={() => start("general")}>
          Get Started
        </button>
      </nav>
    </header>
  )
}

function HeroVisual() {
  return (
    <div
      className="hero-visual"
      aria-label="A connected personal learning space"
    >
      <span className="hero-doodle hero-doodle-one">IDEA</span>
      <span className="hero-doodle hero-doodle-two">A+</span>
      <div className="hero-image-wrap">
        <img
          src="/images/hero-learning.svg"
          alt="A student exploring ideas in a bright digital learning space"
        />
        <span className="image-caption">Curiosity becomes confidence.</span>
      </div>
      <div className="float-note note-one">
        <span>
          <Icon name="spark" size={16} />
        </span>
        <div>
          <small>YOUR AI TUTOR</small>
          <b>Let’s figure it out together</b>
        </div>
      </div>
      <div className="float-note note-two">
        <span>
          <Icon name="check" size={15} />
        </span>
        <div>
          <small>CONCEPT CHECK</small>
          <b>Great progress today</b>
        </div>
      </div>
    </div>
  )
}

export function Home({
  start,
  signIn,
}: {
  start: (intent?: Intent) => void
  signIn: () => void
}) {
  const [faq, setFaq] = useState(0)
  const faqs = [
    [
      "Is this only for K–12 students?",
      "No. The experience prioritises K–12 learners and families, while the personal learning space also supports independent learners.",
    ],
    [
      "Do I need an AI account?",
      "No. Choose Platform AI for a simple setup, or connect a supported provider account if you already have one.",
    ],
    [
      "Can parents manage more than one learner?",
      "Yes. A guardian can create or link multiple learner profiles and view only the progress each learner has authorised.",
    ],
    [
      "What happens when my own API key runs out of credits?",
      "Learning pauses and we show a clear connection notice. You can add credits with your provider, update the key or switch to Platform AI.",
    ],
    [
      "Does every lesson include AI-generated images or videos?",
      "No. Core lessons use text, diagrams and browser-based interactions. Images, voice and video require separately supported media services.",
    ],
    [
      "Can I use the platform on a phone or tablet?",
      "Yes. Core student, family and interactive classroom flows are designed for modern phone, tablet and desktop browsers.",
    ],
    [
      "How is learner data protected?",
      "Learner profiles, guardian relationships and report access are permission-based. Privacy, export and deletion controls are available in account settings.",
    ],
  ]
  return (
    <div className="public-site">
      <PublicHeader start={start} signIn={signIn} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="pill">
              <span />
              AI learning, shaped around you
            </div>
            <h1>
              Learn with confidence.
              <br />
              <em>Explore with curiosity.</em>
            </h1>
            <p>
              One personal learning space for school subjects, independent study
              and interactive lessons — built for learners and families.
            </p>
            <div className="hero-actions">
              <button className="button" onClick={() => start("general")}>
                Start Learning <Icon name="arrow" size={17} />
              </button>
              <a className="text-button" href="#how">
                Explore How It Works <span>↓</span>
              </a>
            </div>
            <div className="trust-line">
              <span>
                <Icon name="check" size={14} />
                Step-by-step guidance
              </span>
              <span>
                <Icon name="check" size={14} />
                Family-friendly setup
              </span>
              <span>
                <Icon name="check" size={14} />
                You control your data
              </span>
            </div>
          </div>
          <HeroVisual />
        </section>

        <section className="entries section" id="learning">
          <div className="section-heading">
            <span className="eyebrow">THREE WAYS TO LEARN</span>
            <h2>One space. Every kind of curiosity.</h2>
            <p>
              Start with what you need today. Your learner profile stays with
              you across your personal learning space.
            </p>
          </div>
          <div className="entry-grid">
            {entries.map((entry) => (
              <article className="entry-card" key={entry.title}>
                <div className="entry-image">
                  <img src={entry.image} alt={entry.alt} />
                  <span>{entry.number}</span>
                </div>
                <div className="entry-top">
                  <span className="entry-icon">
                    <Icon name={entry.icon} size={24} />
                  </span>
                </div>
                <h3>{entry.title}</h3>
                <p>{entry.copy}</p>
                <button onClick={() => start(entry.intent)}>
                  {entry.action} <Icon name="arrow" size={15} />
                </button>
              </article>
            ))}
          </div>
          <p className="shared-note">
            <Icon name="spark" size={15} />
            School Learning and Personal AI Tutor share one learner profile and
            learning space.
          </p>
        </section>

        <section className="how section" id="how">
          <div className="how-intro">
            <span className="eyebrow">A CONTINUOUS LEARNING LOOP</span>
            <h2>From first question to lasting understanding.</h2>
            <p>
              Move naturally from guided learning to exploration, then return to
              review what you’ve learned.
            </p>
            <div className="how-image">
              <img
                src="/images/learning-journey.svg"
                alt="Learners building knowledge together"
              />
              <span>
                <b>Small steps, real momentum</b>
                Learning that grows with every question.
              </span>
            </div>
          </div>
          <ol className="steps">
            {[
              [
                "Create a Learning Profile",
                "Set a few essentials now. Add more preferences whenever you’re ready.",
              ],
              [
                "Learn with Your AI Tutor",
                "Ask, practise and get explanations that build understanding — not just answers.",
              ],
              [
                "Explore an Interactive Class",
                "Turn a topic or source material into a structured, participatory lesson.",
              ],
              [
                "Review and Keep Learning",
                "Revisit recent work and choose what to explore next.",
              ],
            ].map(([title, copy], i) => (
              <li key={title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
          <small className="implementation-note">
            Available saving and sharing may vary by learning mode. We’ll always
            show what is saved before you leave.
          </small>
        </section>

        <section className="families section" id="families">
          <div className="family-art">
            <img
              className="family-image"
              src="/images/family-learning.svg"
              alt="A parent and child learning together at home"
            />
            <div className="report-card">
              <div className="report-head">
                <span>Learning overview</span>
                <b>This week</b>
              </div>
              <h3>Great momentum, Maya</h3>
              <div className="bars">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="report-row">
                <span>
                  <i className="dot lavender" />
                  Concepts explored
                </span>
                <b>12</b>
              </div>
              <div className="report-row">
                <span>
                  <i className="dot mint" />
                  Activities completed
                </span>
                <b>8</b>
              </div>
              <small>
                <Icon name="shield" size={13} />
                Shared with guardian by learner permission
              </small>
            </div>
          </div>
          <div className="family-copy">
            <span className="eyebrow">FOR STUDENTS & FAMILIES</span>
            <h2>Independence for learners. Reassurance for families.</h2>
            <div className="value-list">
              <div>
                <Icon name="spark" />
                <span>
                  <b>Learn at your own pace</b>
                  <small>
                    Ask again, try another explanation and practise without
                    pressure.
                  </small>
                </span>
              </div>
              <div>
                <Icon name="book" />
                <span>
                  <b>Build understanding over time</b>
                  <small>
                    Bring questions, notes and learning material into one
                    personal space.
                  </small>
                </span>
              </div>
              <div>
                <Icon name="family" />
                <span>
                  <b>Support without overstepping</b>
                  <small>
                    Guardians see authorised progress reports — not every
                    private conversation.
                  </small>
                </span>
              </div>
              <div>
                <Icon name="shield" />
                <span>
                  <b>Simple family management</b>
                  <small>
                    Manage learner profiles, household access and AI service
                    choices together.
                  </small>
                </span>
              </div>
            </div>
            <button
              className="text-button dark"
              onClick={() => start("general")}
            >
              Explore family learning <Icon name="arrow" size={15} />
            </button>
          </div>
        </section>

        <section className="ai-section section">
          <div className="section-heading">
            <span className="eyebrow">AI, YOUR WAY</span>
            <h2>Simple setup. Clear choices.</h2>
            <p>
              No model IDs or technical endpoints. Choose the option that fits
              your family.
            </p>
          </div>
          <div className="ai-options">
            <article>
              <span className="option-label">FOR AI ACCOUNT HOLDERS</span>
              <h3>Bring Your Own AI Key</h3>
              <p>
                Connect an account from a supported AI provider. Your provider
                bills AI usage directly to you.
              </p>
              <ul>
                <li>
                  <Icon name="check" />
                  One supported provider and one key
                </li>
                <li>
                  <Icon name="check" />
                  Verified default model selected for you
                </li>
                <li>
                  <Icon name="check" />
                  Used across your personal learning space
                </li>
              </ul>
              <button onClick={() => start("general")}>
                Choose your own key <Icon name="arrow" />
              </button>
            </article>
            <article className="featured">
              <span className="option-label">EASIEST FOR FAMILIES</span>
              <h3>Platform AI</h3>
              <p>
                We provide and manage the AI service. Usage and limits are
                included with the selected membership.
              </p>
              <ul>
                <li>
                  <Icon name="check" />
                  No API account or key required
                </li>
                <li>
                  <Icon name="check" />
                  Ready to learn after signup
                </li>
                <li>
                  <Icon name="check" />
                  Simple, visible usage limits
                </li>
              </ul>
              <button onClick={() => start("general")}>
                Start with Platform AI <Icon name="arrow" />
              </button>
            </article>
          </div>
        </section>

        <section className="plans section" id="plans">
          <div className="section-heading left">
            <span className="eyebrow">MEMBERSHIP OPTIONS</span>
            <h2>Choose how your AI learning is powered.</h2>
            <p>
              Final pricing and usage allowances will be shown before purchase.
            </p>
          </div>
          <div className="plan-grid">
            <article>
              <span>MEMBERSHIP + YOUR KEY</span>
              <h3>Bring Your Own Key</h3>
              <div className="price">
                9.99 $<small>/ month</small>
              </div>
              <p>
                Platform membership with learning tools, profiles and
                interactive classroom access.
              </p>
              <button
                className="button secondary"
                onClick={() => start("general")}
              >
                Get Started
              </button>
            </article>
            <article>
              <span>MEMBERSHIP + PLATFORM AI</span>
              <h3>Platform AI Included</h3>
              <div className="price">
                39.99 $<small>/ month</small>
              </div>
              <p>
                Platform membership plus a clearly defined allowance of managed
                AI usage.
              </p>
              <button className="button" onClick={() => start("general")}>
                Get Started
              </button>
            </article>
          </div>
        </section>

        <section className="faq section">
          <div className="faq-heading">
            <span className="eyebrow">COMMON QUESTIONS</span>
            <h2>A few things you might be wondering.</h2>
            <p>
              Still have a question?{" "}
              <a href="mailto:hello@example.com">Contact our team</a>.
            </p>
          </div>
          <div className="accordion">
            {faqs.map(([q, a], i) => (
              <div className={`faq-item ${faq === i ? "open" : ""}`} key={q}>
                <button onClick={() => setFaq(faq === i ? -1 : i)}>
                  <span>{q}</span>
                  <b>{faq === i ? "−" : "+"}</b>
                </button>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <div>
          <Brand />
          <p>
            Personal AI learning for students, independent learners and
            families.
          </p>
        </div>
        <div>
          <b>Product</b>
          <a href="#learning">Learning modes</a>
          <a href="#how">How it works</a>
          <a href="#plans">Plans</a>
        </div>
        <div>
          <b>Company</b>
          <a href="#families">For families</a>
          <a href="mailto:hello@example.com">Contact</a>
        </div>
        <div>
          <b>Legal</b>
          <button>Terms</button>
          <button>Privacy</button>
          <button>Open-source notices</button>
        </div>
        <small>
          © {new Date().getFullYear()} CoastalTutor. All rights reserved.
        </small>
      </footer>
    </div>
  )
}

