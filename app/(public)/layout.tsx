import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anket - Metro İstanbul',
  description: 'Metro İstanbul anketine katılın',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border/50 shadow-sm">
        <div className="h-1 bg-gradient-metro-light"></div>
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-metro-navy rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-metro-navy tracking-tight">METRO İSTANBUL</h1>
              <div className="h-0.5 w-12 bg-metro-red mt-1 rounded-full"></div>
              <p className="text-sm text-muted-foreground mt-1">Anket Katılım Platformu</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border/50 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-metro-navy/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-metro-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Güvenli Anket Sistemi</p>
                <p className="text-xs text-muted-foreground">Tüm yanıtlarınız gizli tutulur</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Metro İstanbul. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
