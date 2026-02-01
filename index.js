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

  try {
    stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("💰 Pagamento confirmado na Stripe");

  } catch (err) {
    console.log("❌ Webhook error:", err.message);
    return res.status(400).send(err.message);
  }

  res.json({ received: true });
});


/* ===============================
   TELEGRAM WEBHOOK (BOT START)
================================ */

app.use(express.json());

app.post("/telegram-webhook", async (req, res) => {
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
👉 https://t.me/acessoviponf

Hoş geldiniz 🔥`
      })
    });

    console.log("✅ Link VIP enviado:", chatId);
  }

  res.sendStatus(200);
});


/* ===============================
   START SERVER
================================ */

app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});
