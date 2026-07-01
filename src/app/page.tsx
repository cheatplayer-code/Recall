import { redirect } from "next/navigation";

/**
 * Root entry. With no real auth yet, send users straight into the app.
 * The marketing landing will later live in a `(marketing)` route group.
 */
export default function RootPage() {
  redirect("/home");
}
