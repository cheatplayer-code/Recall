import Image from "next/image"

function SearchMockup() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        minHeight: "320px",
        height: "100%",
      }}
    >
      {/* Search input */}
      <div
        style={{
          background: "white",
          borderRadius: "100px",
          padding: "12px 20px",
          width: "90%",
          maxWidth: "360px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          fontSize: "14px",
          color: "#333",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ flexShrink: 0, color: "#999" }}
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>memory consolidation challenges</span>
      </div>

      {/* Result card 1 */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "14px 18px",
          width: "90%",
          maxWidth: "360px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            📄
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#111",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Neuroscience Review 2024.pdf
          </span>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "#777",
            margin: 0,
            lineHeight: "16px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <span
            style={{
              background: "rgba(99,102,241,0.15)",
              borderRadius: "2px",
              padding: "0 2px",
            }}
          >
            Memory consolidation challenges
          </span>{" "}
          remain one of the most studied topics in cognitive neuroscience...
        </p>
      </div>

      {/* Result card 2 */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "14px 18px",
          width: "90%",
          maxWidth: "360px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            📑
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#111",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Sleep &amp; Cognition Notes.md
          </span>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "#777",
            margin: 0,
            lineHeight: "16px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          REM sleep plays a critical role in overcoming{" "}
          <span
            style={{
              background: "rgba(99,102,241,0.15)",
              borderRadius: "2px",
              padding: "0 2px",
            }}
          >
            memory consolidation challenges
          </span>
          ...
        </p>
      </div>
    </div>
  )
}

interface SearchFeatureCardProps {
  heading: string
  body: string
  body2: string
  leftSide: React.ReactNode
}

function SearchFeatureCard({
  heading,
  body,
  body2,
  leftSide,
}: SearchFeatureCardProps) {
  return (
    <div
      style={{
        background: "#fafafa",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "16px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "320px",
      }}
    >
      {/* Left: visual side */}
      <div style={{ overflow: "hidden" }}>{leftSide}</div>

      {/* Right: text side */}
      <div
        style={{
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "35px",
            fontWeight: 300,
            color: "#000",
            lineHeight: "37.8px",
            marginBottom: "16px",
          }}
        >
          {heading}
        </h3>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            color: "#666",
            lineHeight: "24px",
            marginBottom: "8px",
          }}
        >
          {body}
        </p>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            color: "#666",
            lineHeight: "24px",
          }}
        >
          {body2}
        </p>
      </div>
    </div>
  )
}

export function SearchSection() {
  return (
    <section style={{ background: "#ffffff", padding: "80px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "52px",
            fontWeight: 300,
            color: "#000",
            marginBottom: "48px",
          }}
        >
          Your personal search engine.
        </h2>

        {/* Card 1: Search inside documents */}
        <SearchFeatureCard
          heading="Search inside documents."
          body="Find the exact page in a PDF, the right slide in a deck, or a specific line in a brief."
          body2="Fabric searches the content, not just the file name."
          leftSide={<SearchMockup />}
        />

        {/* Card 2: Color search */}
        <SearchFeatureCard
          heading="Color search."
          body="Looking for assets that match your brand palette? Search by color and find every image, design, or reference that matches."
          body2="Keep everything on-brand."
          leftSide={
            <div
              style={{
                position: "relative",
                minHeight: "320px",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <Image
                src="/images/SqUNmEz4xPm8sGGyFXitVXkBc.png"
                alt="Color search feature"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          }
        />
      </div>
    </section>
  )
}

export default SearchSection
