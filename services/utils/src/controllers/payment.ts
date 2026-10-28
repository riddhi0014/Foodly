import { Request, Response } from "express";
import axios from "axios";
import { razorpay } from "../config/razorpay.js";
import { verifyRazorpaySignature } from "../config/verifyRazorpay.js";
import { publishPaymentSuccess } from "../config/payment.producer.js";

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    const rawUrl =
      process.env.RESTAURANT_SERVICE || "https://foodly-restaurant.onrender.com";
    const restaurantUrl = rawUrl.replace(/\/+$/, "");
    const internalKey = (
      process.env.INTERNAL_SERVICE_KEY ||
      "jdfienf12345@@@@##4$$$%%%jsadfjlajdf"
    ).trim();

    const { data } = await axios.get(
      `${restaurantUrl}/api/order/payment/${orderId}`,
      {
        headers: {
          "x-internal-key": internalKey,
        },
        timeout: 5000,
      }
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: data.amount * 100,
      currency: "INR",
      receipt: orderId,
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID, 
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error?.response?.data || error?.message);
    res.status(error?.response?.status || 500).json({
      message: error?.response?.data?.message || "Payment initiation failed",
    });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return res.status(400).json({
      message: "Payment verification failed",
    });
  }

  await publishPaymentSuccess({
    orderId,
    paymentId: razorpay_payment_id,
    provider: "razorpay",
  });

  res.json({
    message: "Payment verified successfully",
  });
};


import dotenv from "dotenv";

dotenv.config();

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const payWithStripe = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    const rawUrl =
      process.env.RESTAURANT_SERVICE || "https://foodly-restaurant.onrender.com";
    const restaurantUrl = rawUrl.replace(/\/+$/, "");
    const internalKey = (
      process.env.INTERNAL_SERVICE_KEY ||
      "jdfienf12345@@@@##4$$$%%%jsadfjlajdf"
    ).trim();

    const { data } = await axios.get(
      `${restaurantUrl}/api/order/payment/${orderId}`,
      {
        headers: {
          "x-internal-key": internalKey,
        },
        timeout: 5000,
      }
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Foodly food order",
            },
            unit_amount: data.amount * 100,
          },
          quantity: 1,
        },
      ],

      metadata: {
        orderId,
      },

      success_url: `${process.env.FRONTEND_URL}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    });

    res.json({
      url: session.url,
    }); 
  } catch (error) {
    res.status(500).json({
      message: "stripe payment failed",
    });
  }
};

export const verifyStripe = async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(400).json({
        message: "Payment verifcation failed",
      });
    }

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return res.status(400).json({
        message: "orderid not found in stripe session",
      });
    }

    await publishPaymentSuccess({
      orderId,
      paymentId: sessionId,
      provider: "stripe",
    });

    res.json({
      message: "payment verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "stripe payment failed",
    });
  }
};
