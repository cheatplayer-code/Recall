import Image from "next/image"

interface FeatureCardProps {
  heading: string
  body: string
  body2: string
  image: string
  imageFirst?: boolean
}

function FeatureCard({ heading, body, body2, image, imageFirst = false }: FeatureCardProps) {
  const textSide = (
    <div
      style={{
        padding: "48px 40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-gt-alpina), Georgia, serif",
          fontSize: "35px",
          fontWeight: 300,
          color: "#000",
          lineHeight: "37.8px",
          marginBottom: "16px",
        }}
      >
        {heading}
      </h3>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          color: "#666",
          lineHeight: "24px",
          marginBottom: "8px",
        }}
      >
        {body}
      </p>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          color: "#666",
          lineHeight: "24px",
        }}
      >
        {body2}
      </p>
    </div>
  )

  const imageSide = (
    <div
      style={{
        position: "relative",
        minHeight: "320px",
        background: "#f0f0f0",
        overflow: "hidden",
      }}
    >
      <Image
        src={image}
        alt={heading}
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )

  return (
    <div
      style={{
        background: "#fafafa",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "16px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "320px",
      }}
    >
      {imageFirst ? (
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
  )
}

export function CreateSection() {
  return (
    <section
      style={{
        background: "#ffffff",
        padding: "80px 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "var(--font-gt-alpina), Georgia, serif",
            fontSize: "52px",
            fontWeight: 300,
            color: "#000",
            marginBottom: "48px",
          }}
        >
          Create and capture everything.
        </h2>
        <FeatureCard
          heading="Notes and documents."
          body="Write rich notes, docs, and briefs — with AI always a keystroke away."
          body2="Fabric's editor adapts to your workflow."
          image="/images/OeyHO7JKrGk09EzXcUX5fSZVwJw.png"
          imageFirst={false}
        />
        <FeatureCard
          heading="Canvas."
          body="A spatial canvas for visual thinkers. Drag, connect, and arrange your ideas freely."
          body2="Turn chaos into clarity."
          image="/images/Hy9vFQ3p4PEQ6CZVwQidKoirM.png"
          imageFirst={true}
        />
      </div>
    </section>
  )
}

export default CreateSection
