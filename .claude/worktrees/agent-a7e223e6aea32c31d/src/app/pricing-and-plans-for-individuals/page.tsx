"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type PlanTab = "individual" | "team";
type BillingCycle = "yearly" | "monthly";

const checkIcon = (
  <span style={{ color: "#22c55e", marginRight: 8 }}>✓</span>
);

interface Feature {
  text: string;
  italic?: boolean;
}

interface PricingCardProps {
  title: string;
  tagline: string;
  price: string;
  priceSub: string;
  ctaLabel: string;
  ctaHref: string;
  features: Feature[];
  highlighted?: boolean;
  mostPopular?: boolean;
  billingCycle: BillingCycle;
}

function PricingCard({
  title,
  tagline,
  price,
  priceSub,
  ctaLabel,
  ctaHref,
  features,
  highlighted,
  mostPopular,
}: PricingCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: highlighted ? "2px solid #000" : "1px solid #ededed",
        borderRadius: 16,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {mostPopular && (
        <div>
          <span
            style={{
              display: "inline-block",
              background: "#000",
              color: "#fff",
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 100,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Most popular
          </span>
        </div>
      )}

      <div>
        <h3
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 22,
            fontWeight: 600,
            color: "#000",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: "#666",
            margin: "6px 0 0",
          }}
        >
          {tagline}
        </p>
      </div>

      <div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: "#000",
          }}
        >
          {price}
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "#888",
            marginTop: 4,
          }}
        >
          {priceSub}
        </div>
      </div>

      <a
        href={ctaHref}
        style={{
          display: "block",
          textAlign: "center",
          background: "#0a0a0a",
          color: "#fff",
          borderRadius: 8,
          padding: "12px 20px",
          fontFamily: "Inter, sans-serif",
          fontSize: 15,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        {ctaLabel}
      </a>

      <div style={{ height: 1, background: "#ededed" }} />

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {features.map((f, i) => (
          <li
            key={i}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: f.italic ? "#888" : "#333",
              fontStyle: f.italic ? "italic" : "normal",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            {f.italic ? (
              <span
                style={{
                  marginRight: 8,
                  color: "transparent",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
            ) : (
              <span style={{ flexShrink: 0 }}>{checkIcon}</span>
            )}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const baseFreeCard: Omit<PricingCardProps, "billingCycle"> = {
  title: "Free",
  tagline: "Try Fabric & collaborate with others",
  price: "$0/mo",
  priceSub: "Free forever • No credit card required",
  ctaLabel: "Get started",
  ctaHref: "/signup",
  features: [
    { text: "150 item limit" },
    { text: "25MB file upload limit" },
    { text: "Unlimited collaboration in workspaces shared with you" },
    { text: "Limited AI usage" },
  ],
  highlighted: false,
  mostPopular: false,
};

const baseTeamsCard: Omit<PricingCardProps, "billingCycle"> = {
  title: "Teams",
  tagline: "For organizations",
  price: "$10/mo per seat",
  priceSub: "Billed yearly, minimum 2 seats",
  ctaLabel: "Get started",
  ctaHref: "/signup",
  features: [
    { text: "Everything in Pro, plus:", italic: true },
    { text: "Shared team workspace" },
    { text: "Admin controls" },
    { text: "Priority support" },
    { text: "SSO & advanced security" },
  ],
  highlighted: false,
  mostPopular: false,
};

const individualPlansYearly: PricingCardProps[] = [
  { ...baseFreeCard, billingCycle: "yearly" },
  {
    title: "Plus",
    tagline: "For everyday use",
    price: "$4.67/mo",
    priceSub: "Billed yearly at $56/year",
    ctaLabel: "Get started",
    ctaHref: "/signup",
    features: [
      { text: "Everything in Free, plus:", italic: true },
      { text: "Your own AI agent" },
      { text: "AI meeting notetaker" },
      { text: "Intelligent memory" },
      { text: "Unlimited items" },
      { text: "50GB storage space" },
      { text: "50MB file upload limit" },
      { text: "5x more AI usage" },
      { text: "Audio & video transcription" },
    ],
    highlighted: true,
    mostPopular: true,
    billingCycle: "yearly",
  },
  {
    title: "Pro",
    tagline: "For serious creatives & thinkers",
    price: "$12.50/mo",
    priceSub: "Billed yearly at $150/year",
    ctaLabel: "Get started",
    ctaHref: "/signup",
    features: [
      { text: "Everything in Plus, plus:", italic: true },
      { text: "AI teammates & automations" },
      { text: "Assistant web search" },
      { text: "2TB storage space" },
      { text: "15x more AI usage" },
      { text: "Premium support" },
    ],
    highlighted: false,
    mostPopular: false,
    billingCycle: "yearly",
  },
  { ...baseTeamsCard, billingCycle: "yearly" },
];

const individualPlansMonthly: PricingCardProps[] = [
  { ...baseFreeCard, billingCycle: "monthly" },
  {
    ...individualPlansYearly[1],
    price: "$7/mo",
    priceSub: "Billed monthly",
    billingCycle: "monthly",
  },
  {
    ...individualPlansYearly[2],
    price: "$18/mo",
    priceSub: "Billed monthly",
    billingCycle: "monthly",
  },
  { ...baseTeamsCard, billingCycle: "monthly" },
];

const faqs = [
  {
    q: "Is there a free plan?",
    a: "Yes, Fabric offers a free plan with 150 items and limited AI usage.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes, you can upgrade or downgrade at any time.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, Fabric uses industry-standard encryption.",
  },
];

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<PlanTab>("individual");
  const [billing, setBilling] = useState<BillingCycle>("yearly");

  const plans =
    billing === "yearly" ? individualPlansYearly : individualPlansMonthly;

  return (
    <>
      <Navbar />
      <main style={{ background: "#fff", minHeight: "100vh" }}>
        {/* Hero */}
        <section
          style={{
            paddingTop: 120,
            paddingBottom: 64,
            textAlign: "center",
            background: "#fff",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-gt-alpina), Georgia, serif",
              fontSize: 52,
              fontWeight: 300,
              color: "#000",
              textAlign: "center",
              maxWidth: 700,
              margin: "0 auto 48px",
              lineHeight: 1.15,
            }}
          >
            Unlock productivity superpowers. The AI workspace that thinks with
            you.
          </h1>

          {/* Individual | Team tab switcher */}
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <button
              onClick={() => setActiveTab("individual")}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                padding: "10px 20px",
                borderRadius: 100,
                border:
                  activeTab === "individual"
                    ? "1px solid #000"
                    : "1px solid #ddd",
                background:
                  activeTab === "individual" ? "#000" : "transparent",
                color: activeTab === "individual" ? "#fff" : "#666",
                cursor: "pointer",
              }}
            >
              Individual plans
            </button>
            <button
              onClick={() => setActiveTab("team")}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                padding: "10px 20px",
                borderRadius: 100,
                border:
                  activeTab === "team" ? "1px solid #000" : "1px solid #ddd",
                background: activeTab === "team" ? "#000" : "transparent",
                color: activeTab === "team" ? "#fff" : "#666",
                cursor: "pointer",
              }}
            >
              Team plans
            </button>
          </div>

          {/* Yearly / Monthly billing toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setBilling("yearly")}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                padding: "10px 20px",
                borderRadius: 100,
                border:
                  billing === "yearly" ? "1px solid #000" : "1px solid #ddd",
                background: billing === "yearly" ? "#000" : "transparent",
                color: billing === "yearly" ? "#fff" : "#666",
                cursor: "pointer",
              }}
            >
              Yearly
            </button>
            <button
              onClick={() => setBilling("monthly")}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                padding: "10px 20px",
                borderRadius: 100,
                border:
                  billing === "monthly" ? "1px solid #000" : "1px solid #ddd",
                background: billing === "monthly" ? "#000" : "transparent",
                color: billing === "monthly" ? "#fff" : "#666",
                cursor: "pointer",
              }}
            >
              Monthly
            </button>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "#16a34a",
                background: "#dcfce7",
                padding: "4px 10px",
                borderRadius: 100,
                fontWeight: 500,
              }}
            >
              Get 2 months free on a yearly plan
            </span>
          </div>
        </section>

        {/* Pricing cards */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px 80px",
          }}
        >
          {activeTab === "individual" ? (
            <>
              <div
                className="pricing-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 20,
                }}
              >
                {plans.map((plan) => (
                  <PricingCard key={plan.title} {...plan} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 18,
                  color: "#444",
                  marginBottom: 32,
                }}
              >
                Team plans are designed for organizations. Contact us for
                enterprise pricing.
              </p>
              <div style={{ maxWidth: 360, margin: "0 auto" }}>
                <PricingCard {...baseTeamsCard} billingCycle={billing} />
              </div>
            </div>
          )}
        </section>

        {/* FAQ */}
        <section
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "0 24px 120px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-gt-alpina), Georgia, serif",
              fontSize: 36,
              fontWeight: 300,
              color: "#000",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            FAQs
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  borderTop: "1px solid #ededed",
                  borderBottom:
                    i === faqs.length - 1 ? "1px solid #ededed" : undefined,
                  padding: "24px 0",
                }}
              >
                <h3
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#000",
                    margin: "0 0 10px",
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#555",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Footer />
    </>
  );
}
