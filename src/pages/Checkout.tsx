import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

interface ShippingInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export default function Checkout() {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      userId,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
      paymentDetails: {
        cardNumber: paymentInfo.cardNumber,
        expiryDate: paymentInfo.expiryDate
      }
    };

    try {
      const response = await axios.post('/api/cart/place-order', orderData);
      const { orderId, trackingId } = response.data;
      navigate(`/order-confirmation/${orderId}`, { 
        state: { trackingId, orderDetails: orderData } 
      });
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <form className="space-y-4">
              <Input
                placeholder="Address"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                required
              />
              <Input
                placeholder="City"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                required
              />
              <Input
                placeholder="Postal Code"
                value={shippingInfo.postalCode}
                onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                required
              />
              <Input
                placeholder="Country"
                value={shippingInfo.country}
                onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                required
              />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <form className="space-y-4">
              <Input
                placeholder="Card Number"
                value={paymentInfo.cardNumber}
                onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                maxLength={16}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="MM/YY"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                  maxLength={5}
                  required
                />
                <Input
                  placeholder="CVV"
                  value={paymentInfo.cvv}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                  maxLength={3}
                  type="password"
                  required
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button 
          onClick={handleCheckout} 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!shippingInfo.address || !paymentInfo.cardNumber}
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
