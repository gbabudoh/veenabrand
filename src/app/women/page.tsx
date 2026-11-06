import { redirect } from "next/navigation";

// The women's segment lives at "/" — keep old /women links working.
export default function WomenHomePage() {
  redirect("/");
}
