import { FeaturePageLayout } from "@/components/FeaturePageLayout"

export const metadata = {
  title: "Publish — Fabric",
  description: "Turn any note, canvas, or space into a beautiful public page. Share your work with anyone.",
}

const sections = [
  {
    heading: "Publish anything.",
    body: "Notes, canvases, spaces — publish them as beautiful public pages with one click.",
  },
  {
    heading: "Built-in analytics.",
    body: "See who opened your link, when, and how long they spent. Create dedicated links for specific viewers.",
  },
  {
    heading: "Control access.",
    body: "Allow visitors to copy, download, or simply view. Full control over what you share.",
  },
  {
    heading: "Custom domains.",
    body: "Publish to your own domain for a professional look.",
  },
]

const relatedFeatures = [
  { label: "Notes & Docs", href: "/features/notes-and-docs" },
  { label: "Canvas", href: "/features/canvas" },
  { label: "Annotations", href: "/features/annotations" },
]

export default function PublishPage() {
  return (
    <FeaturePageLayout
      tagLabel="Publish"
      heroTitle="Publish and share your work."
      heroBody="Turn any note, canvas, or space into a beautiful public page. Share your work with anyone."
      sections={sections}
      relatedFeatures={relatedFeatures}
      ctaTitle="The workspace that thinks with you. Ready when you are."
    />
  )
}
