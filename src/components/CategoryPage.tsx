import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryPageProps {
  title: string;
  description?: string;
}

const CategoryPage = ({ title, description }: CategoryPageProps) => {
  const { collection } = useParams();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide text-foreground">
            {collection ? collection.charAt(0).toUpperCase() + collection.slice(1) : title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder products */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-[3/4] bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2 p-4">
                  <h3 className="text-sm font-light tracking-wide text-foreground">
                    Товар {i}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    от 15 000 ₽
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" className="px-8">
            Показать еще
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;