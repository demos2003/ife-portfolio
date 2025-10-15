import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/20 flex flex-col items-center">
      <div className="container px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-serif font-bold mb-4">Portfolio</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Video Editor & Content Strategist creating engaging content that tells your story.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/work" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Work
                  </Link>
                </li>

              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <p className="text-sm text-muted-foreground">
                Ready to work together? Get in touch to discuss your next project.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Portfolio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
