import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Mail, Lock, User, ArrowLeft, Phone, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";


const AuthPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 10
    });
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationCode: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle forgot password email input separately
  const handleForgotPasswordEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForgotPasswordEmail(e.target.value);
  };

  // Check if user exists - with better fallback handling
  const checkUserExists = async (email: string): Promise<{ exists: boolean; uid?: string }> => {
    try {
      const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001"; // Use environment variable
      const checkRes = await fetch(`${API_URL}/api/auth/check-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      if (checkRes.ok) {
        return await checkRes.json();
      } else {
        throw new Error(`API returned ${checkRes.status}`);
      }
    } catch (error) {
      console.warn("API check failed, using Firebase fallback:", error);
      // Return a special flag to indicate API failure
      throw new Error("API_UNAVAILABLE");
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      // Configure the action code settings for Firebase password reset
      const actionCodeSettings = {
        url: `${window.location.origin}/auth?mode=reset&oobCode=code`,
        handleCodeInApp: false
      };

      await sendPasswordResetEmail(auth, forgotPasswordEmail, actionCodeSettings);
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password. The link will expire in 24 hours.",
        variant: "default"
      });
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (error.code === 'auth/missing-android-pkg-name') {
        errorMessage = "Android package name is required for Android apps.";
      } else if (error.code === 'auth/missing-ios-bundle-id') {
        errorMessage = "iOS bundle ID is required for iOS apps.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  // Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let apiCheckFailed = false;
      
      // Try API check first, but don't block signin if it fails
      try {
        const checkResult = await checkUserExists(formData.email);
        
        // If API worked and user doesn't exist
        if (!checkResult.exists) {
          toast({
            title: "Account not found",
            description: "Please sign up first to create an account.",
            variant: "destructive"
          });
          setActiveTab("signup");
          setIsLoading(false);
          return;
        }
      } catch (error: any) {
        if (error.message === "API_UNAVAILABLE") {
          apiCheckFailed = true;
          console.log("API unavailable, proceeding with Firebase authentication");
          // Don't return here - continue with Firebase auth
        } else {
          console.error("Unexpected error during API check:", error);
          // Continue with Firebase auth even for other errors
        }
      }

      // Firebase sign in (this will work regardless of API status)
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Get user profile from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          toast({
            title: `Welcome back, ${userDoc.data().name || "User"}!`,
            description: "You've been signed in successfully."
          });
        } else {
          toast({
            title: `Welcome back!`,
            description: "You've been signed in successfully."
          });
        }
      } catch (firestoreError) {
        console.warn("Firestore error:", firestoreError);
        toast({
          title: `Welcome back!`,
          description: "You've been signed in successfully."
        });
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "Invalid credentials. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email. Please sign up first.";
        setActiveTab("signup");
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address. Please check your email.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      // Validate password strength
      if (formData.password.length < 8) {
        toast({
          title: "Error",
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Check if user exists using localhost API (optional - skip if API fails)
      try {
        const checkResult = await checkUserExists(formData.email);
        if (checkResult.exists) {
          toast({
            title: "User already exists",
            description: "Please sign in.",
            variant: "destructive"
          });
          setActiveTab("signin");
          setIsLoading(false);
          return;
        }
      } catch (error: any) {
        if (error.message !== "API_UNAVAILABLE") {
          throw error;
        }
        // If API is unavailable, continue with signup anyway
        console.log("API unavailable, proceeding with signup");
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // Create user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        weekly_progress: [],
        insights: [],
        wellness_score: 0,
        streak: 0,
        assessments_count: 0,
        has_completed_initial_assessment: false,
        moods: [],
        last_login: null,
        createdAt: new Date().toISOString()
      });
      toast({
        title: "Success!",
        description: "Account created successfully. Welcome to Serenity!"
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = "Sign up failed. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please sign in.";
        setActiveTab("signin");
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address. Please check your email.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Create user profile in Firestore if not exists
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          name: result.user.displayName || "",
          email: result.user.email || "",
          phone: "",
          weekly_progress: [],
          insights: [],
          wellness_score: 0,
          streak: 0,
          assessments_count: 0,
          has_completed_initial_assessment: false,
          moods: [],
          last_login: null,
          createdAt: new Date().toISOString()
        });
      }
      toast({
        title: `Welcome, ${result.user.displayName || "User"}!`,
        description: "Signed in with Google."
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Error",
        description: error.message || "Google sign-in failed.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Modal
  const ForgotPasswordModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you instructions to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgotPasswordEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="forgotPasswordEmail"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 bg-white border-slate-200 focus:border-indigo-400"
                  value={forgotPasswordEmail}
                  onChange={handleForgotPasswordEmailChange}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                }}
                disabled={isForgotPasswordLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isForgotPasswordLoading}
              >
                {isForgotPasswordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : "Send Reset Link"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4"
      data-aos="fade-in"
    >
      <div id="recaptcha-container"></div>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && <ForgotPasswordModal />}

      <div 
        className="relative w-full max-w-md"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-slate-600 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Logo */}
        <div 
          className="text-center mb-8"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Serenity
          </h1>
          <p className="text-slate-600 mt-2">Your mental wellness journey starts here</p>
        </div>

        <Card 
          className="shadow-xl border-0 bg-white/80 backdrop-blur-sm"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800">Welcome</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="space-y-6"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <TabsList 
                className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg"
                data-aos="fade-up"
                data-aos-delay="450"
              >
                <TabsTrigger 
                  value="signin" 
                  className={cn(
                    "data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm",
                    "rounded-md py-2 text-sm font-medium transition-all"
                  )}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className={cn(
                    "data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm",
                    "rounded-md py-2 text-sm font-medium transition-all"
                  )}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In Form */}
              <TabsContent 
                value="signin"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 bg-white border-slate-200 focus:border-indigo-400"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 bg-white border-slate-200 focus:border-indigo-400"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-slate-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-indigo-600 hover:underline text-sm"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Form */}
              <TabsContent 
                value="signup"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        className="pl-10 bg-white border-slate-200 focus:border-indigo-400"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 bg-white border-slate-200 focus:border-indigo-400"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="pl-10 bg-white border-slate-200 focus:border-indigo-400"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10 bg-white border-slate-200 focus:border-indigo-400"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 bg-white border-slate-200 focus:border-indigo-400"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Social Login */}
            <div 
            className="mt-6"
            data-aos="fade-up"
            data-aos-delay="600"
          >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div 
              className="grid gap-3 mt-4"
              data-aos="fade-up"
              data-aos-delay="650"
            >
                <Button 
                  variant="outline" 
                  className="w-full border-slate-200 hover:bg-slate-50 text-slate-700"
                  onClick={handleGoogleLogin}
                  type="button"
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div 
        className="text-center mt-6 text-xs text-slate-500"
        data-aos="fade-up"
        data-aos-delay="700"
      >
          <p>🔒 Your data is protected with end-to-end encryption</p>
          <p>HIPAA & GDPR compliant</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;