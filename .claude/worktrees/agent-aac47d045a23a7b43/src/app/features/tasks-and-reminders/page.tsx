import { FeaturePageLayout } from "@/components/FeaturePageLayout"

export const metadata = {
  title: "Tasks & Reminders — Fabric",
  description: "Take action and plan, all in the same place. Set priority, a due date, and connect relevant files.",
}

const sections = [
  {
    heading: "Create tasks anywhere.",
    body: "Add tasks from any note, canvas, or meeting. Connect them to relevant files and projects.",
  },
  {
    heading: "Set priorities and dates.",
    body: "High, medium, or low priority. Set due dates and get reminded at the right time.",
  },
  {
    heading: "Connect to your work.",
    body: "Link tasks to notes, files, and projects. See everything in context.",
  },
  {
    heading: "AI-powered task extraction.",
    body: "Fabric automatically extracts action items from your meetings and notes.",
  },
  {
    heading: "Stay on top of everything.",
    body: "Your tasks, organized by project, priority, and due date.",
  },
]

const relatedFeatures = [
  { label: "Notes & Docs", href: "/features/notes-and-docs" },
  { label: "AI Voice Notes", href: "/features/ai-voice-notes" },
  { label: "Canvas", href: "/features/canvas" },
]

export default function TasksAndRemindersPage() {
  return (
    <FeaturePageLayout
      tagLabel="Tasks"
      heroTitle="Create tasks with reminders."
      heroBody="Take action and plan, all in the same place. Set priority, a due date, and connect relevant files."
      sections={sections}
      relatedFeatures={relatedFeatures}
      ctaTitle="The workspace that thinks with you. Ready when you are."
    />
  )
}
