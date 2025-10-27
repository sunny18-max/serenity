import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'https://serenity-phi-plum.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(bodyParser.json());

// Initialize Firebase Admin SDK with service account key file
if (!admin.apps.length) {
  try {
    // Load service account key from JSON file
    const serviceAccountPath = path.join(__dirname, 'securityAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log('Firebase Admin SDK initialized with service account key file');
    } else {
      // Fallback: Try using environment variables
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
        universe_domain: "googleapis.com"
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log('Firebase Admin SDK initialized with environment variables');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

// Check if user exists
app.post('/api/auth/check-user', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    res.json({ exists: true, uid: user.uid });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      res.json({ exists: false });
    } else {
      console.error('Error checking user:', error);
      res.status(500).json({ error: 'Server error while checking user' });
    }
  }
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, phone } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    // Check if user already exists
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(400).json({ error: 'User already exists. Please sign in.' });
    } catch (error) {
      // User doesn't exist, continue with creation
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      phone: phone || '',
      weekly_progress: [],
      insights: [],
      wellness_score: 0,
      streak: 0,
      assessments_count: 0,
      has_completed_initial_assessment: false,
      moods: [],
      last_login: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ 
      message: 'User created successfully', 
      user: { 
        id: userRecord.uid, 
        email, 
        name,
        phone: phone || '' 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    let errorMessage = 'Failed to create user';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'User already exists. Please sign in.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak.';
    }
    
    res.status(400).json({ error: errorMessage });
  }
});

// Signin endpoint (returns Firebase custom token)
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    
    // Issue a custom token for frontend to use with Firebase Auth SDK
    const customToken = await admin.auth().createCustomToken(user.uid);
    
    // Update last_login and streak
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    let streak = 1;
    let lastLogin = new Date().toISOString().split('T')[0];
    
    if (userDoc.exists) {
      const data = userDoc.data();
      if (data.last_login) {
        const prevDate = new Date(data.last_login);
        const today = new Date();
        const diff = Math.floor((today - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) streak = (data.streak || 0) + 1;
        else if (diff === 0) streak = data.streak || 1;
        else streak = 1;
      }
    }
    
    await userRef.update({ 
      last_login: lastLogin, 
      streak 
    });
    
    res.json({ 
      token: customToken, 
      user: { 
        id: user.uid, 
        email: user.email, 
        name: user.displayName 
      }, 
      streak 
    });
  } catch (error) {
    console.error('Signin error:', error);
    
    if (error.code === 'auth/user-not-found') {
      res.status(400).json({ error: 'User not found. Please sign up.' });
    } else {
      res.status(500).json({ error: 'Server error during sign in' });
    }
  }
});

// Get user data
app.get('/api/user/data', async (req, res) => {
  const { uid } = req.query;
  
  if (!uid) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(userDoc.data());
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ error: 'Server error while fetching user data' });
  }
});

// Submit mood
app.post('/api/user/mood', async (req, res) => {
  const { uid, mood } = req.body;
  
  if (!uid) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  if (typeof mood !== 'number' || mood < 1 || mood > 5) {
    return res.status(400).json({ error: 'Mood must be a number between 1 and 5' });
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if mood already submitted today
    const existingMoodIndex = (userData.moods || []).findIndex(m => m.date === today);
    let updatedMoods;
    
    if (existingMoodIndex >= 0) {
      // Update existing mood for today
      updatedMoods = [...userData.moods];
      updatedMoods[existingMoodIndex] = { 
        date: today, 
        mood, 
        energy: Math.floor(Math.random() * 100) 
      };
    } else {
      // Add new mood for today
      const todayMood = { 
        date: today, 
        mood, 
        energy: Math.floor(Math.random() * 100) 
      };
      updatedMoods = [...(userData.moods || []), todayMood];
    }

    // Weekly progress calculation
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProgress = days.map((day, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const moodEntry = updatedMoods.find(m => m.date === dateStr);
      return {
        day,
        mood: moodEntry ? moodEntry.mood : 0,
        energy: moodEntry ? moodEntry.energy : 0
      };
    });

    // Calculate wellness score
    const wellnessScore = updatedMoods.length > 0
      ? Math.round(updatedMoods.reduce((sum, m) => sum + m.mood, 0) / updatedMoods.length * 20)
      : 0;

    const streak = userData.streak || 1;

    const insights = [
      { 
        title: 'Mood Patterns', 
        description: 'Based on your recent moods', 
        trend: 'positive', 
        score: wellnessScore 
      },
      { 
        title: 'Consistency', 
        description: 'You\'re maintaining a good tracking streak', 
        trend: 'stable', 
        score: streak * 10 
      }
    ];

    await userRef.update({
      moods: updatedMoods,
      weekly_progress: weeklyProgress,
      wellness_score: wellnessScore,
      streak: streak,
      has_completed_initial_assessment: true,
      insights: insights
    });

    res.json({ 
      message: 'Mood submitted successfully',
      data: {
        mood,
        date: today,
        wellnessScore
      }
    });
  } catch (error) {
    console.error('Error submitting mood:', error);
    res.status(500).json({ error: 'Server error while submitting mood' });
  }
});

// Submit assessment
app.post('/api/user/assessment', async (req, res) => {
  const { uid, answers } = req.body;
  
  if (!uid) {
    return res.status(401).json({ error: 'User ID is required' });
  }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Answers are required' });
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const assessmentsCount = (userData.assessments_count || 0) + 1;
    
    // Calculate PHQ-9 score
    const score = Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0);
    const wellnessScore = Math.min(100, Math.round((27 - score) / 27 * 100));
    
    const newInsight = {
      title: 'PHQ-9 Assessment',
      description: `Your latest assessment score: ${score}`,
      trend: score < 10 ? 'positive' : score < 20 ? 'stable' : 'attention',
      score: wellnessScore,
      date: new Date().toISOString()
    };

    const updatedInsights = [...(userData.insights || []), newInsight];

    await userRef.update({
      assessments_count: assessmentsCount,
      wellness_score: wellnessScore,
      insights: updatedInsights,
      has_completed_initial_assessment: true
    });

    res.json({ 
      message: 'Assessment submitted successfully',
      data: {
        score,
        wellnessScore,
        assessmentsCount
      }
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ error: 'Server error while submitting assessment' });
  }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    await db.collection('contact_submissions').add({
      name,
      email,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({ message: 'Contact message sent successfully' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to send contact message' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
