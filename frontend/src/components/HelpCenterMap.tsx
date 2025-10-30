import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface HelpCenter {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "counseling" | "crisis";
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
  distance?: number;
  website?: string;
}

// Sample help centers (in a real app, this would come from an API or database)
const sampleHelpCenters: HelpCenter[] = [
  {
    id: "1",
    name: "City Mental Health Center",
    type: "clinic",
    address: "123 Main St, Downtown",
    phone: "(555) 123-4567",
    hours: "Mon-Fri 9AM-5PM",
    lat: 40.7128,
    lng: -74.0060,
    website: "https://example.com"
  },
  {
    id: "2",
    name: "Emergency Psychiatric Services",
    type: "crisis",
    address: "456 Hospital Ave",
    phone: "(555) 987-6543",
    hours: "24/7",
    lat: 40.7589,
    lng: -73.9851,
  },
  {
    id: "3",
    name: "Community Counseling Center",
    type: "counseling",
    address: "789 Wellness Blvd",
    phone: "(555) 456-7890",
    hours: "Mon-Sat 8AM-8PM",
    lat: 40.7489,
    lng: -73.9680,
  },
  {
    id: "4",
    name: "General Hospital - Psych Ward",
    type: "hospital",
    address: "321 Medical Center Dr",
    phone: "(555) 111-2222",
    hours: "24/7 Emergency",
    lat: 40.7306,
    lng: -73.9352,
  },
];

export const HelpCenterMap = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [helpCenters, setHelpCenters] = useState<HelpCenter[]>(sampleHelpCenters);
  const [selectedCenter, setSelectedCenter] = useState<HelpCenter | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
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
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      toast({
        title: "Location not available",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);

        // Calculate distances and sort by nearest
        const centersWithDistance = helpCenters.map((center) => ({
          ...center,
          distance: calculateDistance(
            location.lat,
            location.lng,
            center.lat,
            center.lng
          ),
        }));

        centersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setHelpCenters(centersWithDistance);
        setIsLoadingLocation(false);

        toast({
          title: "Location found!",
          description: "Showing help centers near you",
        });
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMessage = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setLocationError(errorMessage);
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    );
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "crisis":
        return "Crisis Center";
      case "hospital":
        return "Hospital";
      case "clinic":
        return "Mental Health Clinic";
      case "counseling":
        return "Counseling Center";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Request Card */}
      <Card className="shadow-medium border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Find Nearby Help Centers
          </CardTitle>
          <CardDescription>
            Locate mental health facilities and crisis centers near you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!userLocation ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enable location access to find the nearest mental health facilities and get directions.
              </p>
              <Button
                onClick={getUserLocation}
                disabled={isLoadingLocation}
                className="bg-gradient-primary"
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
              {locationError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{locationError}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">
                  Location enabled • Showing {helpCenters.length} nearby centers
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={getUserLocation}>
                <Navigation className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Centers List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {userLocation ? "Nearest Help Centers" : "Available Help Centers"}
        </h3>

        {helpCenters.map((center) => (
          <Card
            key={center.id}
            className={`shadow-medium transition-all cursor-pointer hover:shadow-glow ${
              selectedCenter?.id === center.id
                ? "border-2 border-primary"
                : "border border-primary/10"
            }`}
            onClick={() => setSelectedCenter(center)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{center.name}</CardTitle>
                    <Badge className={getTypeColor(center.type)}>
                      {getTypeLabel(center.type)}
                    </Badge>
                  </div>
                  {center.distance !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Navigation className="w-4 h-4" />
                      <span className="font-medium">
                        {center.distance.toFixed(1)} miles away
                      </span>
                    </div>
                  )}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{center.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{center.hours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${center.phone}`;
                  }}
                  className="bg-gradient-primary"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call {center.phone}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    getDirections(center);
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                {center.website && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(center.website, "_blank");
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Important Information</p>
              <p className="text-xs text-muted-foreground">
                These locations are for reference. Always call ahead to confirm hours and availability.
                In case of emergency, call 911 or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
