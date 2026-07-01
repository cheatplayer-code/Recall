export function AISection() {
  return (
    <section
      style={{
        background: "#0a0a0a",
        padding: "80px 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "52px",
            fontWeight: 300,
            color: "#ffffff",
            marginBottom: "24px",
          }}
        >
          Your personal AI.
        </h2>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            color: "rgba(255,255,255,0.6)",
            lineHeight: "28px",
            marginBottom: "48px",
            maxWidth: "560px",
          }}
        >
          Fabric&apos;s AI knows your entire knowledge base. Ask anything, get answers grounded in your own work.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {[
            { title: "Deep search", body: "Find anything across all your files, notes, and PDFs." },
            { title: "AI assistant", body: "Generate, summarize, and refine — with full context." },
            { title: "Meeting notes", body: "Record and transcribe meetings automatically." },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "16px",
                padding: "32px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#fff",
                  marginBottom: "12px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: "22px",
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AISection
