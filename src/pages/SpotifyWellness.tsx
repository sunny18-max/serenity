import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import {
  Music,
  Play,
  ArrowLeft,
  Search,
  Heart,
  ExternalLink,
  Clock,
  Users,
  Sparkles,
  Volume2,
  Headphones,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  searchWellnessPlaylists,
  getWellnessCategories,
  getPlaylistTracks,
  formatDuration,
  type SpotifyPlaylist,
  type SpotifyTrack,
} from "@/lib/spotifyService";
import SpotifyPlayer from "@/components/SpotifyPlayer";

const SpotifyWellness = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlayerActive, setIsPlayerActive] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = getWellnessCategories();

  useEffect(() => {
    if (selectedCategory) {
      loadPlaylists(selectedCategory);
    }
  }, [selectedCategory]);

  const loadPlaylists = async (categoryId: string) => {
    setIsLoading(true);
    const category = categories.find((c) => c.id === categoryId);
    
    if (category) {
      try {
        const results = await searchWellnessPlaylists(category.query);
        setPlaylists(results);
        
        if (results.length === 0) {
          toast({
            title: "No Playlists Found",
            description: `No playlists available for ${category.name}. Try searching manually.`,
          });
        }
      } catch (error) {
        console.error("Error loading playlists:", error);
        toast({
          title: "Loading Failed",
          description: "Unable to load playlists. Please check your Spotify credentials.",
          variant: "destructive",
        });
        setPlaylists([]);
      }
    }
    
    setIsLoading(false);
  };

  const handlePlaylistClick = async (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist);
    setIsLoading(true);
    const playlistTracks = await getPlaylistTracks(playlist.id);
    setTracks(playlistTracks);
    setIsLoading(false);
    
    // Activate player if tracks have previews
    const hasPreview = playlistTracks.some(track => track.previewUrl);
    if (hasPreview) {
      setIsPlayerActive(true);
      toast({
        title: "Player Ready",
        description: "Click play to start listening!",
      });
    } else {
      toast({
        title: "No Previews Available",
        description: "This playlist doesn't have preview clips. Open in Spotify to listen.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setSelectedCategory(null);
    
    try {
      const results = await searchWellnessPlaylists(searchQuery);
      setPlaylists(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: `No playlists found for "${searchQuery}". Try different keywords.`,
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${results.length} playlists for "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Unable to search playlists. Please check your connection and try again.",
        variant: "destructive",
      });
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayOnSpotify = (url: string) => {
    window.open(url, "_blank");
    toast({
      title: "Opening Spotify",
      description: "Launching your playlist in Spotify...",
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Spotify-themed gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-green-950 opacity-90" />
      
      <div className={`relative z-10 container mx-auto px-6 py-8 ${isPlayerActive ? 'pb-40' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-green-400 hover:bg-green-950/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-white">Powered by Spotify</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Mental Wellness Music
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Curated playlists designed to support your mental health journey
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Search for playlists (e.g., 'calm', 'focus', 'sleep')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Categories */}
        {!selectedPlaylist && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-green-500" />
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    selectedCategory === category.id
                      ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/50"
                      : "bg-gray-900 border-gray-700 hover:border-green-500/50 hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-400">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Playlists Grid */}
        {!selectedPlaylist && playlists.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Search Results"}
            </h2>
            {isLoading ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-gray-900 border-gray-700 animate-pulse">
                    <div className="h-48 bg-gray-800 rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-800 rounded mb-2" />
                      <div className="h-3 bg-gray-800 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {playlists.map((playlist) => (
                  <Card
                    key={playlist.id}
                    className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-all duration-300 cursor-pointer group overflow-hidden hover:shadow-xl hover:shadow-green-500/20"
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={playlist.image}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-black ml-1" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-1 line-clamp-1">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                        {playlist.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Music className="w-3 h-3" />
                        <span>{playlist.trackCount} tracks</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Playlist Details */}
        {selectedPlaylist && (
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedPlaylist(null);
                setTracks([]);
              }}
              className="text-white hover:text-green-400 hover:bg-green-950/50 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Playlists
            </Button>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-1">
                <Card className="bg-gradient-to-br from-gray-900 to-green-950/30 border-green-500/30 overflow-hidden">
                  <img
                    src={selectedPlaylist.image}
                    alt={selectedPlaylist.name}
                    className="w-full aspect-square object-cover"
                  />
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedPlaylist.name}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                      {selectedPlaylist.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                      <div className="flex items-center gap-1">
                        <Music className="w-4 h-4" />
                        <span>{selectedPlaylist.trackCount} tracks</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          setIsPlayerActive(true);
                          toast({
                            title: "Player Activated",
                            description: "Music player ready at the bottom of the page!",
                          });
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
                        disabled={!tracks.some(t => t.previewUrl)}
                      >
                        <Headphones className="w-4 h-4 mr-2" />
                        Play Here (30s Previews)
                      </Button>
                      <Button
                        onClick={() => handlePlayOnSpotify(selectedPlaylist.externalUrl)}
                        variant="outline"
                        className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Spotify (Full Songs)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-green-500" />
                      Tracks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 bg-gray-800 rounded" />
                            <div className="flex-1">
                              <div className="h-4 bg-gray-800 rounded mb-2" />
                              <div className="h-3 bg-gray-800 rounded w-2/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-2">
                          {tracks.map((track, index) => (
                            <div
                              key={track.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group"
                              onClick={() => handlePlayOnSpotify(track.externalUrl)}
                            >
                              <span className="text-gray-500 w-6 text-sm">{index + 1}</span>
                              <img
                                src={track.albumArt}
                                alt={track.album}
                                className="w-12 h-12 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate group-hover:text-green-400 transition-colors">
                                  {track.name}
                                </p>
                                <p className="text-gray-400 text-sm truncate">
                                  {track.artists.join(", ")}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                {track.previewUrl && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-green-400"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const audio = new Audio(track.previewUrl!);
                                      audio.play();
                                      toast({
                                        title: "Preview Playing",
                                        description: "30-second preview",
                                      });
                                    }}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                )}
                                <span className="text-gray-500 text-sm">
                                  {formatDuration(track.duration)}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-green-400"
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedPlaylist && playlists.length === 0 && !isLoading && selectedCategory && (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No playlists found</h3>
            <p className="text-gray-500">Try selecting a different category or search term</p>
          </div>
        )}

        {/* Info Banner */}
        <Card className="mt-12 bg-gradient-to-r from-green-950/50 to-gray-900 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Personalized Music Therapy
                </h3>
                <p className="text-gray-400 text-sm">
                  Music has been scientifically proven to reduce anxiety, improve mood, and enhance
                  relaxation. Our curated playlists are specifically designed to support your mental
                  wellness journey. Listen regularly for best results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embedded Spotify Player */}
      {isPlayerActive && selectedPlaylist && tracks.length > 0 && (
        <SpotifyPlayer
          playlist={{
            id: selectedPlaylist.id,
            name: selectedPlaylist.name,
            image: selectedPlaylist.image,
          }}
          tracks={tracks}
          onClose={() => setIsPlayerActive(false)}
        />
      )}
    </div>
  );
};

export default SpotifyWellness;
