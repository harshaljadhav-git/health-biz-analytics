import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAppointmentSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/patients", async (_req, res) => {
    try {
      const result = await storage.getPatients();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const parsed = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(parsed);
      res.status(201).json(patient);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid patient data" });
    }
  });

  app.get("/api/appointments", async (_req, res) => {
    try {
      const result = await storage.getAppointments();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/recent", async (_req, res) => {
    try {
      const result = await storage.getRecentAppointments(5);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const parsed = insertAppointmentSchema.parse({
        ...req.body,
        date: new Date(req.body.date),
      });
      const appointment = await storage.createAppointment(parsed);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid appointment data" });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const updated = await storage.updateAppointmentStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.get("/api/departments", async (_req, res) => {
    try {
      const result = await storage.getDepartments();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/analytics/monthly", async (_req, res) => {
    try {
      const result = await storage.getAnalyticsSnapshots();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  return httpServer;
}
