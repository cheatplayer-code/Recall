"use client";

interface FeatureCard {
  image: string;
  imageFirst: boolean;
  heading: string;
  subheading: string;
  body: string;
  body2?: string;
  link: { text: string; href: string };
}

const cards: FeatureCard[] = [
  {
    image: "/images/SqUNmEz4xPm8sGGyFXitVXkBc.png",
    imageFirst: false,
    heading: "An infinite canvas.",
    subheading: "Draw, moodboard, and think.",
    body: "Spread your ideas out, brainstorm with all your Fabric content.",
    body2: "Think visually.",
    link: { text: "Learn more →", href: "/features/canvas" },
  },
  {
    image: "/images/yaeSG5tkIoK5Hdd1758IOs2x4.png",
    imageFirst: true,
    heading: "Write full documents or quick notes.",
    subheading: "",
    body: "A beautifully minimal text editor that gives your ideas room to grow and flourish.",
    body2: "Effortlessly embed or link to another file, note or anything else.",
    link: { text: "Learn more →", href: "/features/notes-and-docs" },
  },
  {
    image: "/images/hLuDSlwriuxQwgy8MDOtEu87uk.png",
    imageFirst: false,
    heading: "Create meeting or voice notes.",
    subheading: "",
    body: "Pay attention to the conversation, with meeting notes that write themselves.",
    body2: "Fabric combines your notes with the recording, so you never miss a key point.",
    link: { text: "Learn more →", href: "/features/ai-voice-notes" },
  },
  {
    image: "/images/RltalDWHPVeFdVlC741amM9w6Y.png",
    imageFirst: true,
    heading: "Create tasks with reminders.",
    subheading: "",
    body: "Take action and plan, all in the same place.",
    body2: "Set priority, a due date, reminders, and connect relevant files.",
    link: { text: "Learn more →", href: "/features/tasks-and-reminders" },
  },
  {
    image: "/images/IY57ago0ItxOBVGQEe3F3oqDlYg.png",
    imageFirst: false,
    heading: "Create a space and gather your ideas.",
    subheading: "",
    body: "Arrange, add comments, curate and customize.",
    body2: "A container for your work or inspiration.",
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
          fontSize: "20px",
          fontWeight: 600,
          color: "#000",
          margin: 0,
          lineHeight: "1.3",
        }}
      >
        {card.heading}
        {card.subheading && (
          <><br />{card.subheading}</>
        )}
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
      {card.body2 && (
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
      )}
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
        background: "#fafafa",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
