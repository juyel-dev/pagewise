"use client";

// Renders its own document and does not get global styles, so it uses inline styles only.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
        <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
          <p style={{ margin: 0, color: "#334155" }}>The app hit an unexpected error. Your progress is safe.</p>
          <button onClick={() => retry()} style={{ height: 44, padding: "0 20px", borderRadius: 999, border: 0, background: "#2563eb", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Try again</button>
        </main>
      </body>
    </html>
  );
}
