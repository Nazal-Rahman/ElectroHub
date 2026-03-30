import UploadProjectForm from "./UploadProjectForm";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import GlassCard from "@/components/ui/GlassCard";

export default function AdminPage() {
  return (
    <div className="flex flex-col flex-1">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-2">
            Upload a project with code, images, and circuit diagram—premium presentation by default.
          </p>
        </div>

        <GlassCard className="p-5 md:p-6">
          <UploadProjectForm />
        </GlassCard>

        <SiteFooter />
      </main>
    </div>
  );
}

