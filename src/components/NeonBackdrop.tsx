// ABOUTME: Renders the fixed rain-lit neon atmosphere layered behind the app frame.
// ABOUTME: Purely decorative and hidden from assistive technology.
export function NeonBackdrop() {
  return (
    <div className="neon-backdrop" aria-hidden="true">
      <div className="neon-glow is-cyan" />
      <div className="neon-glow is-amber" />
      <div className="neon-sign">戦績</div>
      <div className="neon-rain" />
      <div className="neon-vignette" />
    </div>
  )
}
