const WebIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="13" stroke="#000" strokeWidth="1.8" />
    <ellipse cx="16" cy="16" rx="5.5" ry="13" stroke="#000" strokeWidth="1.8" />
    <line x1="3" y1="12" x2="29" y2="12" stroke="#000" strokeWidth="1.8" />
    <line x1="3" y1="20" x2="29" y2="20" stroke="#000" strokeWidth="1.8" />
  </svg>
);

const AppleIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M21.5 7c-2.2 0-3.5 1.3-5.5 1.3C14 8.3 12.3 7 10.5 7 7 7 4 10.3 4 14.5c0 5.5 4.5 11.5 7 11.5 1.3 0 2-0.8 4-0.8s2.6 0.8 4 0.8c2.5 0 7-6 7-11.5C26 10.3 24.5 7 21.5 7z"
      fill="#000"
    />
    <path
      d="M16 7c0 0 1-3 4-3"
      stroke="#000"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const AndroidIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="7" y="14" width="18" height="12" rx="2" fill="#000" />
    <ellipse cx="16" cy="13" rx="9" ry="6" fill="#000" />
    <circle cx="12.5" cy="13" r="1.2" fill="#fff" />
    <circle cx="19.5" cy="13" r="1.2" fill="#fff" />
    <line x1="10" y1="8" x2="7" y2="5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="22" y1="8" x2="25" y2="5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="4" y="16" width="3" height="7" rx="1.5" fill="#000" />
    <rect x="25" y="16" width="3" height="7" rx="1.5" fill="#000" />
    <rect x="12" y="26" width="3" height="4" rx="1.5" fill="#000" />
    <rect x="17" y="26" width="3" height="4" rx="1.5" fill="#000" />
  </svg>
);

const ChromeIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="13" stroke="#000" strokeWidth="1.8" />
    <circle cx="16" cy="16" r="5" stroke="#000" strokeWidth="1.8" />
    <line x1="16" y1="11" x2="16" y2="3" stroke="#000" strokeWidth="1.8" />
    <line x1="20.3" y1="13.5" x2="27.3" y2="7.5" stroke="#000" strokeWidth="1.8" />
    <line x1="20.3" y1="18.5" x2="27.3" y2="24.5" stroke="#000" strokeWidth="1.8" />
    <line x1="16" y1="21" x2="16" y2="29" stroke="#000" strokeWidth="1.8" />
    <line x1="11.7" y1="18.5" x2="4.7" y2="24.5" stroke="#000" strokeWidth="1.8" />
    <line x1="11.7" y1="13.5" x2="4.7" y2="7.5" stroke="#000" strokeWidth="1.8" />
  </svg>
);

const platforms = [
  {
    name: "Web",
    action: "Sign in",
    href: "https://fabric.so/home",
    Icon: WebIcon,
  },
  { name: "iOS", action: "Get app", href: "#", Icon: AppleIcon },
  { name: "Android", action: "Get app", href: "#", Icon: AndroidIcon },
  { name: "Chrome", action: "Get extension", href: "#", Icon: ChromeIcon },
] as const;

export function DownloadSection() {
  return (
    <div
      style={{
        width: "100%",
        borderTop: "1px solid #ededed",
        borderBottom: "1px solid #ededed",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}
      className="download-section-grid"
    >
      <style>{`
        @media (max-width: 640px) {
          .download-section-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .download-section-cell:nth-child(2) {
            border-right: none !important;
          }
        }
      `}</style>
      {platforms.map((platform, index) => {
        const isLast = index === platforms.length - 1;
        return (
          <div
            key={platform.name}
            className={`download-section-cell${index === 1 ? " download-section-cell-second" : ""}`}
            style={{
              padding: "40px 24px",
              textAlign: "center",
              borderRight: isLast ? "none" : "1px solid #ededed",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <platform.Icon />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "20px",
                fontWeight: 500,
                color: "#000",
              }}
            >
              {platform.name}
            </span>
            <a
              href={platform.href}
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "#666",
                textDecoration: "none",
              }}
            >
              {platform.action}
            </a>
          </div>
        );
      })}
    </div>
  );
}
