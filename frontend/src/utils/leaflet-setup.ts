import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
  (window as any).L = L;
}
if (typeof globalThis !== "undefined") {
  (globalThis as any).L = L;
}

export default L;
