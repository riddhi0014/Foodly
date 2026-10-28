import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";
import ErrorBoundary from "../components/ErrorBoundary";

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOrder(data);
    } catch (error) {
      console.log("fetchOrder error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !order) return;

    if (order.userId) {
      socket.emit("join", `user:${order.userId}`);
    }
    if (order._id) {
      socket.emit("join", `order:${order._id}`);
    }

    return () => {
      if (order.userId) {
        socket.emit("leave", `user:${order.userId}`);
      }
      if (order._id) {
        socket.emit("leave", `order:${order._id}`);
      }
    };
  }, [socket, order?.userId, order?._id]);

  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (!socket) return;

    const onRiderLocation = ({ latitude, longitude }: any) => {
      if (latitude != null && longitude != null) {
        setRiderLocation([latitude, longitude]);
      }
    };

    socket.on("rider:location", onRiderLocation);

    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return <p className="text-center text-gray-500 py-12">Loading order...</p>;
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">No order Found</p>
      </div>
    );
  }

  const hasDeliveryCoords =
    order.deliveryAddress?.latitude != null &&
    order.deliveryAddress?.longitude != null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Order #{order._id.slice(-6)}</h1>
      <div className="rounded-lg bg-blue-50 p-3 text-sm font-medium flex items-center justify-between">
        <span>
          Status:{" "}
          <span className="capitalize text-blue-700 font-semibold">
            {order.status.replace("_", " ")}
          </span>
        </span>
        {order.restaurantName && (
          <span className="text-xs text-gray-600">
            From: <b>{order.restaurantName}</b>
          </span>
        )}
      </div>

      {(order.status === "rider_assigned" || order.status === "picked_up") && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                🛵
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {order.riderName && !order.riderName.startsWith("http")
                    ? order.riderName
                    : "Delivery Partner Assigned"}
                </h3>
                <p className="text-xs text-green-600 font-medium">
                  {order.status === "picked_up"
                    ? "Order Picked Up • On the way to you"
                    : "Heading to restaurant for pickup"}
                </p>
              </div>
            </div>

            {order.riderPhone && (
              <a
                href={`tel:${order.riderPhone}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition"
              >
                <span>📞</span> Call
              </a>
            )}
          </div>

          <ErrorBoundary>
            {riderLocation && hasDeliveryCoords ? (
              <UserOrderMap
                riderLocation={riderLocation}
                deliveryLocation={[
                  order.deliveryAddress.latitude,
                  order.deliveryAddress.longitude,
                ]}
              />
            ) : (
              <div className="rounded-xl bg-white shadow-sm p-6 text-center space-y-3 border border-gray-100">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm font-medium text-gray-700">
                  Connecting to rider's live GPS...
                </p>
                <p className="text-xs text-gray-500">
                  Live location coordinates update automatically every few seconds.
                </p>
              </div>
            )}
          </ErrorBoundary>
        </div>
      )}

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-semibold">Items</h2>
        {order.items.map((item, i) => (
          <div className="flex justify-between text-sm" key={i}>
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-1">
        <h2 className="font-semibold">Delivery Address</h2>
        <p className="text-sm text-gray-600">
          {order.deliveryAddress?.fromattedAddress ||
            order.deliveryAddress?.formattedAddress ||
            "Address not available"}
        </p>
        {order.deliveryAddress?.mobile && (
          <p className="text-sm text-gray-600">
            Mobile: {order.deliveryAddress.mobile}
          </p>
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span>SubTotal</span> <span>₹{order.subTotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span> <span>₹{order.deliveryFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>PlatForm Fee</span> <span>₹{order.platfromFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total</span> <span>₹{order.totalAmount}</span>
        </div>

        <p className="text-xs text-gray-500">
          Payment Method: {order.paymentMethod}
        </p>
        <p className="text-xs text-gray-500">
          Payment Status: {order.paymentStatus}
        </p>
      </div>
    </div>
  );
};

export default OrderPage;
