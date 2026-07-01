import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

// ─── Small helpers ───────────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="#F5A623"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.1 4.4 12l.7-4L2.2 5.2l4-.6L8 1z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: "2px" }}
    >
      <circle cx="9" cy="9" r="9" fill="#16a34a" fillOpacity="0.12" />
      <path
        d="M5.5 9l2.5 2.5 4.5-4.5"
        stroke="#16a34a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: "2px" }}
    >
      <circle cx="9" cy="9" r="9" fill="#dc2626" fillOpacity="0.10" />
      <path
        d="M6 6l6 6M12 6l-6 6"
        stroke="#dc2626"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Reusable section wrapper ────────────────────────────────────────────────

function SectionWrapper({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "80px 40px",
        ...style,
      }}
    >
      {children}
    </section>
  )
}

// ─── Feature card ────────────────────────────────────────────────────────────

interface FeatureCardProps {
  title: string
  body: string
  accent?: string
}

function FeatureCard({ title, body, accent }: FeatureCardProps) {
  return (
    <div
      style={{
        background: "#fafafa",
        borderRadius: "16px",
        padding: "48px 40px",
        marginBottom: "16px",
        border: "1px solid #f0f0f0",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-gt-alpina), Georgia, serif",
          fontSize: "28px",
          fontWeight: 300,
          color: "#000",
          margin: "0 0 12px",
          lineHeight: "1.25",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 400,
          color: "#555",
          lineHeight: "1.6",
          margin: "0 0 16px",
          maxWidth: "560px",
        }}
      >
        {body}
      </p>
      {accent && (
        <a
          href="/signup"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            color: "#19154E",
            textDecoration: "none",
          }}
        >
          {accent} &rarr;
        </a>
      )}
    </div>
  )
}

// ─── Section heading + "Replaces" badge ──────────────────────────────────────

interface SectionHeadingProps {
  heading: string
  replaces?: string
}

