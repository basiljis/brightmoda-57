const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-foreground">
              О НАС
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              История бренда BRIGHT и наша философия
            </p>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <p>
              BRIGHT — это бренд премиальной одежды из мериносовой шерсти, созданный с любовью к качеству, 
              комфорту и минималистичному дизайну.
            </p>
            
            <p>
              Мы верим, что настоящая роскошь заключается в простоте и качестве материалов. 
              Каждое изделие создается из лучшей мериносовой шерсти, которая обеспечивает 
              исключительный комфорт и долговечность.
            </p>
            
            <p>
              Наша миссия — создавать вещи, которые станут основой вашего гардероба на долгие годы, 
              сочетая в себе функциональность, красоту и устойчивость.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;