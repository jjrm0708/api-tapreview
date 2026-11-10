const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Llaves del SERVIDOR (la clave secreta vive en el servidor, no en el navegador)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Faltan variables de entorno en el servidor.");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// GET /api/reviews — Lista las reseñas (con RAG)
app.get("/api/reviews", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, comment, status")
      .order("id", { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews — Crea una reseña validando en el SERVIDOR
app.post("/api/reviews", async (req, res) => {
  const { comment, rating, business_slug } = req.body;

  if (!comment || typeof comment !== "string" || !comment.trim()) {
    return res.status(400).json({ success: false, error: "El comentario es obligatorio." });
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          comment: comment.trim(),
          rating: rating || 1,
          rating_stars: rating || 1,
          status: "PENDING",
          business_slug: business_slug || "comercio-ejemplo",
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
