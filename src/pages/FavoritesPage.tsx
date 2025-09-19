import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Heart, ArrowLeft } from "lucide-react";

const FavoritesPage = () => {
  // В реальном приложении здесь была бы логика получения избранных товаров
  const favoriteProducts = products.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-elegant">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Избранное</h1>
            </div>
          </div>
          <div className="text-muted-foreground">
            {favoriteProducts.length} товар{favoriteProducts.length !== 1 && favoriteProducts.length < 5 ? 'а' : 'ов'}
          </div>
        </div>

        {/* Content */}
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Ваш список избранного пуст
            </h2>
            <p className="text-muted-foreground mb-6">
              Добавляйте понравившиеся товары в избранное, чтобы не потерять их
            </p>
            <Link to="/catalog">
              <Button variant="premium" size="lg">
                Перейти к покупкам
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Actions */}
            <div className="text-center">
              <Link to="/catalog">
                <Button variant="outline" size="lg">
                  Продолжить покупки
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;