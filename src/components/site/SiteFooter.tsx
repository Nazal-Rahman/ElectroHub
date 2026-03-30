import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">ElectroHub</div>
            <p className="mt-2 text-sm text-muted-2 max-w-md">
              A premium space to build, share, and inspire electronics projects.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/projects" className="text-white/70 hover:text-white">
              Projects
            </Link>
            <Link href="/admin" className="text-white/70 hover:text-white">
              Admin
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-white/45">
          © {new Date().getFullYear()} ElectroHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

