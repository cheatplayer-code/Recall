"use client";

interface FeatureCard {
  image: string;
  imageFallbackBg: string;
  imageFirst: boolean;
  heading: string;
  body: string;
  body2: string;
  link: { text: string; href: string };
}

const cards: FeatureCard[] = [
  {
    image: "/images/MY6eadrZvyaW2bgOMyLHRcQQ.png",
    imageFallbackBg: "#e8e8e8",
    imageFirst: true,
    heading: "An infinite canvas.",
    body: "Draw, moodboard, and think.",
    body2:
      "An infinite space to collect, arrange, and connect your ideas visually.",
    link: { text: "Learn more →", href: "/features/canvas" },
  },
  {
    image: "/images/eEdoc8HfpJ6bhMN4sJHwvggeNVo.png",
    imageFallbackBg: "#f0f0f0",
    imageFirst: false,
    heading: "Write full documents or quick notes.",
    body: "A beautifully minimal text editor that gives your ideas room to grow and flourish.",
    body2: "Effortlessly embed or link to another file, note or anything else.",
    link: { text: "Learn more →", href: "/features/notes-and-docs" },
  },
  {
    image: "/images/v5ede4D1lgnhIqMVHDeijVxvks.png",
    imageFallbackBg: "#e8f0fe",
    imageFirst: true,
    heading: "Create meeting or voice notes.",
    body: "Record, transcribe, and summarize in real time.",
    body2: "Your AI assistant captures every insight so you don't have to.",
    link: { text: "Learn more →", href: "/features/ai-voice-notes" },
  },
  {
    image: "/images/thZhAPhdQTabbADsxTeUORql4.png",
    imageFallbackBg: "#e8e8e8",
    imageFirst: false,
    heading: "Create tasks with reminders.",
    body: "Take action and plan, all in the same place.",
    body2: "Set priority, a due date, reminders, and connect relevant files.",
    link: { text: "Learn more →", href: "/features/tasks-and-reminders" },
  },
  {
    image: "/images/bLX1rGq6mVta0dWZccdND2ps.png",
    imageFallbackBg: "#e8e8e8",
    imageFirst: true,
    heading: "Create a space and gather your ideas.",
    body: "A home for every project.",
    body2:
      "Collect, organize, and reference everything — from files and notes to research and meetings.",
    link: { text: "Learn more →", href: "#" },
  },
];

function FeatureCardItem({ card }: { card: FeatureCard }) {
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
        {card.heading}
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
        {card.body}
      </p>
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
        {card.body2}
      </p>
      <a
        href={card.link.href}
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "18px",
          fontWeight: 500,
          color: "#19154E",
          textDecoration: "none",
          transition: "opacity 0.2s",
          display: "inline-block",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.7")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
        }
      >
        {card.link.text}
      </a>
    </div>
  );

  const imageSide = (
    <div
      className="create-image-side"
      style={{
        background: card.imageFallbackBg,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <img
        src={card.image}
        alt={card.heading}
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
    </div>
  );

  return (
    <div className="create-card">
      {card.imageFirst ? (
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

export function CreateSection() {
  return (
    <section style={{ padding: "80px 40px" }}>
      <style>{`
        .create-section-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .create-card {
          background: #fafafa;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 380px;
        }
        .create-image-side {
          min-height: 220px;
        }
        @media (max-width: 767px) {
          .create-card {
            grid-template-columns: 1fr;
          }
          .create-image-side {
            order: -1;
          }
        }
      `}</style>
      <div className="create-section-inner">
        <h2
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "52px",
            fontWeight: 300,
            color: "#000",
            marginBottom: "12px",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          Create.
        </h2>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#888",
            marginBottom: "48px",
          }}
        >
          Create whiteboards, documents, spaces, tasks, and meeting notes.
        </p>
        {cards.map((card) => (
          <FeatureCardItem key={card.heading} card={card} />
        ))}
      </div>
    </section>
  );
}
