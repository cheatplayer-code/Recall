import { FeaturePageLayout } from "@/components/FeaturePageLayout"

export const metadata = {
  title: "Notes & Docs — Fabric",
  description: "A beautifully minimal text editor that gives your ideas room to grow and flourish.",
}

const sections = [
  {
    heading: "Write full documents or quick notes.",
    body: "A beautiful, distraction-free editor for everything from quick captures to long-form writing.",
  },
  {
    heading: "Effortlessly embed or link.",
    body: "Embed files, notes, pages, and links. Everything connected.",
  },
  {
    heading: "AI writing assistance.",
    body: "Let AI help you draft, edit, and improve your writing.",
  },
  {
    heading: "Organize with structure.",
    body: "Headers, lists, tables, and more. Keep your writing organized.",
  },
  {
    heading: "Share and publish.",
    body: "Publish your notes as beautiful public pages in one click.",
  },
]

const relatedFeatures = [
  { label: "Canvas", href: "/features/canvas" },
  { label: "AI Voice Notes", href: "/features/ai-voice-notes" },
  { label: "Tasks & Reminders", href: "/features/tasks-and-reminders" },
  { label: "Publish", href: "/features/publish" },
]

export default function NotesAndDocsPage() {
  return (
    <FeaturePageLayout
      tagLabel="Notes & Docs"
      heroTitle="Write full documents or quick notes."
      heroBody="A beautifully minimal text editor that gives your ideas room to grow and flourish."
      sections={sections}
      relatedFeatures={relatedFeatures}
      ctaTitle="The workspace that thinks with you. Ready when you are."
    />
  )
}
