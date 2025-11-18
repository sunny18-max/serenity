import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Navigation, Phone, Loader2 } from "lucide-react";

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
  distance?: number;
  website?: string;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function MapUpdater({ onMove, mapRef }: { onMove: (centerLat: number, centerLng: number, bounds: L.LatLngBounds, zoom: number) => void, mapRef: React.MutableRefObject<any> }) {
  const map = useMapEvents({
    moveend(e) {
      const map = e.target;
      const c = map.getCenter();
      onMove(c.lat, c.lng, map.getBounds(), map.getZoom());
    }
  });
  
  // Set the map ref when the component mounts
  React.useEffect(() => {
    if (map && !mapRef.current) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  
  return null;
}

export const InteractiveHelpMap = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [helpCenters, setHelpCenters] = useState<HelpCenter[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const mapRef = useRef<any>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  const defaultCenter = useMemo(() => ({ lat: 20.5937, lng: 78.9629 }), []);

  const fetchNearbyByBBox = async (bounds: L.LatLngBounds, centerLat: number, centerLng: number, zoom: number, tryExpanded = true, expandFactor = 1) => {
    // Avoid huge global queries — require a minimum zoom
    if (zoom < 5) {
      setHelpCenters([]);
      setIsLoading(false);
      toast({ title: 'Zoom in', description: 'Please zoom in to search for nearby services in this area.', });
      return;
    }
    // Cancel previous fetch
    if (fetchAbortRef.current) {
      try { fetchAbortRef.current.abort(); } catch (_) {}
    }
    const ac = new AbortController();
    fetchAbortRef.current = ac;

    setIsLoading(true);

    // expand bounds slightly if requested
    const south = bounds.getSouth();
    const north = bounds.getNorth();
    const west = bounds.getWest();
    const east = bounds.getEast();
    // expand bbox by factor around center
    const latPad = (north - south) * (expandFactor - 1) * 0.5;
    const lngPad = (east - west) * (expandFactor - 1) * 0.5;
    const s = south - latPad;
    const n = north + latPad;
    const w = west - lngPad;
    const e = east + lngPad;

    const bboxStr = `${s},${w},${n},${e}`;

    const query = `[
      out:json][timeout:25];
      (
        node(${bboxStr})[amenity~"hospital|clinic|doctors|social_facility|pharmacy|asylum|healthcare"];
        way(${bboxStr})[amenity~"hospital|clinic|doctors|social_facility|pharmacy|asylum|healthcare"];
        relation(${bboxStr})[amenity~"hospital|clinic|doctors|social_facility|pharmacy|asylum|healthcare"];
      );
      out center 50;`;

    try {
      const resp = await fetch(OVERPASS_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, body: `data=${encodeURIComponent(query)}`, signal: ac.signal });
      if (!resp.ok) throw new Error(`Overpass error ${resp.status}`);
      const data = await resp.json();
      const centers: HelpCenter[] = (data.elements || []).map((el: any) => {
        const latVal = el.lat ?? el.center?.lat; const lonVal = el.lon ?? el.center?.lon; if (!latVal || !lonVal) return null;
        const tags = el.tags || {};
        return {
          id: `${el.type}-${el.id}`,
          name: tags.name || tags.operator || tags.amenity || "Unknown",
          type: tags.amenity || "unknown",
          address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean).join(', '),
          phone: tags['contact:phone'] || tags.phone || undefined,
          website: tags.website || tags.url || undefined,
          lat: latVal,
          lng: lonVal,
        } as HelpCenter;
      }).filter(Boolean);

      const withDistance = centers.map(c => ({ ...c, distance: Math.round(Math.hypot(c.lat - centerLat, c.lng - centerLng) * 111320) }));
      withDistance.sort((a,b) => (a.distance||0)-(b.distance||0));
      if (withDistance.length === 0 && tryExpanded && expandFactor < 4) {
        // expand bbox and retry (up to a few times)
        fetchNearbyByBBox(bounds, centerLat, centerLng, zoom, true, expandFactor * 2);
        return;
      }
      setHelpCenters(withDistance);
      setIsLoading(false);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return;
      }
      console.error(err);
      setIsLoading(false);
      toast({ title: 'Map error', description: 'Unable to fetch nearby locations', variant: 'destructive' });
    }
  };

  useEffect(() => {
    // Try to get user location on mount; fall back to default center
    const initializeMap = () => {
      if (navigator.geolocation) {
        const got = (pos: GeolocationPosition) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          // Use setTimeout to ensure map is ready
          setTimeout(() => {
            try { 
              mapRef.current?.setView([loc.lat, loc.lng], 13); 
              const map = mapRef.current;
              if (map) {
                fetchNearbyByBBox(map.getBounds(), loc.lat, loc.lng, map.getZoom());
              } else {
                const fakeBounds = L.latLngBounds([loc.lat - 0.05, loc.lng - 0.05], [loc.lat + 0.05, loc.lng + 0.05]);
                fetchNearbyByBBox(fakeBounds, loc.lat, loc.lng, 13);
              }
            } catch (_) {}
          }, 100);
        };
        const onerr = () => {
          // fallback
          setTimeout(() => {
            const map = mapRef.current;
            if (map) {
              fetchNearbyByBBox(map.getBounds(), defaultCenter.lat, defaultCenter.lng, map.getZoom());
            } else {
              const fakeBounds = L.latLngBounds([defaultCenter.lat - 0.5, defaultCenter.lng - 0.5], [defaultCenter.lat + 0.5, defaultCenter.lng + 0.5]);
              fetchNearbyByBBox(fakeBounds, defaultCenter.lat, defaultCenter.lng, 6);
            }
          }, 100);
        };
        navigator.geolocation.getCurrentPosition(got, onerr, { timeout: 5000 });
      } else {
        setTimeout(() => {
          const map = mapRef.current;
          if (map) {
            fetchNearbyByBBox(map.getBounds(), defaultCenter.lat, defaultCenter.lng, map.getZoom());
          } else {
            const fakeBounds = L.latLngBounds([defaultCenter.lat - 0.5, defaultCenter.lng - 0.5], [defaultCenter.lat + 0.5, defaultCenter.lng + 0.5]);
            fetchNearbyByBBox(fakeBounds, defaultCenter.lat, defaultCenter.lng, 6);
          }
        }, 100);
      }
    };

    // Delay initialization to ensure map is mounted
    const timer = setTimeout(initializeMap, 200);
    return () => clearTimeout(timer);
  }, [defaultCenter.lat, defaultCenter.lng]);

  const requestLocation = () => {
    if (!navigator.geolocation) { toast({ title: 'Location not available', description: 'Geolocation not supported', variant: 'destructive' }); return; }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(pos => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(loc); mapRef.current?.setView([loc.lat, loc.lng], 14); const map = mapRef.current; if (map) { fetchNearbyByBBox(map.getBounds(), loc.lat, loc.lng, map.getZoom()); } else { const fakeBounds = L.latLngBounds([loc.lat - 0.05, loc.lng - 0.05], [loc.lat + 0.05, loc.lng + 0.05]); fetchNearbyByBBox(fakeBounds, loc.lat, loc.lng, 13); } }, err => { setIsLoading(false); toast({ title: 'Location error', description: err.message || 'Unable to get location', variant: 'destructive' }); }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const handleMapMove = (lat:number,lng:number) => {
    // debounce rapid map moves and abort inflight requests
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      // we need bounds and zoom; try to get them from mapRef
      const map = mapRef.current;
      if (map) {
        fetchNearbyByBBox(map.getBounds(), lat, lng, map.getZoom());
      } else {
        const fakeBounds = L.latLngBounds([lat - 0.05, lng - 0.05], [lat + 0.05, lng + 0.05]);
        fetchNearbyByBBox(fakeBounds, lat, lng, 13);
      }
      debounceRef.current = null;
    }, 450);
  };

  const openDirections = (c: HelpCenter) => { const dest = `${c.lat},${c.lng}`; const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : undefined; const url = origin ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}` : `https://www.google.com/maps/search/?api=1&query=${dest}`; window.open(url,'_blank'); };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[520px]">
        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
          <Card className="p-4 bg-slate-900 text-white border-0">
            <CardHeader className="p-0 mb-2"><CardTitle className="flex items-center gap-2"><MapPin /> Nearby Services</CardTitle></CardHeader>
            <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                <div className="text-sm text-slate-300">Showing nearby hospitals, clinics and welfare centres</div>
                <Button size="sm" onClick={requestLocation} className="bg-gradient-to-br from-indigo-600 to-emerald-400 text-white hover:opacity-95">{isLoading? 'Locating...' : 'Use My Location'}</Button>
              </div>
              <div className="max-h-[420px] overflow-auto p-4 space-y-2">
                {isLoading && <div className="flex items-center gap-2 text-sm text-slate-300"><Loader2 className="animate-spin" /> Searching nearby...</div>}
                {!isLoading && helpCenters.length===0 && <div className="text-sm text-slate-400">No nearby services found.</div>}
                {helpCenters.map(c => (
                  <div key={c.id} className={`p-3 rounded-lg cursor-pointer border ${selected===c.id? 'border-primary':'border-slate-700'} bg-slate-800`} onClick={() => { setSelected(c.id); mapRef.current?.setView([c.lat,c.lng],16); }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{c.name}</div>
                        <div className="text-xs text-slate-300">{c.type}</div>
                      </div>
                      <div className="text-xs text-slate-400">{c.distance? `${(c.distance/1000).toFixed(1)} km`:''}</div>
                    </div>
                    {c.address && <div className="text-xs text-slate-300 mt-1">{c.address}</div>}
                    <div className="mt-2 flex gap-2">
                      {c.phone && <Button size="sm" onClick={() => window.location.href = `tel:${c.phone}`} className="bg-indigo-600 text-white px-3 py-1 text-sm rounded-md">Call</Button>}
                      <Button size="sm" variant="outline" onClick={() => openDirections(c)} className="border border-slate-600 text-white px-3 py-1 text-sm rounded-md bg-transparent">Directions</Button>
                      {c.website && <Button size="sm" variant="outline" onClick={() => window.open(c.website,'_blank')} className="border border-slate-600 text-white px-3 py-1 text-sm rounded-md bg-transparent">Website</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 h-full rounded-lg overflow-hidden shadow-md bg-slate-900">
          <MapContainer 
            center={[defaultCenter.lat, defaultCenter.lng]} 
            zoom={6} 
            style={{height:'100%', width:'100%'}}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater onMove={handleMapMove} mapRef={mapRef} />
            {userLocation && (
              <>
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>You are here</Popup>
                </Marker>
                <Circle 
                  center={[userLocation.lat, userLocation.lng]} 
                  radius={1000} 
                  pathOptions={{color:'#60A5FA'}}
                />
              </>
            )}
            {helpCenters.map(c => (
              <Marker 
                key={c.id} 
                position={[c.lat, c.lng]} 
                eventHandlers={{click: () => setSelected(c.id)}}
              >
                <Popup>
                  <div>
                    <strong>{c.name}</strong>
                    <div className="text-xs">{c.type}</div>
                    {c.address && <div className="text-xs">{c.address}</div>}
                    <div className="mt-2 flex gap-2">
                      {c.phone && (
                        <Button 
                          size="sm" 
                          onClick={() => window.location.href = `tel:${c.phone}`} 
                          className="bg-indigo-600 text-white px-3 py-1 text-sm rounded-md"
                        >
                          Call
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openDirections(c)} 
                        className="border border-slate-600 text-white px-3 py-1 text-sm rounded-md bg-transparent"
                      >
                        Directions
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
