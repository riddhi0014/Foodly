import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "../utils/leaflet-setup";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { useEffect } from "react";

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
      console.error("Failed to add routing control in UserOrderMap:", err);
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

interface props {
  riderLocation: [number, number];
  deliveryLocation: [number, number];
}

const UserOrderMap = ({ riderLocation, deliveryLocation }: props) => {
  if (
    !riderLocation ||
    riderLocation[0] == null ||
    riderLocation[1] == null ||
    !deliveryLocation ||
    deliveryLocation[0] == null ||
    deliveryLocation[1] == null
  ) {
    return null;
  }

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
          <Popup>Rider</Popup>
        </Marker>
        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>Delivery Location</Popup>
        </Marker>
        <Routing from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default UserOrderMap;
