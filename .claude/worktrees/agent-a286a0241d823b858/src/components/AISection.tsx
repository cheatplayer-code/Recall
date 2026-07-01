"use client";

interface AIFeatureItem {
  heading: string;
  body: string;
  image?: string;
  imageFallbackBg: string;
  imageFirst: boolean;
}

const aiItems: AIFeatureItem[] = [
  {
    heading: "An AI collaborator that knows your work",
    body: "Ask your AI anything about your notes, research, and files. It searches, connects, and synthesizes across everything you've saved.",
    image: "/images/MY6eadrZvyaW2bgOMyLHRcQQ.png",
    imageFallbackBg: "#ede9fe",
    imageFirst: false,
  },
  {
    heading: "Your AI, that lives where your work does.",
    body: "Your AI assistant is available inside every note, canvas, and file — without switching context.",
    image: "/images/cES0iJ9BNmZjFFnhIYu4ithkfho.png",
    imageFallbackBg: "#e8eaff",
    imageFirst: true,
  },
  {
    heading: "It gets better the more you use it.",
    body: "With powerful memory, the more you add to Fabric, the more your assistant can do for you. Your projects, your references, your style.",
    imageFallbackBg: "#f0f0ff",
    imageFirst: false,
  },
  {
    heading: "Email your Fabric AI assistant.",
    body: "Every account gets a personal address. Forward emails to Fabric and your AI automatically adds them to the right project.",
    imageFallbackBg: "#f0fff4",
    imageFirst: true,
  },
  {
    heading: "Choose your AI model.",
    body: "Select from Gemini, GPT, Claude, and more. Switch between models depending on your task.",
    imageFallbackBg: "#fff8f0",
    imageFirst: false,
  },
];

function AIFeatureCard({ item }: { item: AIFeatureItem }) {
  const textSide = (
    <div
      style={{
        padding: "48px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <h3
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "22px",
          fontWeight: 600,
          color: "#000",
          margin: 0,
        }}
      >
        {item.heading}
      </h3>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 400,
          color: "#666",
          lineHeight: "24px",
          margin: 0,
        }}
      >
        {item.body}
      </p>
    </div>
  );

  const imageSide = (
    <div
      className="ai-image-side"
      style={{
        background: item.imageFallbackBg,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.heading}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );

  return (
    <div className="ai-card">
      {item.imageFirst ? (
        <>
          {imageSide}
          {textSide}
        </>
      ) : (
        <>
          {textSide}
          {imageSide}
        </>
      )}
    </div>
  );
}

export function AISection() {
  return (
    <section style={{ padding: "80px 40px" }}>
      <style>{`
        .ai-section-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .ai-card {
          background: #fafafa;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 320px;
        }
        .ai-image-side {
          min-height: 200px;
        }
        @media (max-width: 767px) {
          .ai-card {
            grid-template-columns: 1fr;
          }
          .ai-image-side {
            order: -1;
          }
        }
      `}</style>
      <div className="ai-section-inner">
        <h2
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "52px",
            fontWeight: 300,
            color: "#000",
            marginBottom: "48px",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          Think, with your own personal AI.
        </h2>
        {aiItems.map((item) => (
          <AIFeatureCard key={item.heading} item={item} />
        ))}
      </div>
    </section>
  );
}
