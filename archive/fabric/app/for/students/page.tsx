import { FeaturePageLayout } from "@/components/FeaturePageLayout"

export const metadata = {
  title: "For Students — Fabric",
  description: "From lecture notes to research papers — Fabric keeps everything in one place, searchable and connected.",
}

const sections = [
  {
    heading: "Capture every lecture.",
    body: "Record and transcribe lectures automatically. Never miss a detail.",
  },
  {
    heading: "Organize by subject.",
    body: "Create spaces for each course. Keep notes, assignments, and resources together.",
  },
  {
    heading: "AI study assistant.",
    body: "Ask questions about your notes. Get summaries, flashcards, and explanations.",
  },
  {
    heading: "Research papers made easy.",
    body: "Import papers, highlight key points, and find connections across your reading list.",
  },
  {
    heading: "Never lose an idea.",
    body: "Quick capture on any device. Your ideas sync instantly.",
  },
]

const relatedFeatures = [
  { label: "AI Voice Notes", href: "/features/ai-voice-notes" },
  { label: "Notes & Docs", href: "/features/notes-and-docs" },
  { label: "Tasks & Reminders", href: "/features/tasks-and-reminders" },
  { label: "Canvas", href: "/features/canvas" },
]

export default function StudentsPage() {
  return (
    <FeaturePageLayout
      tagLabel="Students"
      heroTitle="Your academic life, organized."
      heroBody="From lecture notes to research papers — Fabric keeps everything in one place, searchable and connected."
      sections={sections}
      relatedFeatures={relatedFeatures}
      ctaTitle="The workspace that thinks with you. Ready when you are."
    />
  )
}
