import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  await storage.initialize();

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 1) {
        return res.json([]);
      }

      const results = await storage.searchCodes(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching codes:", error);
      res.status(500).json({ error: "Error searching codes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
