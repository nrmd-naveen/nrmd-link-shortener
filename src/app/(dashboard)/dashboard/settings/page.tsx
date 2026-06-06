import { auth } from "@/lib/auth";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-xl animate-fade-in-up">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Configure your personal preferences and account security.
        </p>
      </div>
      <SettingsForm user={user} />
    </div>
  );
}
