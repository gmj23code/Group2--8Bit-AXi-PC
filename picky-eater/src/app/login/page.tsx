import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

// LoginForm reads ?confirmed=1 from the URL, which needs a Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
