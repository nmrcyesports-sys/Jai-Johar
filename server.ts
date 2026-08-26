import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';

const app = express();
const PORT = 3000;
app.use(express.json());

// Initialize Firebase Client SDK
let db: any = null;
try {
  const fbConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
  const fbApp = initializeApp({
    projectId: fbConfig.projectId,
    appId: fbConfig.appId,
    apiKey: fbConfig.apiKey,
    authDomain: fbConfig.authDomain,
  });
  db = getFirestore(fbApp, fbConfig.firestoreDatabaseId || "(default)");
  console.log("Firebase Client initialized successfully");
} catch(err) {
  console.error("Failed to initialize Firebase", err);
}

const CONTENT_FILE = path.join(process.cwd(), "content.json");
const MENU_FILE = path.join(process.cwd(), "menu.json");

// Store uploads in memory instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/api/menu", async (req, res) => {
  try {
    if (db) {
      const d = doc(db, "cms", "menu");
      const snap = await getDoc(d);
      if (!snap.exists()) {
        let localMenu = [];
        if (fs.existsSync(MENU_FILE)) {
          localMenu = JSON.parse(fs.readFileSync(MENU_FILE, "utf-8"));
        }
        if (localMenu.length > 0) {
           await setDoc(d, { items: localMenu });
        }
        return res.json(localMenu);
      }
      return res.json(snap.data()?.items || []);
    } else {
      if (!fs.existsSync(MENU_FILE)) return res.json([]);
      res.json(JSON.parse(fs.readFileSync(MENU_FILE, "utf-8")));
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to read menu" });
  }
});

app.post("/api/menu", async (req, res) => {
  try {
    if (db) {
      const d = doc(db, "cms", "menu");
      await setDoc(d, { items: req.body });
    }
    fs.writeFileSync(MENU_FILE, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save menu" });
  }
});

app.get("/api/content", async (req, res) => {
  try {
    if (db) {
      const d = doc(db, "cms", "content");
      const snap = await getDoc(d);
      if (!snap.exists()) {
        let localContent = {};
        if (fs.existsSync(CONTENT_FILE)) {
           localContent = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8"));
           await setDoc(d, localContent);
        }
        return res.json(localContent);
      }
      return res.json(snap.data());
    } else {
      if (!fs.existsSync(CONTENT_FILE)) return res.json({});
      res.json(JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8")));
    }
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Failed to read content" });
  }
});

app.post("/api/content", async (req, res) => {
  try {
    if (db) {
      const d = doc(db, "cms", "content");
      await setDoc(d, req.body);
    }
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save content" });
  }
});

app.post("/api/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
  const key = req.body.key;
  const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1e9);
  
  try {
    let newPath = "";
    
    if (db) {
      newPath = "/api/images/" + uniqueId;
      const base64Data = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;
      
      const imgDoc = doc(db, "images", uniqueId);
      await setDoc(imgDoc, {
          data: base64Data,
          mimeType: mimeType
      });
      
      if (key) {
          const contentDoc = doc(db, "cms", "content");
          const snap = await getDoc(contentDoc);
          let content = snap.exists() ? snap.data() : {};
          content[key] = newPath;
          await setDoc(contentDoc, content);
          fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");
      }
    } else {
      const ext = path.extname(req.file.originalname) || ".jpg";
      const filename = "img_" + uniqueId + ext;
      const dir = path.join(process.cwd(), "assets", "images");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, filename), req.file.buffer);
      newPath = "assets/images/" + filename;
      
      if (key) {
        let content: any = {};
        if (fs.existsSync(CONTENT_FILE)) {
          content = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
        }
        content[key] = newPath;
        fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");
      }
      
      const distDir = path.join(process.cwd(), "dist", "assets", "images");
      if (fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
        fs.writeFileSync(path.join(distDir, filename), req.file.buffer);
      }
    }
    
    res.json({ success: true, path: newPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save image" });
  }
});

// Serve images directly from Firestore
app.get("/api/images/:id", async (req, res) => {
  try {
    if (!db) return res.status(404).send("Database not configured");
    const d = doc(db, "images", req.params.id);
    const snap = await getDoc(d);
    if (!snap.exists()) return res.status(404).send("Not found");
    
    const dataObj = snap.data();
    if (!dataObj) return res.status(404).send("Not found");
    
    const imgBuffer = Buffer.from(dataObj.data, 'base64');
    
    res.writeHead(200, {
        'Content-Type': dataObj.mimeType,
        'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
  } catch(err) {
    res.status(500).send("Error fetching image");
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
