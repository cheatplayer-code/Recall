"use client"

import Link from "next/link"

const footerColumns = [
  {
    header: "For →",
    links: [
      { label: "Researchers", href: "/researchers" },
      { label: "Students", href: "/students" },
      { label: "Designers", href: "/designers" },
      { label: "Writers", href: "/writers" },
      { label: "Consultancies", href: "/consultancies" },
      { label: "Law firms", href: "/law-firms" },
      { label: "Architecture studios", href: "/architecture-studios" },
    ],
  },
  {
    header: "Features →",
    links: [
      { label: "Canvas", href: "/features/canvas" },
      { label: "AI Assistant", href: "/features/ai-assistant" },
      { label: "Notes and docs", href: "/features/notes" },
      { label: "Meeting and voice notes", href: "/features/meetings" },
      { label: "Tasks", href: "/features/tasks" },
      { label: "Deep search", href: "/features/deep-search" },
      { label: "Sync & backup", href: "/features/sync" },
      { label: "Publish", href: "/features/publish" },
      { label: "Email-to-Fabric", href: "/features/email" },
      { label: "Annotations", href: "/features/annotations" },
    ],
  },
  {
    header: "Product",
    links: [
      { label: "Pricing", href: "/pricing-and-plans-for-individuals" },
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
      { label: "Download", href: "/download" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    header: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
]

function FabricLogoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="6" fill="#ffffff" fillOpacity="0.15" />
      <path
        d="M8 14C8 10.686 10.686 8 14 8s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6z"
        fill="white"
        fillRule="evenodd"
      />
      <circle cx="14" cy="14" r="2.5" fill="#0a0a0a" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer
      style={{
        background: "#0a0a0a",
        color: "#ffffff",
        padding: "64px 80px 40px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
          gap: "40px",
          marginBottom: "48px",
        }}
      >
        {/* Column 1: Brand */}
        <div>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              marginBottom: "12px",
            }}
          >
            <FabricLogoIcon />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              Fabric
            </span>
          </Link>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "rgba(255,255,255,0.5)",
              lineHeight: "20px",
              marginTop: "4px",
            }}
          >
            The workspace that thinks with you.
          </p>
        </div>

        {/* Columns 2–5: Link groups */}
        {footerColumns.map((col) => (
          <div key={col.header}>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: "16px",
              }}
            >
              {col.header}
            </p>
            <nav aria-label={col.header}>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    display: "block",
                    marginBottom: "10px",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color = "#ffffff"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.55)"
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
          paddingTop: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          © 2025 Fabric
        </span>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link
            href="/privacy"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
            }}
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
