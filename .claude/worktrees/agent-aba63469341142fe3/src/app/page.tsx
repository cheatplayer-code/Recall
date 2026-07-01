import { Navbar } from "@/components/Navbar"
import { HeroSection } from "@/components/HeroSection"
import { TrustedBySection } from "@/components/TrustedBySection"
import { DownloadSection } from "@/components/DownloadSection"
import { CreateSection } from "@/components/CreateSection"
import { AISection } from "@/components/AISection"
import { SearchSection } from "@/components/SearchSection"
import { PublishSection } from "@/components/PublishSection"
import { Footer } from "@/components/Footer"

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <TrustedBySection />
      <DownloadSection />
      <CreateSection />
      <AISection />
      <SearchSection />
      <PublishSection />
      <Footer />
    </main>
  )
}
