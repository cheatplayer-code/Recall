import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      style={{
        background: "#ffffff",
        paddingTop: "120px",
        paddingBottom: "80px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Rating badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        <span style={{ color: "#F5A623", fontSize: "16px" }}>★★★★★</span>
        <span
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "16px",
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
          fontSize: "80px",
          fontWeight: 300,
          lineHeight: "78.4px",
          letterSpacing: "-1.6px",
          color: "#000000",
          textAlign: "center",
          maxWidth: "740px",
          margin: "0 auto 32px",
        }}
      >
        The workspace that thinks with you.
      </h1>

      {/* Sub-paragraph 1 */}
      <p
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#555555",
          textAlign: "center",
          lineHeight: "26px",
          maxWidth: "520px",
          margin: "0 auto 8px",
        }}
      >
        Think, make, collaborate, and publish. Alongside your own personal AI.
      </p>

      {/* Sub-paragraph 2 */}
      <p
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "18px",
          fontWeight: 400,
          color: "#555555",
          textAlign: "center",
          lineHeight: "26px",
          maxWidth: "520px",
          margin: "0 auto 40px",
        }}
      >
        A living home for all your projects, ideas, memories, files, &amp; meetings.
      </p>

      {/* CTA Button */}
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
        className="hero-cta-btn"
      >
        Try for $0
      </Link>

      {/* ── Floating decorative cards (desktop only, hidden < 1100px) ── */}

      {/* Left: Photo collage */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-20px",
          top: "60px",
        }}
        className="hero-floating-cards"
      >
        {/* Photo 3 (back) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/4qUnQAJJAK1PxcI61JJeP2FyQM.png"
          alt=""
          style={{
            position: "absolute",
            width: "180px",
            border: "4px solid white",
            borderRadius: "4px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            transform: "rotate(8deg)",
            top: "30px",
            left: "30px",
          }}
        />
        {/* Photo 2 (middle) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/UEQLPZ3DXqnE2u4l9xi6Re3KJUA.png"
          alt=""
          style={{
            position: "absolute",
            width: "180px",
            border: "4px solid white",
            borderRadius: "4px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            transform: "rotate(-3deg)",
            top: "15px",
            left: "15px",
          }}
        />
        {/* Photo 1 (front) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/wtiAfgOy1jMohgG7xJaoOaT3UyE.png"
          alt=""
          style={{
            position: "relative",
            width: "180px",
            border: "4px solid white",
            borderRadius: "4px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            transform: "rotate(5deg)",
          }}
        />
      </div>

      {/* Left bottom: PDF document card */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "40px",
          bottom: "100px",
        }}
        className="hero-floating-cards"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/QdN871iP96EN35UHZiKqUb4abPM.png"
          alt=""
          style={{
            width: "160px",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          }}
        />
      </div>

      {/* Right top: Meeting notes UI card */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "0px",
          top: "80px",
        }}
        className="hero-floating-cards"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cES0iJ9BNmZjFFnhIYu4ithkfho.png"
          alt=""
          style={{
            width: "280px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        />
      </div>

      {/* Right bottom: Document card */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "20px",
          top: "340px",
          width: "240px",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #ededed",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          textAlign: "left",
        }}
        className="hero-floating-cards"
      >
        <p
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "#000",
            margin: "0 0 8px",
            lineHeight: "1.3",
          }}
        >
          The cost of lost knowledge
        </p>
        <p
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 400,
            color: "#777",
            margin: "0 0 12px",
            lineHeight: "1.5",
          }}
        >
          Every time an employee leaves, years of institutional knowledge walks out the door with them.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#e8e0f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 600,
              color: "#5c4fed",
              fontFamily: "var(--font-inter), Inter, sans-serif",
            }}
          >
            E
          </div>
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "#444",
            }}
          >
            Emma
          </span>
        </div>
      </div>

      {/* Scoped styles for floating card visibility and CTA hover */}
      <style>{`
        @media (max-width: 1099px) {
          .hero-floating-cards {
            display: none !important;
          }
        }
        .hero-cta-btn:hover {
          opacity: 0.85;
        }
      `}</style>
    </section>
  );
}
