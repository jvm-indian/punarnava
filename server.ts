import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// 1. Google Search Grounded Scrap Market Intelligence Route
app.post('/api/scrap-market-search', async (req, res) => {
  try {
    const { query } = req.body;
    const userQuery = query || 'Current scrap copper, iron, raddi newspaper, and PET bottle prices per kg in India today 2026';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert Indian circular economy scrap market analyst for PUNARNAVA. Provide current spot scrap price insights for: ${userQuery}. Return concise summary with realistic INR/kg rates and industrial demand reasons.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    res.json({
      text: response.text,
      groundingChunks: searchChunks,
      webSearchQueries,
    });
  } catch (error) {
    console.error('Gemini Search Grounding Error:', error);
    res.status(500).json({
      error: 'Failed to retrieve search grounded scrap rates',
      fallbackText: 'Current Indian Scrap Spot Rates: Pure Copper ₹780-820/kg, Iron ₹28-32/kg, PET Bottles ₹18-22/kg, Newspaper ₹14-16/kg. Strong refinery demand from industrial recyclers.',
    });
  }
});

// 2. Google Maps Grounded Scrap Depot & Aggregation Hub Finder
app.post('/api/scrap-depot-maps', async (req, res) => {
  try {
    const { location } = req.body;
    const targetLoc = location || 'Sector 4, New Delhi';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Find certified dry waste aggregation hubs, recycling centers, and scrap depots near: ${targetLoc}, India. List top 3 verified locations with address, contact, and materials accepted.`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    res.json({
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    });
  } catch (error) {
    console.error('Gemini Maps Grounding Error:', error);
    res.status(500).json({
      error: 'Failed to retrieve maps grounded depots',
      fallbackText: '1. CPCB Aggregation Hub #4, Sector 4 Main Rd • Accepts Paper, Plastics, Metals\n2. Eco-Recyclo Depot, MG Road Signal • Accepts E-Waste & Batteries\n3. Indiranagar Cluster Hub, East Zone • Accepts Bulk Industrial Scrap',
    });
  }
});

// Vite middleware in development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

app.listen(port, () => {
  console.log(`PUNARNAVA server running on http://localhost:${port}`);
});
