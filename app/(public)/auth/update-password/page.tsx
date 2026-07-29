import { AuthShell } from "@/feature/auth/components/auth-shell";
import { UpdatePasswordForm } from "@/feature/auth/components/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="Use a new password you have not used elsewhere."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
