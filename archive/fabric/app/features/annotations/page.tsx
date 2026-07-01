import { FeaturePageLayout } from "@/components/FeaturePageLayout"

export const metadata = {
  title: "Annotations — Fabric",
  description: "Leave feedback pinned to the exact spot on an image, page, or slide. No more conversations split between email, messages, and files.",
}

const sections = [
  {
    heading: "Pin feedback anywhere.",
    body: "Click anywhere on an image, PDF, video, or document to leave a comment.",
  },
  {
    heading: "Timestamp video comments.",
    body: "Comment at the exact moment in a video. Jump directly to any timestamped annotation.",
  },
  {
    heading: "Collaborative review.",
    body: "Review and resolve feedback together. Track what's been addressed.",
  },
  {
    heading: "Keep conversations in context.",
    body: "No more copying feedback into separate emails. Everything lives where the work is.",
  },
]

const relatedFeatures = [
  { label: "Canvas", href: "/features/canvas" },
  { label: "Notes & Docs", href: "/features/notes-and-docs" },
  { label: "Publish", href: "/features/publish" },
]

export default function AnnotationsPage() {
  return (
    <FeaturePageLayout
      tagLabel="Annotations"
      heroTitle="Annotate directly on the work."
      heroBody="Leave feedback pinned to the exact spot on an image, page, or slide. No more conversations split between email, messages, and files."
      sections={sections}
      relatedFeatures={relatedFeatures}
      ctaTitle="The workspace that thinks with you. Ready when you are."
    />
  )
}
