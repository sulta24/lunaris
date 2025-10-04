"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Instagram, Twitter, Youtube, MessageCircle } from "lucide-react"
import LazyVideo from "./lazy-video"
import Image from "next/image"

interface FooterContent {
  tagline: string
  copyright: string
}

const defaultContent: FooterContent = {
  tagline: "Experience 3D animation like never before. We craft cinematic visuals for brands and products.",
  copyright: "© 2025 — Lunaris International Uk",
}

export function AppverseFooter() {
  const [content, setContent] = useState<FooterContent>(defaultContent)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content")
        if (response.ok) {
          const data = await response.json()
          setContent(data.footer || defaultContent)
        }
      } catch (error) {
        console.error("Failed to fetch footer content:", error)
      }
    }

    fetchContent()
  }, [])

  return (
    <div className="bg-black text-white">
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to bring your vision to life?
          </h2>
          <p className="mb-8 text-lg text-neutral-400 sm:text-xl">
            Join thousands of creators who trust us with their 3D animation needs.
          </p>
          <Button size="lg" className="bg-lime-300 text-black hover:bg-lime-400">
            <a href="#pricing" className="flex items-center gap-2">
              Get Started Today
            </a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 pb-20 md:pb-10">
        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-semibold text-lime-300">Lunaris</span>
              </div>
              <p className="max-w-sm text-sm text-neutral-400">{content.tagline}</p>
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-2">
              <div>
                <h5 className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Navigation</h5>
                <ul className="space-y-2 text-sm text-neutral-300">
                  {["Home", "Features", "Testimonials", "Pricing", "Blog", "Download"].map((item) => (
                    <li key={item}>
                      <Link href={`#${item.toLowerCase()}`} className="hover:text-lime-300">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Social media</h5>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-neutral-400" />
                    <a
                      href="https://twitter.com/theLunaris"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-lime-300"
                    >
                      Twitter
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-neutral-400" />
                    <a
                      href="https://www.youtube.com/@Lunarisinternational"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-lime-300"
                    >
                      YouTube
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-neutral-400" />
                    <a
                      href="https://instagram.com/theLunaris"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-lime-300"
                    >
                      Instagram
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-neutral-400" />
                    <a
                      href="https://threads.com/theLunaris"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-lime-300"
                    >
                      Threads
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">Contact</h5>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>
                  <a href="mailto:hello@theLunaris.com" className="hover:text-lime-300">
                    hello@theLunaris.com
                  </a>
                </li>
                <li>
                  <a href="/support" className="hover:text-lime-300">
                    Support Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-lime-300">
                    Get in Touch
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 flex flex-col items-center justify-between border-t border-white/10 pt-8 text-sm text-neutral-400 sm:flex-row">
            <p>{content.copyright}</p>
            <div className="mt-4 flex gap-6 sm:mt-0">
              <Link href="/privacy" className="hover:text-lime-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-lime-300">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
