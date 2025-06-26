import { IOrder, selectOrders } from "@/redux/features/order/orderSlice";


// Utility function to get orders by user email
export const getOrdersByUserEmail = (userEmail: string) => {
  
  return (state: { orders: { orders: IOrder[] } }): IOrder[] => {
    const orders = selectOrders(state);
    console.log("filtering for : ", userEmail)
  console.log("filtering from : ", orders)
  
    return orders.filter(order => order.userEmail === userEmail);
  };
};