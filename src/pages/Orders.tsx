import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: string;
  trackingId: string;
  date: string;
  time: string;
  address: string;
  products: OrderItem[];
  price: number;
  status: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/orders/${userId}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.orderId} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order #{order.orderId}</CardTitle>
                <span className="text-sm text-gray-500">
                  {order.date} at {order.time}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Tracking ID: {order.trackingId}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Delivery Address</h3>
                  <p className="text-gray-600">{order.address}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Items</h3>
                  {order.products.map((item) => (
                    <div 
                      key={item.productId}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="font-semibold">Order Status</p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-semibold">${order.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-600">
              No orders found
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
