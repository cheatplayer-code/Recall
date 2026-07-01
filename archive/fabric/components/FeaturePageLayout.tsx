import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export interface FeatureSection {
  heading: string
  body: string
  imageBg?: string
}

export interface RelatedFeature {
  label: string
  href: string
}

export interface FeaturePageLayoutProps {
  tagLabel: string
  heroTitle: string
  heroBody: string
  sections: FeatureSection[]
  relatedFeatures?: RelatedFeature[]
  ctaTitle?: string
  ctaBody?: string
}

const CARD_COLORS = [
  "#f0eeff",
  "#e8f5e9",
  "#fff8e1",
  "#e3f2fd",
]

const HEADING_FONT = "Georgia, 'Times New Roman', serif"
const BODY_FONT = "var(--font-inter), Inter, ui-sans-serif, sans-serif"

export function FeaturePageLayout({
  tagLabel,
  heroTitle,
  heroBody,
  sections,
  relatedFeatures,
  ctaTitle = "The workspace that thinks with you. Ready when you are.",
  ctaBody,
}: FeaturePageLayoutProps) {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          paddingTop: "120px",
          paddingBottom: "80px",
          textAlign: "center",
          paddingLeft: "40px",
          paddingRight: "40px",
        }}
      >
        {/* Tag pill */}
        <span
          style={{
            display: "inline-block",
            backgroundColor: "#f0eeff",
            color: "#7c3aed",
            fontFamily: BODY_FONT,
            fontSize: "14px",
            fontWeight: 500,
            padding: "6px 14px",
            borderRadius: "100px",
            marginBottom: "28px",
          }}
        >
          {tagLabel}
        </span>

        {/* H1 */}
        <h1
          style={{
            fontFamily: HEADING_FONT,
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 300,
            color: "#000",
            maxWidth: "800px",
            margin: "0 auto 24px",
            letterSpacing: "-1px",
            lineHeight: 1.1,
          }}
        >
          {heroTitle}
        </h1>

        {/* Body */}
        <p
          style={{
            fontFamily: BODY_FONT,
            fontSize: "18px",
            color: "#555",
            maxWidth: "560px",
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          {heroBody}
        </p>

        {/* CTA */}
        <Link
          href="/signup"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#fff",
            fontFamily: BODY_FONT,
            fontSize: "15px",
            fontWeight: 500,
            padding: "14px 28px",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Try for $0
        </Link>
      </section>

      {/* Feature sections */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 40px",
        }}
      >
        {sections.map((section, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#fafafa",
              borderRadius: "16px",
              padding: "48px 40px",
              marginBottom: "16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Text side */}
            <div>
              <h2
                style={{
                  fontFamily: HEADING_FONT,
                  fontSize: "32px",
                  fontWeight: 300,
                  color: "#000",
                  marginBottom: "16px",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                  margin: "0 0 16px 0",
                }}
              >
                {section.heading}
              </h2>
              <p
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: "16px",
                  color: "#666",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {section.body}
              </p>
            </div>

            {/* Image placeholder */}
            <div
              style={{
                backgroundColor: section.imageBg ?? CARD_COLORS[i % CARD_COLORS.length],
                borderRadius: "12px",
                height: "220px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-hidden="true"
            >
              <span
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: "13px",
                  color: "rgba(0,0,0,0.25)",
                  letterSpacing: "0.5px",
                }}
              >
                {section.heading}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Works seamlessly section */}
      {relatedFeatures && relatedFeatures.length > 0 && (
        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 40px 80px",
          }}
        >
          <h2
            style={{
              fontFamily: HEADING_FONT,
              fontSize: "36px",
              fontWeight: 300,
              color: "#000",
              marginBottom: "32px",
              letterSpacing: "-0.5px",
            }}
          >
            Works seamlessly with
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {relatedFeatures.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  backgroundColor: "#fafafa",
                  border: "1px solid #ededed",
                  borderRadius: "100px",
                  fontFamily: BODY_FONT,
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#19154E",
                  textDecoration: "none",
                }}
              >
                {feature.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA dark section */}
      <section
        style={{
          backgroundColor: "#0a0a0a",
          color: "#fff",
          textAlign: "center",
          padding: "100px 40px",
        }}
      >
        <h2
          style={{
            fontFamily: HEADING_FONT,
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 300,
            color: "#fff",
            maxWidth: "700px",
            margin: "0 auto 16px",
            letterSpacing: "-1px",
            lineHeight: 1.15,
          }}
        >
          {ctaTitle}
        </h2>
        {ctaBody && (
          <p
            style={{
              fontFamily: BODY_FONT,
              fontSize: "18px",
              color: "rgba(255,255,255,0.55)",
              marginBottom: "40px",
            }}
          >
            {ctaBody}
          </p>
        )}
        {!ctaBody && <div style={{ marginBottom: "40px" }} />}
        <Link
          href="/signup"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            color: "#0a0a0a",
            fontFamily: BODY_FONT,
            fontSize: "15px",
            fontWeight: 500,
            padding: "14px 28px",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Try for $0
        </Link>
      </section>

      <Footer />
    </>
  )
}

export default FeaturePageLayout
