import { redirect } from "next/navigation"

// Original behavior: send /products → / so all categories live on the homepage.
export default function ProductsPage() {
  redirect("/")
}
