import express from 'express';
import dotenv from 'dotenv';
import cache from 'memory-cache'; // Import memory-cache package
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
dotenv.config();

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl || req.url;
  const cachedData = cache.get(key);
  if (cachedData) {
    res.send(cachedData);
    return;
  }
  res.sendResponse = res.send;
  res.send = (body) => {
    cache.put(key, body); // Cache the response
    res.sendResponse(body);
  };
  next();
};

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cacheMiddleware); // Add cache middleware

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/api/navbar', cacheMiddleware,async (req, res) => {
  try {
    const response = await prisma.navbar.findMany();
    res.json(response); // Just send the response directly
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle errors appropriately
  }
});

app.get('/api/shoes', cacheMiddleware,async (req, res) => { // Corrected parameters order
  try {
    const response = await prisma.shoes.findMany();
    res.json(response); // Just send the response directly
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle errors appropriately
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app