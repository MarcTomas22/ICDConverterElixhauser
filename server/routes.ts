import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchHistorySchema } from "@shared/schema";

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

  app.post("/api/history", async (req, res) => {
    try {
      const validatedData = insertSearchHistorySchema.parse(req.body);
      const result = await storage.saveSearchHistory(validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        console.error("Validation error saving search history:", error);
        return res.status(400).json({ error: "Invalid search history data" });
      }
      console.error("Server error saving search history:", error);
      res.status(500).json({ error: "Error saving search history" });
    }
  });

  app.get("/api/history", async (req, res) => {
    try {
      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? parseInt(limitParam) : 50;
      
      if (limitParam && (isNaN(limit) || limit < 1 || limit > 1000)) {
        return res.status(400).json({ error: "Invalid limit parameter" });
      }
      
      const history = await storage.getSearchHistory(limit);
      res.json(history);
    } catch (error) {
      console.error("Error getting search history:", error);
      res.status(500).json({ error: "Error getting search history" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: "Invalid history ID" });
      }
      
      await storage.deleteSearchHistory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting search history:", error);
      res.status(500).json({ error: "Error deleting search history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
