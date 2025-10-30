import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Search,
  Loader2,
  ExternalLink,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpCenter {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "counseling" | "crisis";
  address: string;
  city: string;
  country: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  distance?: number;
  website?: string;
  services: string[];
}

// Worldwide help centers database
const worldwideHelpCenters: HelpCenter[] = [
  // United States
  {
    id: "us-1",
    name: "NYC Mental Health Center",
    type: "clinic",
    address: "123 Broadway",
    city: "New York",
    country: "United States",
    phone: "+1 (212) 555-0100",
    hours: "Mon-Fri 9AM-6PM",
    lat: 40.7128,
    lng: -74.0060,
    website: "https://example.com",
    services: ["Therapy", "Psychiatry", "Crisis Support"]
  },
  {
    id: "us-2",
    name: "LA Crisis Center",
    type: "crisis",
    address: "456 Sunset Blvd",
    city: "Los Angeles",
    country: "United States",
    phone: "+1 (323) 555-0200",
    hours: "24/7",
    lat: 34.0522,
    lng: -118.2437,
    services: ["24/7 Crisis", "Emergency Care"]
  },
  {
    id: "us-3",
    name: "Chicago Counseling Center",
    type: "counseling",
    address: "789 Michigan Ave",
    city: "Chicago",
    country: "United States",
    phone: "+1 (312) 555-0300",
    hours: "Mon-Sat 8AM-8PM",
    lat: 41.8781,
    lng: -87.6298,
    services: ["Individual Therapy", "Group Therapy"]
  },
  // United Kingdom
  {
    id: "uk-1",
    name: "London Mental Health Trust",
    type: "hospital",
    address: "10 Harley Street",
    city: "London",
    country: "United Kingdom",
    phone: "+44 20 7946 0958",
    hours: "24/7",
    lat: 51.5074,
    lng: -0.1278,
    services: ["Emergency Care", "Inpatient", "Outpatient"]
  },
  {
    id: "uk-2",
    name: "Manchester Crisis Support",
    type: "crisis",
    address: "25 Oxford Road",
    city: "Manchester",
    country: "United Kingdom",
    phone: "+44 161 555 0100",
    hours: "24/7",
    lat: 53.4808,
    lng: -2.2426,
    services: ["Crisis Intervention", "Helpline"]
  },
  // Canada
  {
    id: "ca-1",
    name: "Toronto Mental Health Services",
    type: "clinic",
    address: "100 Queen Street",
    city: "Toronto",
    country: "Canada",
    phone: "+1 (416) 555-0400",
    hours: "Mon-Fri 9AM-5PM",
    lat: 43.6532,
    lng: -79.3832,
    services: ["Assessment", "Treatment", "Support Groups"]
  },
  {
    id: "ca-2",
    name: "Vancouver Crisis Centre",
    type: "crisis",
    address: "1234 Granville St",
    city: "Vancouver",
    country: "Canada",
    phone: "+1 (604) 555-0500",
    hours: "24/7",
    lat: 49.2827,
    lng: -123.1207,
    services: ["Crisis Line", "Walk-in Support"]
  },
  // Australia
  {
    id: "au-1",
    name: "Sydney Mental Health Hub",
    type: "clinic",
    address: "50 George Street",
    city: "Sydney",
    country: "Australia",
    phone: "+61 2 5550 0600",
    hours: "Mon-Fri 8AM-6PM",
    lat: -33.8688,
    lng: 151.2093,
    services: ["Counseling", "Psychiatry", "Support"]
  },
  {
    id: "au-2",
    name: "Melbourne Crisis Support",
    type: "crisis",
    address: "123 Collins Street",
    city: "Melbourne",
    country: "Australia",
    phone: "+61 3 5550 0700",
    hours: "24/7",
    lat: -37.8136,
    lng: 144.9631,
    services: ["Emergency Support", "Crisis Counseling"]
  },
  // India
  {
    id: "in-1",
    name: "Mumbai Mental Wellness Center",
    type: "clinic",
    address: "45 Marine Drive",
    city: "Mumbai",
    country: "India",
    phone: "+91 22 5550 0800",
    hours: "Mon-Sat 9AM-7PM",
    lat: 19.0760,
    lng: 72.8777,
    services: ["Therapy", "Counseling", "Family Support"]
  },
  {
    id: "in-2",
    name: "Delhi Crisis Helpline",
    type: "crisis",
    address: "10 Connaught Place",
    city: "New Delhi",
    country: "India",
    phone: "+91 11 5550 0900",
    hours: "24/7",
    lat: 28.6139,
    lng: 77.2090,
    services: ["24/7 Helpline", "Emergency Support"]
  },
  // Germany
  {
    id: "de-1",
    name: "Berlin Mental Health Clinic",
    type: "clinic",
    address: "Unter den Linden 1",
    city: "Berlin",
    country: "Germany",
    phone: "+49 30 5550 1000",
    hours: "Mon-Fri 9AM-6PM",
    lat: 52.5200,
    lng: 13.4050,
    services: ["Psychotherapy", "Psychiatric Care"]
  },
  // France
  {
    id: "fr-1",
    name: "Paris Mental Health Center",
    type: "clinic",
    address: "10 Avenue des Champs-Élysées",
    city: "Paris",
    country: "France",
    phone: "+33 1 5550 1100",
    hours: "Mon-Fri 9AM-6PM",
    lat: 48.8566,
    lng: 2.3522,
    services: ["Consultation", "Therapy", "Support"]
  },
  // Japan
  {
    id: "jp-1",
    name: "Tokyo Mental Health Clinic",
    type: "clinic",
    address: "1-1-1 Shibuya",
    city: "Tokyo",
    country: "Japan",
    phone: "+81 3 5550 1200",
    hours: "Mon-Sat 9AM-7PM",
    lat: 35.6762,
    lng: 139.6503,
    services: ["Counseling", "Psychiatric Services"]
  },
  // Brazil
  {
    id: "br-1",
    name: "São Paulo Mental Health Center",
    type: "clinic",
    address: "Avenida Paulista 1000",
    city: "São Paulo",
    country: "Brazil",
    phone: "+55 11 5550 1300",
    hours: "Mon-Fri 8AM-6PM",
    lat: -23.5505,
    lng: -46.6333,
    services: ["Therapy", "Support Groups", "Crisis Support"]
  },
];

