"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

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

const navLinks = [
  { label: "For individuals", href: "/", hasChevron: false },
  { label: "For teams", href: "/teams", hasChevron: false },
  { label: "Features", href: "/features", hasChevron: true },
  { label: "Download", href: "/download", hasChevron: true },
  { label: "Pricing", href: "/pricing-and-plans-for-individuals", hasChevron: false },
] satisfies Array<{ label: string; href: string; hasChevron: boolean }>

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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "71px",
        transition: "all 0.2s ease-in-out",
        borderBottom: scrolled ? "1px solid #ededed" : "1px solid transparent",
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
          aria-label="Fabric home"
        >
          <FabricIcon />
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              color: "#000",
              lineHeight: 1,
            }}
          >
            Fabric
          </span>
        </Link>

        {/* Center nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#000",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                opacity: 1,
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "0.6"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "1"
              }}
            >
              {link.label}
              {link.hasChevron && <ChevronDownIcon />}
            </Link>
          ))}
        </nav>

        {/* Right buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="https://fabric.so/signin"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#000",
              textDecoration: "none",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.6"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1"
            }}
          >
            Log in
          </a>

          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0a0a0a",
              color: "#fff",
              borderRadius: "8px",
              padding: "10px 18px",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1"
            }}
          >
            Try for $0
          </Link>

          <button
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
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
