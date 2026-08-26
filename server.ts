import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";

const app = express();
const PORT = 3000;

app.use(express.json());

const CONTENT_FILE = path.join(process.cwd(), "content.json");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), "assets", "images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, "img_" + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });


const MENU_FILE = path.join(process.cwd(), "menu.json");
if (!fs.existsSync(MENU_FILE)) {
  const defaultMenu = [
    { id: "1", name: "Traditional Jharkhand Thali", description: "A wholesome meal with rice, dal, chilka roti, rugda curry, and chutneys.", price: "₹350", category: "Thalis", image: "assets/images/img_3ce900d769.jpg" },
    { id: "2", name: "Dhuska & Mutton Curry", description: "Deep-fried rice batter served with spicy country-style mutton.", price: "₹450", category: "Mains", image: "assets/images/img_5e67f940cf.jpg" },
    { id: "3", name: "Handia (Rice Beer) - Mocktail", description: "A refreshing non-alcoholic take on the traditional tribal drink.", price: "₹120", category: "Beverages", image: "assets/images/img_25e3ed6ea2.jpg" },
    { id: "4", name: "Pitha Platter", description: "Assorted sweet and savory steamed rice cakes.", price: "₹200", category: "Desserts", image: "assets/images/img_3bff88f72e.jpg" }
  ];
  fs.writeFileSync(MENU_FILE, JSON.stringify(defaultMenu, null, 2), "utf-8");
}

app.get("/api/menu", (req, res) => {
  try {
    if (!fs.existsSync(MENU_FILE)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(MENU_FILE, "utf-8")));
  } catch (err) {
    res.status(500).json({ error: "Failed to read menu" });
  }
});

app.post("/api/menu", (req, res) => {
  try {
    fs.writeFileSync(MENU_FILE, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save menu" });
  }
});

app.get("/api/content", (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_FILE)) {
      return res.json({});
    }
    const data = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read content" });
  }
});

app.post("/api/content", (req, res) => {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save content" });
  }
});

app.post("/api/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const key = req.body.key;
  const newPath = "assets/images/" + req.file.filename;
  
  try {
    let content = {};
    if (fs.existsSync(CONTENT_FILE)) {
      content = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
    }
    if(key) { content[key] = newPath; }
    if(key) { fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8"); }
    
    const distDir = path.join(process.cwd(), "dist", "assets", "images");
    if (fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
      fs.copyFileSync(req.file.path, path.join(distDir, req.file.filename));
    }
    
    res.json({ success: true, path: newPath });
  } catch (err) {
    res.status(500).json({ error: "Failed to save image metadata" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "mpa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const reqPath = req.path === '/' ? '/index.html' : req.path;
      const file = path.join(distPath, reqPath);
      if (fs.existsSync(file)) {
        res.sendFile(file);
      } else {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
