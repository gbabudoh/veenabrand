import { Suspense } from "react";
import { db } from "@/lib/db";
import ProductsClient from "@/components/ProductsClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { gender?: string; category?: string };
}) {
  const genderQuery = searchParams.gender?.toUpperCase();
  const initialGender = genderQuery === "MEN" ? "MEN" : "WOMEN";

  const products = await db.product.findMany({
    where: {
      gender: initialGender,
    },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Suspense fallback={<div className="container-max" style={{ padding: "100px 24px", textAlign: "center" }}>Loading collection...</div>}>
      <ProductsClient products={products} initialGender={initialGender} />
    </Suspense>
  );
}
