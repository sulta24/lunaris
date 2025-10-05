import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { AppverseFooter } from "@/components/appverse-footer"
import Script from "next/script"

// ✅ Force static generation for low TTFB
export const dynamic = "force-static"

export default function Page() {
  // Structured data for main page
  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://theLunaris.com/",
    name: "Lunaris | 3D Animation Made Simple, Reliable & Scalable",
    description:
      "From product launches to full-scale campaigns, Lunaris delivers 3D animation that's fast, consistent, and built to wow your audience.",
    url: "https://theLunaris.com/",
    mainEntity: {
      "@type": "Organization",
      name: "Lunaris",
      url: "https://theLunaris.com",
      sameAs: [
        "https://twitter.com/theLunaris",
        "https://www.youtube.com/@Lunarisinternational",
        "https://instagram.com/theLunaris",
        "https://threads.com/theLunaris",
      ],
    },
  }

  return (
    <>
      <main className="min-h-[100dvh] text-white">
        <SiteHeader />
        <Hero />
        <AppverseFooter />
      </main>

      {/* JSON-LD structured data */}
      <Script
        id="page-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageStructuredData),
        }}
      />
    </>
  )
}
