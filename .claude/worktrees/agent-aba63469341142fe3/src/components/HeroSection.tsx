export function HeroSection() {
  return (
    <section
      style={{
        background: "#ffffff",
        paddingTop: "71px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "80px",
            fontWeight: 300,
            lineHeight: "78.4px",
            letterSpacing: "-1.6px",
            color: "#000",
            marginBottom: "32px",
          }}
        >
          The workspace that
          <br />
          thinks with you.
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#666",
            marginBottom: "40px",
          }}
        >
          Think, make, collaborate, and publish. Alongside your own personal AI.
        </p>
        <a
          href="/signup"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#fff",
            borderRadius: "8px",
            padding: "14px 28px",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Try for $0
        </a>
      </div>
    </section>
  )
}

export default HeroSection
