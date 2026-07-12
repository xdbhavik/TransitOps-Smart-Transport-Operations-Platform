export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-background text-on-surface overflow-hidden">
      {/* Left panel - Branding */}
      <section className="hidden md:flex md:w-[38%] bg-surface-container-high flex-col justify-between p-10 h-screen border-r border-outline-variant relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary opacity-[0.04] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary opacity-[0.03] rounded-full -ml-40 -mb-40 pointer-events-none" />

        {/* Brand */}
        <div className="z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
            </div>
            <h1 className="font-display font-black text-2xl tracking-tighter text-on-surface">TransitOps</h1>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
            Smart Transport Operations Platform. Precision fleet management for logistics organizations.
          </p>
        </div>

        {/* Feature list */}
        <div className="z-10 space-y-4">
          {[
            { icon: 'local_shipping', text: 'Complete vehicle lifecycle management' },
            { icon: 'route', text: 'Real-time trip dispatching and tracking' },
            { icon: 'analytics', text: 'Financial analytics and ROI reporting' },
            { icon: 'security', text: 'Role-based access control' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
              <span className="text-sm text-on-surface-variant">{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="z-10">
          <p className="text-on-surface-variant text-xs uppercase tracking-widest opacity-40">
            TRANSITOPS © 2026
          </p>
        </div>
      </section>

      {/* Right panel - Form */}
      <section className="flex-1 bg-background flex flex-col justify-center px-6 md:px-16 h-screen relative">
        {/* Mobile branding */}
        <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_shipping
            </span>
          </div>
          <span className="font-display font-black text-xl text-on-surface">TransitOps</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </section>
    </div>
  )
}

export default AuthLayout
