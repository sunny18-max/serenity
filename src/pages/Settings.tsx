import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  Trash2,
  Download,
  ArrowLeft,
  Save,
  Moon,
  Sun,
  Volume2,
  Mail,
  Smartphone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      assessmentReminders: true,
      weeklyReports: true,
      sound: true
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      thirdPartyIntegration: false
    },
    preferences: {
      darkMode: false,
      language: 'en',
      reminderFrequency: 'daily'
    }
  });
  const [assessmentCount, setAssessmentCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser(data);
        if (data.settings) setSettings(data.settings);
      }
      // Fetch assessments count from subcollection
      const assessmentsSnapshot = await getDocs(collection(db, "users", currentUser.uid, "assessments"));
      setAssessmentCount(assessmentsSnapshot.size);
    };
    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !user) return;
    await setDoc(doc(db, "users", currentUser.uid), { ...user }, { merge: true });
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully."
    });
  };

  const handleSaveSettings = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    await setDoc(doc(db, "users", currentUser.uid), { settings }, { merge: true });
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully."
    });
  };

  const handleExportData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const assessmentsSnapshot = await getDocs(collection(db, "users", currentUser.uid, "assessments"));
    const assessments = assessmentsSnapshot.docs.map(doc => doc.data());
    const exportData = {
      user: userDoc.exists() ? userDoc.data() : null,
      assessments,
      settings,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `serenity-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded successfully."
    });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      await deleteDoc(doc(db, "users", currentUser.uid));
      // Optionally delete assessments subcollection (requires recursive delete in backend or admin SDK)
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
        variant: "destructive"
      });
      navigate("/auth");
    }
  };

  const updateSettings = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={user?.name || ""}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={user?.phone || ""}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Member Since</Label>
                    <Input
                      id="joinDate"
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your mental wellness journey progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{assessmentCount}</p>
                    <p className="text-sm text-muted-foreground">Assessments Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-wellness">{user?.wellness_score || 0}</p>
                    <p className="text-sm text-muted-foreground">Wellness Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-energy">{user?.streak || 0}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="text-sm">
                      {user?.has_completed_initial_assessment ? "Active" : "Getting Started"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive updates and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => updateSettings('notifications', 'email', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => updateSettings('notifications', 'push', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Assessment Reminders</p>
                        <p className="text-sm text-muted-foreground">Regular check-in reminders</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.assessmentReminders}
                      onCheckedChange={(checked) => updateSettings('notifications', 'assessmentReminders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Sound Notifications</p>
                        <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.sound}
                      onCheckedChange={(checked) => updateSettings('notifications', 'sound', checked)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your data sharing and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Anonymous Data Sharing</p>
                      <p className="text-sm text-muted-foreground">Help improve the platform with anonymous usage data</p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onCheckedChange={(checked) => updateSettings('privacy', 'dataSharing', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics</p>
                      <p className="text-sm text-muted-foreground">Allow analytics to improve your experience</p>
                    </div>
                    <Switch
                      checked={settings.privacy.analytics}
                      onCheckedChange={(checked) => updateSettings('privacy', 'analytics', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Third-party Integration</p>
                      <p className="text-sm text-muted-foreground">Allow integration with external health apps</p>
                    </div>
                    <Switch
                      checked={settings.privacy.thirdPartyIntegration}
                      onCheckedChange={(checked) => updateSettings('privacy', 'thirdPartyIntegration', checked)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export your data or delete your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Export Your Data</h3>
                        <p className="text-sm text-muted-foreground">Download all your assessment data and progress</p>
                      </div>
                      <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-destructive">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button
                        onClick={handleDeleteAccount}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;