export const InteractiveHelpMap = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [helpCenters, setHelpCenters] = useState<HelpCenter[]>(worldwideHelpCenters);
  const [filteredCenters, setFilteredCenters] = useState<HelpCenter[]>(worldwideHelpCenters);
  const [selectedCenter, setSelectedCenter] = useState<HelpCenter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0, zoom: 2 });
  const { toast } = useToast();

  useEffect(() => {
    filterCenters();
  }, [searchQuery, selectedType, helpCenters]);

  const filterCenters = () => {
    let filtered = helpCenters;

    if (searchQuery) {
      filtered = filtered.filter(
        (center) =>
          center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          center.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          center.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          center.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter((center) => center.type === selectedType);
    }

    setFilteredCenters(filtered);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getUserLocation = () => {
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      toast({
        title: "Location not available",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setMapCenter({ lat: location.lat, lng: location.lng, zoom: 12 });

        const centersWithDistance = helpCenters.map((center) => ({
          ...center,
          distance: calculateDistance(location.lat, location.lng, center.lat, center.lng),
        }));

        centersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setHelpCenters(centersWithDistance);
        setIsLoadingLocation(false);

        toast({
          title: "Location found!",
          description: "Showing help centers near you",
        });
      },
      () => {
        setIsLoadingLocation(false);
        toast({
          title: "Location error",
          description: "Unable to get your location",
          variant: "destructive",
        });
      }
    );
  };

  const focusOnCenter = (center: HelpCenter) => {
    setSelectedCenter(center);
    setMapCenter({ lat: center.lat, lng: center.lng, zoom: 15 });
  };

  const getDirections = (center: HelpCenter) => {
    const destination = `${center.lat},${center.lng}`;
    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination}`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, "_blank");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "crisis":
        return "bg-red-500 text-white";
      case "hospital":
        return "bg-blue-500 text-white";
      case "clinic":
        return "bg-green-500 text-white";
      case "counseling":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getMapUrl = () => {
    const markers = filteredCenters
      .slice(0, 20)
      .map((center) => `${center.lat},${center.lng}`)
      .join("|");
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 1},${mapCenter.lat - 1},${mapCenter.lng + 1},${mapCenter.lat + 1}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar with Search and List */}
      <div className="lg:col-span-1 flex flex-col gap-4 max-h-[800px] overflow-hidden">
        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by city, country, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedType === null ? "default" : "outline"}
                onClick={() => setSelectedType(null)}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={selectedType === "crisis" ? "default" : "outline"}
                onClick={() => setSelectedType("crisis")}
                className={selectedType === "crisis" ? "bg-red-500" : ""}
              >
                Crisis
              </Button>
              <Button
                size="sm"
                variant={selectedType === "hospital" ? "default" : "outline"}
                onClick={() => setSelectedType("hospital")}
                className={selectedType === "hospital" ? "bg-blue-500" : ""}
              >
                Hospital
              </Button>
              <Button
                size="sm"
                variant={selectedType === "clinic" ? "default" : "outline"}
                onClick={() => setSelectedType("clinic")}
                className={selectedType === "clinic" ? "bg-green-500" : ""}
              >
                Clinic
              </Button>
              <Button
                size="sm"
                variant={selectedType === "counseling" ? "default" : "outline"}
                onClick={() => setSelectedType("counseling")}
                className={selectedType === "counseling" ? "bg-purple-500" : ""}
              >
                Counseling
              </Button>
            </div>

            <Button
              onClick={getUserLocation}
              disabled={isLoadingLocation}
              className="w-full bg-gradient-primary"
              size="sm"
            >
              {isLoadingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Location
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Help Centers List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-sm font-medium">
              {filteredCenters.length} Help Centers
            </p>
            {userLocation && (
              <Badge variant="outline" className="text-xs">
                <Navigation className="w-3 h-3 mr-1" />
                Sorted by distance
              </Badge>
            )}
          </div>
          {filteredCenters.map((center) => (
            <Card
              key={center.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedCenter?.id === center.id && "border-2 border-primary"
              )}
              onClick={() => focusOnCenter(center)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{center.name}</h3>
                    <Badge className={cn("text-xs flex-shrink-0", getTypeColor(center.type))}>
                      {center.type}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{center.city}, {center.country}</span>
                    </div>
                    {center.distance !== undefined && (
                      <div className="flex items-center gap-1.5 font-medium text-primary">
                        <Navigation className="w-3 h-3 flex-shrink-0" />
                        <span>{center.distance.toFixed(1)} miles away</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5">
                      <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{center.hours}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${center.phone}`;
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(center);
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Map View */}
      <div className="lg:col-span-2 relative">
        <Card className="h-[800px]">
          <CardContent className="p-0 h-full relative">
            <iframe
              src={getMapUrl()}
              className="w-full h-full rounded-lg"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Help Centers Map"
            />
            {selectedCenter && (
              <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl border-2 border-primary max-w-2xl mx-auto">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-tight mb-2">{selectedCenter.name}</h3>
                    <Badge className={cn("text-xs", getTypeColor(selectedCenter.type))}>
                      {selectedCenter.type}
                    </Badge>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedCenter(null)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{selectedCenter.address}, {selectedCenter.city}, {selectedCenter.country}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{selectedCenter.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{selectedCenter.hours}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => window.location.href = `tel:${selectedCenter.phone}`}
                    className="flex-1 bg-gradient-primary min-w-[120px]"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button
                    onClick={() => getDirections(selectedCenter)}
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    size="sm"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
                  {selectedCenter.website && (
                    <Button
                      onClick={() => window.open(selectedCenter.website, "_blank")}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
