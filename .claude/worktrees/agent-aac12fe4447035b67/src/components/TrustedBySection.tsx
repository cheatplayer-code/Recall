const logos = [
  "/images/pfSO34tXPcWvXjLwmyhs4y103c.png",
  "/images/XhRgPDiL0Z31WGxLgTSSWfuhXo.png",
  "/images/JAiT3LlagYS7Ovk3fqFSxtypo.png",
  "/images/OItbL3ySDQh3h1l7nM4GBf8J10o.png",
  "/images/jEF8FbMUTOrx44shbSGr0s6wLCo.png",
  "/images/UiIgIwGvZBSpC99BzWPhWqSX8.png",
  "/images/3matbM3hFnMuVpLfntXiY2AvTRs.png",
  "/images/yZWeKgRc9KD9BdM4lqxbYAknus.png",
];

export function TrustedBySection() {
  return (
    <section
      style={{
        background: "#ffffff",
        padding: "48px 32px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 400,
          color: "#888888",
          marginBottom: "32px",
          marginTop: 0,
        }}
      >
        Trusted by thinkers, creatives, researchers and students at
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "32px 48px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {logos.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            style={{
              height: "36px",
              width: "auto",
              opacity: 0.65,
              filter: "grayscale(100%)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
