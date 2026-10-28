import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "../utils/leaflet-setup";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";
import { realtimeService } from "../main";
import { useSocket } from "../context/SocketContext";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
}

const riderIcon = new L.DivIcon({
  html: "🛵",
  iconSize: [30, 30],
  className: "",
});

const deliveryIcon = new L.DivIcon({
  html: "📦",
  iconSize: [30, 30],
  className: "",
});

interface Props {
  order: IOrder;
}

const Routing = ({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    const RoutingMachine =
      (L as any).Routing ||
      (typeof window !== "undefined" && (window as any).L?.Routing) ||
      (typeof globalThis !== "undefined" && (globalThis as any).L?.Routing);

    if (!RoutingMachine || !RoutingMachine.control) {
      console.warn("Leaflet Routing Machine is not ready yet.");
      return;
    }

    let control: any;
    try {
      control = RoutingMachine.control({
        waypoints: [L.latLng(from), L.latLng(to)],
        lineOptions: {
          styles: [{ color: "#E23744", weight: 5 }],
        },
        addWaypoints: false,
        draggableWaypoints: false,
        show: false,
        createMarker: () => null,
        router: RoutingMachine.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
      }).addTo(map);
    } catch (err) {
      console.error("Failed to add routing control:", err);
    }

    return () => {
      if (control) {
        try {
          map.removeControl(control);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [from, to, map]);

  return null;
};

const RiderOrderMap = ({ order }: Props) => {
  const { socket } = useSocket();
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null
  );

  if (
    !order?.deliveryAddress ||
    order.deliveryAddress.latitude == null ||
    order.deliveryAddress.longitude == null
  ) {
    return null;
  }

  const deliveryLocation: [number, number] = [
    order.deliveryAddress.latitude,
    order.deliveryAddress.longitude,
  ];

  useEffect(() => {
    if (!order?.userId) return;

    const internalKey = (
      import.meta.env.VITE_INTERNAL_SERVICE_KEY ||
      "jdfienf12345@@@@##4$$$%%%jsadfjlajdf"
    ).trim();

    const fetchLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          setRiderLocation([latitude, longitude]);

          // Direct socket emit for real-time responsiveness
          if (socket) {
            socket.emit("rider:location:send", {
              room: `user:${order.userId}`,
              latitude,
              longitude,
            });
            if (order._id) {
              socket.emit("rider:location:send", {
                room: `order:${order._id}`,
                latitude,
                longitude,
              });
            }
          }

          // HTTP fallback to internal emit
          axios.post(
            `${realtimeService}/api/v1/internal/emit`,
            {
              event: "rider:location",
              room: `user:${order.userId}`,
              payload: { latitude, longitude },
            },
            {
              headers: {
                "x-internal-key": internalKey,
              },
            }
          ).catch((err) => console.log("Emit location error:", err));

          if (order._id) {
            axios.post(
              `${realtimeService}/api/v1/internal/emit`,
              {
                event: "rider:location",
                room: `order:${order._id}`,
                payload: { latitude, longitude },
              },
              {
                headers: {
                  "x-internal-key": internalKey,
                },
              }
            ).catch(() => {});
          }
        },
        (err) => console.log("Location Error:", err),
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);

    return () => clearInterval(interval);
  }, [order?.userId, order?._id, socket]);

  if (!riderLocation) return null;
  return (
    <div className="rounded-xl bg-white shadow-sm p-3">
      <MapContainer
        center={riderLocation}
        zoom={14}
        className="h-87.5 w-full rounded-lg"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={riderLocation} icon={riderIcon}>
          <Popup>You (Rider)</Popup>
        </Marker>
        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>Delivery Location</Popup>
        </Marker>
        <Routing from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default RiderOrderMap;
