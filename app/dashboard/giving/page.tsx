import { redirect } from "next/navigation";

export default async function GivingPage() {
  // Redirect to transactions as the default giving page
  redirect("/dashboard/giving/transactions");
}