import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { GENDER_COOKIE, resolveGender, genderHome } from "@/lib/gender";

// "/" is a doorway, not a page. Every visitor lands on a real, shareable
// segment URL (/women or /men), picked from their saved preference so a
// returning shopper goes straight back to the side of the store they use.
export default function RootPage() {
  const saved = cookies().get(GENDER_COOKIE)?.value;
  redirect(genderHome(resolveGender(saved)));
}
