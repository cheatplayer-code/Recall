import { FeaturePageLayout } from "@/components/FeaturePageLayout"

export const metadata = {
  title: "Canvas — Fabric",
  description: "An infinite workspace for your ideas, research, and projects. Pin files, draw connections, and see the big picture.",
}

const sections = [
  {
    heading: "Your thinking space.",
    body: "An infinite canvas to capture, arrange, and connect everything. Notes, files, images, links — all in one visual space.",
  },
  {
    heading: "Add your Fabric content.",
    body: "Drag anything from your library onto the canvas. Files, notes, pages — visualize your entire workspace.",
  },
  {
    heading: "Draw and write.",
    body: "Freehand drawing, sticky notes, arrows, and text. Think with your hands.",
  },
  {
    heading: "Live embeds.",
    body: "Embed websites, PDFs, videos and more. See live previews right on the canvas.",
  },
  {
    heading: "Infinite space.",
    body: "No boundaries. Pan and zoom across an endless workspace.",
  },
  {
    heading: "Real-time collaboration.",
    body: "Work together with your team on the same canvas, simultaneously.",
  },
  {
    heading: "Export anything.",
    body: "Export your canvas as PNG, PDF, or share a live link.",
  },
]

const relatedFeatures = [
  { label: "Notes & Docs", href: "/features/notes-and-docs" },
  { label: "AI Voice Notes", href: "/features/ai-voice-notes" },
  { label: "Annotations", href: "/features/annotations" },
  { label: "Publish", href: "/features/publish" },
]

export default function CanvasPage() {
  return (
    <FeaturePageLayout
      tagLabel="Canvas"
      heroTitle="Think visually. Work spatially."
      heroBody="An infinite workspace for your ideas, research, and projects. Pin files, draw connections, and see the big picture."
      sections={sections}
      relatedFeatures={relatedFeatures}
      ctaTitle="The workspace that thinks with you. Ready when you are."
    />
  )
}
