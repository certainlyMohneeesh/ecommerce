import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    const response = await axios.get(`/api/cart/get-cart/${userId}`);
    setCartItems(response.data.items);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    await axios.post('/api/cart/update-quantity', {
      userId,
      productId,
      quantity
    });
    fetchCartItems();
  };

  const removeItem = async (productId: string) => {
    await axios.post('/api/cart/remove-item', {
      userId,
      productId
    });
    fetchCartItems();
  };

  const placeOrder = async () => {
    const orderData = {
      userId,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      address: "User's Address", // You can get this from a form or user profile
      price: total,
      productsOrdered: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    await axios.post('/api/cart/place-order', orderData);
    navigate('/order-confirmation');
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.productId} className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </Button>
              <span>{item.quantity}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                +
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => removeItem(item.productId)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {cartItems.length > 0 ? (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-xl font-semibold">
            Total: ${total.toFixed(2)}
          </div>
          <Button 
            onClick={placeOrder}
            className="bg-primary hover:bg-primary/90"
          >
            Place Order
          </Button>
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <Button 
            onClick={() => navigate('/products')}
            className="mt-4"
          >
            Continue Shopping
          </Button>
        </div>
      )}
    </div>
  );
}
