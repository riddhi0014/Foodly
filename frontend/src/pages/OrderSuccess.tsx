import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const { fetchCart } = useAppData();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        await axios.post(`${utilsService}/api/payment/stripe/verify`, {
          sessionId,
        });

        toast.success("Payment successful 🎉");
        fetchCart();
      } catch (error) {
        toast.error("Stripe verification failed");
        console.log(error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm text-center space-y-4">
        <BiCheckCircle size={64} className="mx-auto text-green-500" />

        <h1 className="text-2xl font-bold text-gray-800">Payment Successful</h1>

        <p className="text-sm text-gray-500">
          Your order has been placed successfully 🎉
        </p>

        {sessionId && (
          <div className="rounded-lg bg-gray-50 p-3">
            <span className="text-gray-500 text-xs">Stripe Session ID: </span>
            <p className="font-mono break-all text-xs text-gray-700 mt-1">{sessionId}</p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white hover:bg-[#d32f3a]"
            onClick={() => navigate("/")}
          >
            Order More <BsArrowRight size={16} />
          </button>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white hover:bg-[#d32f3a]"
            onClick={() => navigate("/orders")}
          >
            Your orders <BsArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
