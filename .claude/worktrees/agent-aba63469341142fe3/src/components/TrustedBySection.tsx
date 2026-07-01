export function TrustedBySection() {
  const logos = [
    "Harvard",
    "MIT",
    "Stanford",
    "McKinsey",
    "Andreessen Horowitz",
    "Y Combinator",
  ]

  return (
    <section
      style={{
        background: "#ffffff",
        padding: "48px 40px",
        borderTop: "1px solid #ededed",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "32px",
          }}
        >
          Trusted by people from
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "32px 48px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {logos.map((logo) => (
            <span
              key={logo}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 500,
                color: "#bbb",
              }}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustedBySection
