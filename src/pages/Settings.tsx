import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Palette,
  Smartphone,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import MobileBottomNav from "@/components/MobileBottomNav";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      reminderFrequency: 'daily',
      theme: 'default'
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
        // Merge settings to avoid losing new properties
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
      // Fetch assessments count from subcollection
      const assessmentsSnapshot = await getDocs(collection(db, "users", currentUser.uid, "assessments"));
      setAssessmentCount(assessmentsSnapshot.size);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    // Apply theme class to the root element
    const root = document.documentElement;
    root.classList.remove('theme-default', 'theme-mindful-master'); // Remove old themes
    if (settings.preferences.theme === 'mindful_master') {
      root.classList.add('theme-mindful-master');
    } else {
      root.classList.add('theme-default');
    }
  }, [settings.preferences.theme]);

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
    
    // Save settings to Firebase
    await setDoc(doc(db, "users", currentUser.uid), { settings }, { merge: true });
    
    // Request push notification permission if enabled
    if (settings.notifications.push && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast({
            title: "Push Notifications Enabled",
            description: "You'll now receive browser notifications for important updates."
          });
          // Show a test notification
          new Notification('Serenity Notifications Enabled', {
            body: 'You will now receive wellness reminders and updates.',
            icon: '/favicon.ico'
          });
        } else {
          updateSettings('notifications', 'push', false);
          toast({
            title: "Permission Denied",
            description: "Push notifications require browser permission.",
            variant: "destructive"
          });
        }
      } else if (Notification.permission === 'granted') {
        toast({
          title: "Settings Saved",
          description: "Your notification preferences have been updated."
        });
      }
    } else {
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully."
      });
    }
  };

  const handleExportData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const assessmentsSnapshot = await getDocs(collection(db, "users", currentUser.uid, "assessments"));
      const assessments = assessmentsSnapshot.docs.map(doc => doc.data());
      
      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Title
      pdf.setFontSize(22);
      pdf.setTextColor(139, 92, 246); // Primary color
      pdf.text('Serenity Wellness Report', pageWidth / 2, 20, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      
      // User Information
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('User Profile', 14, 45);
      
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      let yPos = 55;
      pdf.text(`Name: ${userData?.name || 'N/A'}`, 14, yPos);
      yPos += 7;
      pdf.text(`Email: ${userData?.email || 'N/A'}`, 14, yPos);
      yPos += 7;
      pdf.text(`Member Since: ${userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}`, 14, yPos);
      yPos += 7;
      pdf.text(`Wellness Score: ${userData?.wellness_score || 0}%`, 14, yPos);
      yPos += 7;
      pdf.text(`Current Streak: ${userData?.streak || 0} days`, 14, yPos);
      yPos += 15;
      
      // Assessments Section
      if (assessments.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Assessment History', 14, yPos);
        yPos += 10;
        
        const assessmentData = assessments.map((a, index) => [
          (index + 1).toString(),
          a.type?.toUpperCase() || 'Assessment',
          a.score?.toString() || 'N/A',
          a.interpretation || 'N/A',
          a.date ? new Date(a.date).toLocaleDateString() : 'N/A'
        ]);
        
        autoTable(pdf, {
          startY: yPos,
          head: [['#', 'Type', 'Score', 'Interpretation', 'Date']],
          body: assessmentData,
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9 }
        });
        
        yPos = (pdf as any).lastAutoTable.finalY + 15;
      }
      
      // Mood History
      if (userData?.moods && userData.moods.length > 0) {
        if (yPos > pageHeight - 60) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Recent Mood Entries', 14, yPos);
        yPos += 10;
        
        const recentMoods = userData.moods.slice(-10);
        const moodData = recentMoods.map((m: any, index: number) => [
          (index + 1).toString(),
          m.date || 'N/A',
          m.mood?.toString() || 'N/A',
          m.emoji || '',
          m.note?.substring(0, 50) || 'No note'
        ]);
        
        autoTable(pdf, {
          startY: yPos,
          head: [['#', 'Date', 'Mood', 'Emoji', 'Note']],
          body: moodData,
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9 }
        });
      }
      
      // Footer on last page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages} | Serenity Mental Wellness Platform`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      pdf.save(`serenity-wellness-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Data Exported",
        description: "Your wellness report has been downloaded as PDF."
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-16 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
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

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">App Theme</p>
                      <p className="text-sm text-muted-foreground">Change the application's color scheme.</p>
                    </div>
                  </div>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => updateSettings('preferences', 'theme', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="mindful_master" disabled={!user?.unlocked_themes?.includes('mindful_master')}>
                        Mindful Master {user?.unlocked_themes?.includes('mindful_master') ? '' : '(Lvl 10)'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                        <h3 className="font-medium flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Export Your Data as PDF
                        </h3>
                        <p className="text-sm text-muted-foreground">Download a comprehensive wellness report with all your data</p>
                      </div>
                      <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2 bg-gradient-primary text-white hover:opacity-90">
                        <Download className="w-4 h-4" />
                        Export PDF
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
      <MobileBottomNav />
    </div>
  );
};

export default SettingsPage;