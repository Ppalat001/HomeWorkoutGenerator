import { redirect } from "next/navigation";

export default function IntermediateRedirectPage() {
  redirect("/dashboard");
}
