import sweatearBeige from "@/assets/sweater-beige.jpg";
import cardiganCream from "@/assets/cardigan-cream.jpg";

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  category: string;
  description: string;
  features: string[];
  materials: string;
  care: string[];
  sizes: string[];
  colors?: { name: string; image: string }[];
  relatedProducts?: number[];
  isNew?: boolean;
  isPreorder?: boolean;
  isFeatured?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Классический свитер из мериноса",
    price: 12900,
    originalPrice: 15900,
    image: sweatearBeige,
    hoverImage: cardiganCream,
    category: "Свитеры",
    isNew: true,
    isFeatured: true,
    description: "Элегантный свитер из 100% шерсти мериноса. Невероятно мягкий и теплый, идеально подходит для прохладной погоды. Классический крой позволяет носить как в повседневной жизни, так и в офисе.",
    features: [
      "100% шерсть мериноса премиум качества",
      "Антипиллинговая обработка",
      "Температурная регуляция",
      "Гипоаллергенный материал",
      "Долговечность и износостойкость"
    ],
    materials: "100% мериносовая шерсть (18,5 микрон)",
    care: [
      "Деликатная стирка при 30°C",
      "Не отбеливать",
      "Сушить горизонтально",
      "Гладить через влажную ткань"
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "beige", image: sweatearBeige },
      { name: "cream", image: cardiganCream }
    ],
    relatedProducts: [2, 3]
  },
  {
    id: 2,
    name: "Кардиган oversize из мериноса",
    price: 18500,
    image: cardiganCream,
    hoverImage: sweatearBeige,
    category: "Кардиганы",
    isPreorder: true,
    isFeatured: true,
    description: "Стильный кардиган свободного кроя из тончайшей мериносовой шерсти. Универсальная модель, которая прекрасно сочетается с любым гардеробом. Идеален для создания элегантных образов.",
    features: [
      "Свободный силуэт oversize",
      "Мягкая фактура мериноса",
      "Функциональные карманы",
      "Длинные рукава",
      "Универсальный дизайн"
    ],
    materials: "100% мериносовая шерсть экстра-файн",
    care: [
      "Ручная стирка или химчистка",
      "Не выкручивать",
      "Сушить в разложенном виде",
      "Хранить на вешалке"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "cream", image: cardiganCream }
    ],
    relatedProducts: [1, 4]
  },
  {
    id: 3,
    name: "Водолазка базовая из мериноса",
    price: 9900,
    image: sweatearBeige,
    hoverImage: cardiganCream,
    category: "Водолазки",
    isNew: true,
    isFeatured: true,
    description: "Базовая водолазка из мериносовой шерсти - незаменимая вещь в гардеробе. Тонкий материал позволяет носить её под пиджаки и жакеты, создавая многослойные образы.",
    features: [
      "Облегающий силуэт",
      "Высокий воротник",
      "Эластичный материал",
      "Не деформируется",
      "Классический дизайн"
    ],
    materials: "95% мериносовая шерсть, 5% эластан",
    care: [
      "Машинная стирка на деликатном режиме",
      "Температура 30°C",
      "Не отжимать",
      "Сушить вертикально"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "beige", image: sweatearBeige },
      { name: "black", image: sweatearBeige },
      { name: "navy", image: sweatearBeige }
    ],
    relatedProducts: [1, 4]
  },
  {
    id: 4,
    name: "Джемпер с V-образным вырезом",
    price: 14500,
    image: cardiganCream,
    category: "Джемперы",
    description: "Элегантный джемпер с V-образным вырезом из премиальной мериносовой шерсти. Идеально подходит для создания деловых и повседневных образов.",
    features: [
      "V-образный вырез",
      "Классический крой",
      "Мягкая текстура",
      "Универсальная модель",
      "Премиум качество"
    ],
    materials: "100% мериносовая шерсть",
    care: [
      "Деликатная стирка",
      "Не тереть и не выкручивать",
      "Сушить горизонтально",
      "Гладить с изнаночной стороны"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "cream", image: cardiganCream },
      { name: "grey", image: cardiganCream }
    ],
    relatedProducts: [2, 3]
  }
];