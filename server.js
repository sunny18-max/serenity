import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}
const db = admin.firestore();

// Check if user exists
app.post('/api/auth/check-user', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    res.json({ exists: true, uid: user.uid });
  } catch (error) {
    res.json({ exists: false });
  }
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Check if user already exists
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(400).json({ error: 'User already exists. Please sign in.' });
    } catch {}
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
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
    res.json({ message: 'User created successfully', user: { id: userRecord.uid, email, name } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Signin endpoint (returns Firebase custom token)
app.post('/api/auth/signin', async (req, res) => {
  const { email } = req.body;
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
    await userRef.update({ last_login: lastLogin, streak });
    res.json({ token: customToken, user: { id: user.uid, email: user.email, name: user.displayName }, streak });
  } catch (error) {
    res.status(400).json({ error: 'User not found. Please sign up.' });
  }
});

// Get user data
app.get('/api/user/data', async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit mood
app.post('/api/user/mood', async (req, res) => {
  const { uid, mood } = req.body;
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const todayMood = { date: today, mood, energy: Math.floor(Math.random() * 100) };
    const updatedMoods = [...(userData.moods || []), todayMood];

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

    const wellnessScore = updatedMoods.length > 0
      ? Math.round(updatedMoods.reduce((sum, m) => sum + m.mood, 0) / updatedMoods.length * 20)
      : 0;
    const streak = userData.streak || 1;

    const insights = [
      { title: 'Mood Patterns', description: 'Based on your recent moods', trend: 'positive', score: wellnessScore },
      { title: 'Consistency', description: 'You\'re maintaining a good tracking streak', trend: 'stable', score: streak * 10 }
    ];

    await userRef.update({
      moods: updatedMoods,
      weekly_progress: weeklyProgress,
      wellness_score: wellnessScore,
      streak: streak,
      has_completed_initial_assessment: true,
      insights: insights
    });
    res.json({ message: 'Mood submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit assessment
app.post('/api/user/assessment', async (req, res) => {
  const { uid, answers } = req.body;
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    const userData = userDoc.data();
    const assessmentsCount = (userData.assessments_count || 0) + 1;
    const score = Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0);
    const wellnessScore = Math.min(100, Math.round((27 - score) / 27 * 100));
    const newInsight = {
      title: 'PHQ-9 Assessment',
      description: `Your latest assessment score: ${score}`,
      trend: score < 10 ? 'positive' : score < 20 ? 'stable' : 'attention',
      score: wellnessScore
    };
    const updatedInsights = [...(userData.insights || []), newInsight];
    await userRef.update({
      assessments_count: assessmentsCount,
      wellness_score: wellnessScore,
      insights: updatedInsights
    });
    res.json({ message: 'Assessment submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await db.collection('contact_submissions').add({
      name,
      email,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: 'Contact message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send contact message' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));