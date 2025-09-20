const ContactsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide text-foreground">
              КОНТАКТЫ
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Свяжитесь с нами любым удобным способом
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Телефон</h3>
                <p className="text-muted-foreground">+7 (495) 123-45-67</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Email</h3>
                <p className="text-muted-foreground">hello@bright.ru</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Адрес</h3>
                <p className="text-muted-foreground">
                  Москва, ул. Тверская, 15<br/>
                  Ежедневно с 10:00 до 22:00
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Социальные сети</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Instagram: @bright_official</p>
                  <p>Telegram: @bright_support</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Часы работы</h3>
                <div className="text-muted-foreground">
                  <p>Пн-Пт: 10:00 - 20:00</p>
                  <p>Сб-Вс: 11:00 - 19:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;