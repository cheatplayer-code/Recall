"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "For individuals", href: "/", hasChevron: false },
  { label: "For teams", href: "/teams", hasChevron: false },
  { label: "Features", href: "/features", hasChevron: true },
  { label: "Download", href: "/download", hasChevron: true },
  { label: "Pricing", href: "/pricing-and-plans-for-individuals", hasChevron: false },
] satisfies Array<{ label: string; href: string; hasChevron: boolean }>

function FabricIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="6" fill="#000" />
      <path
        d="M8 14C8 10.686 10.686 8 14 8s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6z"
        fill="white"
        fillRule="evenodd"
      />
      <circle cx="14" cy="14" r="2.5" fill="#000" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="2" rx="1" fill="#000" />
      <rect x="3" y="11" width="18" height="2" rx="1" fill="#000" />
      <rect x="3" y="16" width="18" height="2" rx="1" fill="#000" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "inline-block", marginLeft: "2px", verticalAlign: "middle" }}
    >
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-in-out",
        scrolled
          ? "border-b border-[#ededed] [background:rgba(255,255,255,0.95)] [backdrop-filter:blur(8px)]"
          : "border-b border-transparent bg-transparent"
      )}
      style={{ height: "71px" }}
    >
      <div
        className="mx-auto flex h-full items-center justify-between"
        style={{ maxWidth: "1280px", padding: "0 40px" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          aria-label="Fabric home"
        >
          <FabricIcon />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              color: "#000",
              lineHeight: 1,
            }}
          >
            Fabric
          </span>
        </Link>

        {/* Center nav links — hidden on mobile */}
        <nav
          className="hidden md:flex items-center"
          style={{ gap: "28px" }}
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-opacity duration-150 hover:opacity-60"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#000",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {link.label}
              {link.hasChevron && <ChevronDownIcon />}
            </Link>
          ))}
        </nav>

        {/* Right buttons */}
        <div className="flex items-center gap-4">
          {/* Log in */}
          <a
            href="https://fabric.so/signin"
            className="hidden md:inline-flex transition-opacity duration-150 hover:opacity-60"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#000",
              textDecoration: "none",
            }}
          >
            Log in
          </a>

          {/* Try for $0 CTA */}
          <Link
            href="/signup"
            className="inline-flex items-center justify-center transition-opacity duration-150 hover:opacity-85"
            style={{
              backgroundColor: "#0a0a0a",
              color: "#fff",
              borderRadius: "8px",
              padding: "10px 18px",
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Try for $0
          </Link>

          {/* Hamburger — visible on mobile only */}
          <button
            className="flex md:hidden items-center justify-center"
            aria-label="Open menu"
            type="button"
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
