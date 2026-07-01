import Image from "next/image"

interface PublishFeatureCardProps {
  heading: string
  body: string
  body2: string
  image: string
  imageAlt: string
  imageFirst?: boolean
}

function PublishFeatureCard({
  heading,
  body,
  body2,
  image,
  imageAlt,
  imageFirst = false,
}: PublishFeatureCardProps) {
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
        overflow: "hidden",
        background: "#f0f0f0",
      }}
    >
      <Image
        src={image}
        alt={imageAlt}
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

export function PublishSection() {
  return (
    <section style={{ padding: "80px 40px" }}>
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
          Publish and share your work.
        </h2>

        <PublishFeatureCard
          heading="Publish anything."
          body="Publish notes, canvases, and spaces as beautiful public pages."
          body2="Share a project, a research overview, or a creative portfolio — in one click."
          image="/images/hLuDSlwriuxQwgy8MDOtEu87uk.png"
          imageAlt="Publish anything"
          imageFirst={true}
        />

        <PublishFeatureCard
          heading="Built-in analytics."
          body="Understand how visitors are engaging with your content."
          body2="See who opened your link, when, and how long they spent."
          image="/images/RltalDWHPVeFdVlC741amM9w6Y.png"
          imageAlt="Built-in analytics"
          imageFirst={false}
        />
      </div>
    </section>
  )
}

export default PublishSection
