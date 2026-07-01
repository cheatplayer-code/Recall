# archive/fabric — Reference code (Fabric.so clone)

This folder holds the original **Fabric.so landing clone** that the project was
scaffolded from. It is **not part of the active Recall build**:

- excluded from TypeScript compilation (`tsconfig.json` → `exclude: ["archive"]`)
- ignored by ESLint (`eslint.config.mjs` → `archive/**`)
- not imported by any file under `src/`

## Why it's kept (not deleted yet)

We migrated to a clean Recall app architecture. Most of this code is
Fabric-branded marketing (inline-styled sections, hardcoded copy, brand fonts
and assets) and will **not** be reused. It is preserved temporarily so that if a
genuinely universal UI pattern turns out to be useful, we can safely lift it
back into `src/` and rewrite it to Recall conventions (Tailwind, no inline
styles).

## Structure (mirrors the original `src/`)

```
archive/fabric/
  components/   # Fabric marketing sections (Hero, Navbar, Footer, ...)
  app/          # Fabric clone routes (features/*, teams, pricing, signup, ...)
```

## Removal

Once the Recall App Shell is fully built and we've confirmed nothing here is
needed, delete this entire folder in a single commit.
