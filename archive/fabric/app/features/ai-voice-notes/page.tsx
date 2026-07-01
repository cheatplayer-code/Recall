import { FeaturePageLayout } from "@/components/FeaturePageLayout"

export const metadata = {
  title: "AI Voice Notes — Fabric",
  description: "Record, transcribe, and summarize with AI. Your AI assistant captures every insight so you don't have to.",
}

const sections = [
  {
    heading: "Record anything.",
    body: "One tap to record a voice note, meeting, or lecture. Works on all devices.",
  },
  {
    heading: "Real-time transcription.",
    body: "Watch your words appear as you speak. Powered by state-of-the-art AI.",
  },
  {
    heading: "AI summaries.",
    body: "Get an instant summary of any recording. Key points, action items, and decisions — captured automatically.",
  },
  {
    heading: "Email your notes.",
    body: "Forward audio or meeting links to your Fabric address and get organized notes back.",
  },
  {
    heading: "Searchable forever.",
    body: "Find anything you've ever said. Search across all your recordings and transcripts.",
  },
]

const relatedFeatures = [
  { label: "Notes & Docs", href: "/features/notes-and-docs" },
  { label: "Tasks & Reminders", href: "/features/tasks-and-reminders" },
  { label: "Canvas", href: "/features/canvas" },
]

export default function AIVoiceNotesPage() {
  return (
    <FeaturePageLayout
      tagLabel="Voice Notes"
      heroTitle="Create meeting or voice notes."
      heroBody="Record, transcribe, and summarize with AI. Your AI assistant captures every insight so you don't have to."
      sections={sections}
      relatedFeatures={relatedFeatures}
      ctaTitle="The workspace that thinks with you. Ready when you are."
    />
  )
}
