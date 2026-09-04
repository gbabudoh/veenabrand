import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
