import express from "express";
import Stripe from "stripe";
import fetch from "node-fetch";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   STRIPE WEBHOOK (pagamento)
================================ */
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("❌ Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    console.log("💰 Pagamento confirmado na Stripe");
  }

  res.json({ received: true });
});


/* ===============================
   TELEGRAM WEBHOOK (bot)
================================ */

app.use(express.json());

app.post("/telegram", async (req, res) => {
  const message = req.body.message;

  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text;

  if (text && text.startsWith("/start")) {

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🎉 Ödemeniz onaylandı!

VIP grubunuza hemen katılın:
👉https://t.me/acessoviponf🔥

Hoş geldiniz 🔥`
      })
    });

    console.log("✅ Link VIP enviado no privado:", chatId);
  }

  res.sendStatus(200);
});


/* ===============================
   START SERVER
================================ */

app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});
