// ABOUTME: Renders the fixed neon-glow atmosphere layered behind the app frame.
// ABOUTME: Purely decorative and hidden from assistive technology.
export function NeonBackdrop() {
  return (
    <div className="neon-backdrop" aria-hidden="true">
      <div className="neon-glow is-cyan" />
      <div className="neon-glow is-amber" />
      <div className="neon-vignette" />
    </div>
  )
}
