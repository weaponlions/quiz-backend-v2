import { Router } from "express";

const router = Router();

// These routes will be implemented when the TestQuestion controller is created
router.get("/", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

router.get("/:id", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

router.post("/", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

router.put("/:id", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

router.delete("/:id", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});

export default router; 