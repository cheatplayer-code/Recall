export function DownloadSection() {
  return (
    <section
      style={{
        background: "#fafafa",
        padding: "80px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "52px",
            fontWeight: 300,
            color: "#000",
            marginBottom: "24px",
          }}
        >
          Available everywhere.
        </h2>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            color: "#666",
            marginBottom: "40px",
          }}
        >
          Mac, iOS, and Web. Always in sync.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <a
            href="/download"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#0a0a0a",
              color: "#fff",
              borderRadius: "8px",
              padding: "12px 20px",
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Download for Mac
          </a>
          <a
            href="https://apps.apple.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#0a0a0a",
              color: "#fff",
              borderRadius: "8px",
              padding: "12px 20px",
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Download for iOS
          </a>
        </div>
      </div>
    </section>
  )
}

export default DownloadSection
