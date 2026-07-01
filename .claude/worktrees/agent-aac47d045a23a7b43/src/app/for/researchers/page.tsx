import { FeaturePageLayout } from "@/components/FeaturePageLayout"

export const metadata = {
  title: "For Researchers — Fabric",
  description: "Fabric is built for researchers. Organize papers, notes, and data. Find anything instantly with AI-powered search.",
}

const sections = [
  {
    heading: "Organize your research.",
    body: "Import papers, articles, and notes. Fabric automatically organizes them by topic.",
  },
  {
    heading: "Search inside documents.",
    body: "Find the exact passage in a PDF. Fabric searches content, not just file names.",
  },
  {
    heading: "AI research assistant.",
    body: "Ask questions across your entire research library. Get cited answers.",
  },
  {
    heading: "Collaborate with your team.",
    body: "Share research spaces with colleagues. Review and annotate together.",
  },
  {
    heading: "Capture ideas on the go.",
    body: "Voice notes, quick captures, and web clips — all organized automatically.",
  },
]

const relatedFeatures = [
  { label: "Canvas", href: "/features/canvas" },
  { label: "Notes & Docs", href: "/features/notes-and-docs" },
  { label: "AI Voice Notes", href: "/features/ai-voice-notes" },
  { label: "Annotations", href: "/features/annotations" },
]

export default function ResearchersPage() {
  return (
    <FeaturePageLayout
      tagLabel="Researchers"
      heroTitle="Research smarter, not harder."
      heroBody="Fabric is built for researchers. Organize papers, notes, and data. Find anything instantly with AI-powered search."
      sections={sections}
      relatedFeatures={relatedFeatures}
      ctaTitle="The workspace that thinks with you. Ready when you are."
    />
  )
}
