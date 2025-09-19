import { products, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

interface RelatedProductsProps {
  productIds: number[];
  currentProductId: number;
}

const RelatedProducts = ({ productIds, currentProductId }: RelatedProductsProps) => {
  const relatedProducts = products.filter(
    (product) => productIds.includes(product.id) && product.id !== currentProductId
  );

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-8">
        С этим прекрасно сочетается
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;