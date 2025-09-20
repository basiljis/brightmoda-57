const LookbookPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide text-foreground">
            LOOKBOOK
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Коллекция образов и стилевых решений от BRIGHT
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-lg"></div>
              <div className="text-center">
                <h3 className="text-lg font-light tracking-wide text-foreground">
                  Образ {i}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Осень 2024
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LookbookPage;