function SectionHeading({ heading, replaces }: SectionHeadingProps) {
  return (
    <div style={{ marginBottom: "40px" }}>
      {replaces && (
        <p
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            color: "#888",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Replaces: {replaces}
        </p>
      )}
      <h2
        style={{
          fontFamily: "var(--font-gt-alpina), Georgia, serif",
          fontSize: "48px",
          fontWeight: 300,
          color: "#000",
          lineHeight: "1.1",
          letterSpacing: "-0.5px",
          margin: 0,
          maxWidth: "700px",
        }}
      >
        {heading}
      </h2>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  return (
    <main>
      <Navbar />

      {/* ── 1. Hero ── */}
      <section
        style={{
          background: "#ffffff",
          paddingTop: "140px",
          paddingBottom: "80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Rating badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "24px",
          }}
        >
          <span style={{ display: "flex", gap: "2px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon key={i} />
            ))}
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              color: "#000",
            }}
          >
            4.7
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#666",
            }}
          >
            2.8K+ app ratings
          </span>
        </div>

        {/* H1 */}
        <h1
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "72px",
            fontWeight: 300,
            lineHeight: "1.05",
            letterSpacing: "-1.5px",
            color: "#000000",
            maxWidth: "760px",
            margin: "0 auto 28px",
          }}
        >
          Your company&apos;s knowledge on autopilot.
        </h1>

        {/* Sub 1 */}
        <p
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#555",
            lineHeight: "1.6",
            maxWidth: "540px",
            margin: "0 auto 8px",
          }}
        >
          A self-organizing brain for your whole team. All meetings, docs,
          files, and tasks. Captured, organized, and searchable automatically.
        </p>

        {/* Sub 2 */}
        <p
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "18px",
            fontWeight: 500,
            color: "#000",
            lineHeight: "1.6",
            margin: "0 auto 40px",
          }}
        >
          Save hours every week.
        </p>

        {/* CTA */}
        <Link
          href="/signup"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "14px 28px",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "opacity 0.15s ease",
          }}
          className="teams-cta-btn"
        >
          Try Fabric for teams
        </Link>

        <style>{`
          .teams-cta-btn:hover { opacity: 0.85; }
        `}</style>
      </section>

      {/* ── 2. Problem / Solution split ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 40px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
          className="problem-solution-grid"
        >
          {/* Problem */}
          <div
            style={{
              background: "#fff5f5",
              borderRadius: "20px",
              padding: "48px 40px",
              border: "1px solid #fde8e8",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#dc2626",
                marginBottom: "16px",
              }}
            >
              The Problem
            </p>
            <h2
              style={{
                fontFamily: "var(--font-gt-alpina), Georgia, serif",
                fontSize: "28px",
                fontWeight: 300,
                color: "#000",
                lineHeight: "1.25",
                margin: "0 0 28px",
              }}
            >
              Scattered information &amp; constant interruptions
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {[
                "Knowledge scattered across tools",
                "Searching through Slack/email/docs wastes time",
                "Context lost between meetings, projects, people",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "15px",
                    color: "#333",
                    lineHeight: "1.5",
                  }}
                >
                  <XIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div
            style={{
              background: "#f0fff4",
              borderRadius: "20px",
              padding: "48px 40px",
              border: "1px solid #d1fae5",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#16a34a",
                marginBottom: "16px",
              }}
            >
              The Solution
            </p>
            <h2
              style={{
                fontFamily: "var(--font-gt-alpina), Georgia, serif",
                fontSize: "28px",
                fontWeight: 300,
                color: "#000",
                lineHeight: "1.25",
                margin: "0 0 28px",
              }}
            >
              A unified data layer for your entire organization
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {[
                "Capture everything automatically",
                "AI organizes and connects it all",
                "Search and retrieve instantly",
                "Agents work in the background",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "15px",
                    color: "#333",
                    lineHeight: "1.5",
                  }}
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <style>{`
          @media (max-width: 720px) {
            .problem-solution-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ── 3. Everything in one place ── */}
      <SectionWrapper>
        <SectionHeading
          heading="Everything in one place."
          replaces="Dropbox, Google Drive"
        />
        <FeatureCard
          title="Documents, tasks, files, links, together at last."
          body="Stop juggling tools. Everything your team creates, shares, or references lives in one workspace."
        />
        <FeatureCard
          title="All your clouds and devices, synced and backed up."
          body="Connect Dropbox, Google Drive, OneDrive and more. Fabric syncs and indexes everything automatically."
        />
        <FeatureCard
          title="Connect the tools you already use."
          body="Native integrations with the apps your team depends on. Everything flows into Fabric automatically."
        />
      </SectionWrapper>

      {/* ── 4. Living memory ── */}
      <section
        style={{
          background: "#f7f7f7",
          borderTop: "1px solid #ebebeb",
          borderBottom: "1px solid #ebebeb",
        }}
      >
        <SectionWrapper>
          <SectionHeading
            heading="A living memory of your company"
            replaces="Notion, Confluence"
          />
          <FeatureCard
            title="A history of decisions, actions & reasoning."
            body="Every meeting, decision, and action item is captured and stored — searchable forever."
          />
          <FeatureCard
            title="Knowledge that compounds over time."
            body="As your team works, Fabric builds a growing knowledge base that gets smarter with every interaction."
          />
          <FeatureCard
            title="Context that follows you."
            body="When you open a project, Fabric surfaces everything relevant — past decisions, related files, open tasks."
          />
        </SectionWrapper>
      </section>

      {/* ── 5. Where the work happens ── */}
      <SectionWrapper>
        <SectionHeading
          heading="Where the work happens. Alongside AI."
          replaces="Notion, ChatGPT"
        />
        <FeatureCard
          title="An AI collaborator that works beside you."
          body="Ask Fabric AI anything about your company's knowledge. It searches, summarizes, and synthesizes instantly."
        />
        <FeatureCard
          title="Delegate work, not just queries."
          body="Create AI agents that monitor projects, draft updates, and surface insights — without you asking."
        />
        <FeatureCard
          title="One subscription. All the best AI models."
          body="Gemini, GPT, Claude, and more — always the latest models, included in your plan."
        />
      </SectionWrapper>

      {/* ── 6. Meetings ── */}
      <section
        style={{
          background: "#f7f7f7",
          borderTop: "1px solid #ebebeb",
          borderBottom: "1px solid #ebebeb",
        }}
      >
        <SectionWrapper>
          <SectionHeading heading="Your meetings, automatically documented." />
          <div
            style={{
              background: "#fafafa",
              borderRadius: "16px",
              padding: "48px 40px",
              border: "1px solid #f0f0f0",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 400,
                color: "#444",
                lineHeight: "1.7",
                margin: "0 0 36px",
                maxWidth: "640px",
              }}
            >
              Stay focused on the conversation. Fabric joins, transcribes, and
              summarizes every meeting — then organizes the notes in the right
              project.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {[
                "Real-time transcription.",
                "Automatic summaries.",
                "Action items extracted.",
                "Synced to your workspace.",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontFamily: "var(--font-gt-alpina), Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 300,
                    color: "#000",
                    lineHeight: "1.3",
                  }}
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </SectionWrapper>
      </section>

      {/* ── 7. Final CTA ── */}
      <section
        style={{
          background: "#0a0a0a",
          padding: "100px 40px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "56px",
            fontWeight: 300,
            color: "#ffffff",
            lineHeight: "1.1",
            letterSpacing: "-0.5px",
            margin: "0 auto 20px",
            maxWidth: "600px",
          }}
        >
          Give your team a brain.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "17px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            marginBottom: "40px",
          }}
        >
          Start for free. No credit card required.
        </p>
        <Link
          href="/signup"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            color: "#0a0a0a",
            borderRadius: "8px",
            padding: "14px 28px",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "opacity 0.15s ease",
          }}
          className="teams-footer-cta-btn"
        >
          Try Fabric for teams
        </Link>

        <style>{`
          .teams-footer-cta-btn:hover { opacity: 0.85; }
        `}</style>
      </section>

      <Footer />
    </main>
  )
}
