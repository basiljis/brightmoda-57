import { useEffect } from 'react';
import CartItems from '@/components/profile/CartItems';

const CartPage = () => {
  useEffect(() => {
    document.title = 'Корзина - Shoplet';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        <CartItems />
      </div>
    </div>
  );
};

export default CartPage;