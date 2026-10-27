import axios from "axios";
import Order from "../models/Order.js";
import { getChannel } from "./rabbitmq.js";

export const startPaymentConsumer = async () => {
  const channel = getChannel();

  channel.consume(process.env.PAYMENT_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());

      if (event.type !== "PAYMENT_SUCCESS") {
        channel.ack(msg);
        return;
      }

      const { orderId } = event.data;

      const order = await Order.findOneAndUpdate(
        {
          _id: orderId,
          paymentStatus: { $ne: "paid" },
        },
        {
          $set: {
            paymentStatus: "paid",
            status: "placed",
          },
          $unset: {
            expiresAt: 1,
          },
        },
        { new: true }
      );

      if (!order) {
        channel.ack(msg);
        return;
      }

      console.log("✅Order Placed:", order._id);

      //   socket work
      const rawUrl =
        process.env.REALTIME_SERVICE || "https://foodly-realtime.onrender.com";
      const realtimeUrl = rawUrl.replace(/\/+$/, "");
      const internalKey = (
        process.env.INTERNAL_SERVICE_KEY ||
        "jdfienf12345@@@@##4$$$%%%jsadfjlajdf"
      ).trim();

      try {
        await axios.post(
          `${realtimeUrl}/api/v1/internal/emit`,
          {
            event: "order:new",
            room: `restaurant:${order.restaurantId}`,
            payload: {
              orderId: order._id,
            },
          },
          {
            headers: {
              "x-internal-key": internalKey,
            },
            timeout: 5000,
          }
        );
      } catch (err: any) {
        console.warn("Realtime order:new emit error:", err?.message);
      }

      channel.ack(msg);
    } catch (error) {
      console.error("❌ Payment cosumer error:", error);
    }
  });
};
