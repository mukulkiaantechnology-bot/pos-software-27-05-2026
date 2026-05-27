import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '@/utils/api';
import { io } from 'socket.io-client';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const params = {};
      const userRole = (user.role || user.role_name || '').toUpperCase();
      
      // If customer, only show their orders. If admin/staff, show all.
      if (userRole === 'CUSTOMER') {
        params.userId = user.id;
      }

      const response = await api.get('/orders', { params });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchOrders();

    const handleNewOrder = (order) => {
      setOrders(prev => [order, ...prev]);
      
      if (user?.role_name === 'chef') {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance("New order is coming");
          window.speechSynthesis.speak(utterance);
        }
      }

      addNotification({
        type: 'Kitchen',
        title: 'New Customer Order',
        message: `Order #${order.id} received.`,
        targetRole: 'CHEF'
      });
    };

    const handleStatusUpdate = (data) => {
      // Backend sends { id, status }, map it to the orders state
      const orderId = String(data.id || data.order_id);
      setOrders(prev => prev.map(o => String(o.id) === orderId ? { ...o, order_status: data.status } : o));
    };

    import('@/sockets/socket.service').then(module => {
      const socketService = module.default;
      socketService.on('new_order', handleNewOrder);
      socketService.on('order_update', handleStatusUpdate);
      socketService.on('order_status_updated', handleStatusUpdate);
    });

    return () => {
      import('@/sockets/socket.service').then(module => {
        const socketService = module.default;
        socketService.off('new_order');
        socketService.off('order_status_updated');
      });
    };
  }, [user, addNotification, fetchOrders]);

  const addOrder = async (cartItems, extraData = {}) => {
    try {
      // Build items array with full addon + size info
      const items = cartItems.map(item => {
        // Addon price sum per unit
        const parsedAddons = Array.isArray(item.selectedAddons)
          ? item.selectedAddons
          : (item.selectedAddons
              ? (() => { try { return JSON.parse(item.selectedAddons); } catch { return []; } })()
              : []);
        const addonPricePerUnit = parsedAddons.reduce((s, a) => s + (parseFloat(a.price) || 0), 0);

        const basePrice = parseFloat(item.price);
        const qty = item.qty || item.quantity || 1;
        const unitTotal = basePrice; // base price is already size-adjusted in cart
        const totalForItem = parseFloat(((unitTotal + addonPricePerUnit) * qty).toFixed(2));

        return {
          menu_item_id: item.itemId || item.id,
          quantity: qty,
          unit_price: unitTotal,
          total_price: totalForItem,
          addons: parsedAddons.length > 0 ? parsedAddons : null,
          size_name: item.sizeName || item.size_name || null,
          size_price: item.sizePrice || item.size_price || null
        };
      });

      // Correct subtotal includes addon prices
      const subtotal = items.reduce((acc, i) => acc + i.total_price, 0);
      const tax = extraData.tax || parseFloat((subtotal * 0.05).toFixed(2));
      const discount = extraData.discount || 0;
      const serviceChargePercent = extraData.serviceChargePercent || 0;
      const serviceChargeAmount = extraData.serviceChargeAmount || parseFloat((subtotal * serviceChargePercent / 100).toFixed(2));
      const total = parseFloat((subtotal + tax - discount + serviceChargeAmount).toFixed(2));

      const orderData = {
        order_number: `ORD-${Date.now()}`,
        subtotal,
        tax,
        discount,
        serviceChargePercent,
        service_charge_percent: serviceChargePercent,
        serviceChargeAmount,
        service_charge_amount: serviceChargeAmount,
        grand_total: total,
        order_type: extraData.type?.toLowerCase() || 'dine-in',
        table_id: extraData.tableId || null,
        customer_id: extraData.customerId || null,
        user_id: extraData.userId || null,
        payment_status: extraData.paymentStatus || 'pending',
        order_status: 'new',
        notes: extraData.notes || null
      };

      const response = await api.post('/orders', { orderData, items });
      fetchOrders();
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    // Optimistic UI update
    const previousOrders = [...orders];
    const normalizedStatus = status.toLowerCase();
    
    setOrders(prev => prev.map(o => 
      String(o.id) === String(orderId) ? { ...o, order_status: normalizedStatus } : o
    ));

    try {
      await api.patch(`/orders/${orderId}/status`, { status: normalizedStatus });
      addNotification({
        type: 'Order',
        title: 'Status Updated',
        message: `Order #${orderId} is now ${status}`,
        targetRole: 'WAITER'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      // Rollback on error
      setOrders(previousOrders);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  return (
    <OrdersContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus, 
      cancelOrder,
      loading,
      refreshOrders: fetchOrders 
    }}>
      {children}
    </OrdersContext.Provider>
  );
};
