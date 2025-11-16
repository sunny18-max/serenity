import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Navigation, Phone, Loader2, AlertCircle } from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface HelpCenter {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  lat: number;
  lng: number;
  distance?: number; // meters
  website?: string;
}

// Fix Leaflet's default icon path when bundled
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function MapUpdater({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend(e) {
      const center = e.target.getCenter();
      onMove(center.lat, center.lng);
    },
  });
  return null;
}

export const HelpCenterMap = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [helpCenters, setHelpCenters] = useState<HelpCenter[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const mapRef = useRef<any>(null);

  const defaultCenter = useMemo(() => ({ lat: 20.5937, lng: 78.9629 }), []); // India center fallback

  const metersToMiles = (m: number) => m / 1609.344;

  const fetchNearby = async (lat: number, lng: number, radius = 5000) => {
    setIsLoading(true);
    // Overpass QL - search for amenity nodes/ways within radius
    const query = `[
      out:json][timeout:25];
      (
        node(around:${radius},${lat},${lng})[amenity~"hospital|clinic|doctors|social_facility|pharmacy|asylum|healthcare"];
        way(around:${radius},${lat},${lng})[amenity~"hospital|clinic|doctors|social_facility|pharmacy|asylum|healthcare"];
        relation(around:${radius},${lat},${lng})[amenity~"hospital|clinic|doctors|social_facility|pharmacy|asylum|healthcare"];
      );
      out center 20;`;

    try {
      const resp = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: `data=${encodeURIComponent(query)}`,
      });
      const data = await resp.json();
      if (!data.elements) {
        setHelpCenters([]);
        setIsLoading(false);
        return;
      }

      const centers: HelpCenter[] = data.elements
        .map((el: any) => {
          const latVal = el.lat ?? el.center?.lat;
          const lonVal = el.lon ?? el.center?.lon;
          if (!latVal || !lonVal) return null;
          const tags = el.tags || {};
          return {
            id: `${el.type}-${el.id}`,
            name: tags.name || tags.operator || tags.official_name || (tags.amenity || "Unknown"),
            type: tags.amenity || "unknown",
            address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean).join(", "),
            phone: tags['contact:phone'] || tags.phone || undefined,
            website: tags.website || tags.url || undefined,
            lat: latVal,
            lng: lonVal,
          } as HelpCenter;
        })
        .filter(Boolean);

      // compute distance
      const withDistance = centers.map((c) => ({
        ...c,
        distance: Math.round(
          (Math.hypot(c.lat - lat, c.lng - lng) * 111320) // approx meters
        ),
      }));

      withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setHelpCenters(withDistance);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Overpass fetch error", err);
      toast({ title: "Map error", description: "Unable to fetch nearby locations", variant: "destructive" });
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not available", description: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        // center map
        if (mapRef.current) {
          mapRef.current.setView([loc.lat, loc.lng], 14);
        }
        fetchNearby(loc.lat, loc.lng, 5000);
      },
      (err) => {
        setIsLoading(false);
        toast({ title: "Location error", description: err.message || "Unable to get location", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    // initial fetch at default center
    fetchNearby(defaultCenter.lat, defaultCenter.lng, 8000);
  }, [defaultCenter.lat, defaultCenter.lng]);

  const handleMapMove = (lat: number, lng: number) => {
    fetchNearby(lat, lng, 5000);
  };

  const openDirections = (c: HelpCenter) => {
    const dest = `${c.lat},${c.lng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : undefined;
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="lg:w-2/3 h-96 lg:h-[600px] rounded-lg overflow-hidden shadow-md bg-slate-900">
        <MapContainer
          center={[userLocation?.lat ?? defaultCenter.lat, userLocation?.lng ?? defaultCenter.lng]}
          zoom={userLocation ? 14 : 6}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater onMove={handleMapMove} />
          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>You are here</Popup>
              </Marker>
              <Circle center={[userLocation.lat, userLocation.lng]} radius={1000} pathOptions={{ color: "#60A5FA" }} />
            </>
          )}

          {helpCenters.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lng]} eventHandlers={{ click: () => setSelected(c.id) }}>
              <Popup>
                <div className="min-w-[180px]">
                  <strong>{c.name}</strong>
                  <div className="text-xs text-muted-foreground">{c.type}</div>
                  {c.address && <div className="text-xs">{c.address}</div>}
                  <div className="mt-2 flex gap-2">
                    {c.phone && (
                      <Button size="sm" onClick={() => (window.location.href = `tel:${c.phone}`)}>
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openDirections(c)}>
                      <Navigation className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="lg:w-1/3 space-y-3">
        <Card className="p-4 bg-gradient-to-b from-slate-800 to-slate-900 text-white border-0">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin /> Nearby Services
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-300">Showing nearby hospitals, clinics and welfare centres</div>
              <div>
                <Button size="sm" onClick={requestLocation} className="bg-gradient-to-r from-primary to-emerald-500 text-white">
                  <Navigation className="w-4 h-4 mr-1" />
                  {isLoading ? "Locating..." : "Use My Location"}
                </Button>
              </div>
            </div>

            <div className="max-h-[460px] overflow-auto space-y-2">
              {helpCenters.length === 0 && !isLoading && (
                <div className="text-sm text-slate-400">No nearby services found in this area.</div>
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Loader2 className="animate-spin" /> Searching nearby...
                </div>
              )}

              {helpCenters.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg cursor-pointer border ${selected === c.id ? "border-primary" : "border-slate-700"} bg-slate-800`}
                  onClick={() => {
                    setSelected(c.id);
                    mapRef.current?.setView([c.lat, c.lng], 16);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-xs text-slate-300">{c.type}</div>
                    </div>
                    <div className="text-xs text-slate-400">{c.distance ? `${(c.distance/1000).toFixed(1)} km` : ''}</div>
                  </div>
                  {c.address && <div className="text-xs text-slate-300 mt-1">{c.address}</div>}
                  <div className="mt-2 flex gap-2">
                    {c.phone && (
                      <Button size="sm" onClick={() => (window.location.href = `tel:${c.phone}`)}>
                        Call
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openDirections(c)}>
                      Directions
                    </Button>
                    {c.website && (
                      <Button size="sm" variant="outline" onClick={() => window.open(c.website, "_blank")}>Website</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 bg-slate-900 text-slate-300 border-0">
          <CardContent className="p-0">
            <div className="text-xs">These results come from OpenStreetMap (Overpass API). Verify before acting. In emergencies call local services.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
