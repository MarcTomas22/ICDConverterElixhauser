import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  await storage.initialize();

  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const category = req.query.category as string | undefined;
      const mode = req.query.mode as string | undefined;
      
      if (!query || query.length < 1) {
        return res.json([]);
      }

      const results = mode === "inverse" 
        ? await storage.searchCodesInverse(query, category)
        : await storage.searchCodes(query, category);
      
      res.json(results);
    } catch (error) {
      console.error("Error searching codes:", error);
      res.status(500).json({ error: "Error searching codes" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Error getting categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
