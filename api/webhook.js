// api/webhook.js
import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = req.body;
  const message = update?.message;
  const callback = update?.callback_query;

  try {
    // لو المستخدم ضغط على زر
    if (callback) {
      const chatId = callback.message.chat.id;
      const data = callback.data;
      let reply = "";

      if (data === "balance") reply = "💰 لمعرفة رصيد فودافون كاش اطلب الكود *#9*13#";
      else if (data === "transfer") reply = "🔁 لتحويل فلوس استخدم الكود *#9*7*رقم*المبلغ#";
      else if (data === "pin") reply = "🔐 لو نسيت الرقم السري اطلب *#9*12# أو كلم 7001";
      else if (data === "atm") reply = "💳 للسحب من ماكينة اطلب *#9*22#";
      else reply = "مش فاهمك، جرب تاني 😊";

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
          parse_mode: "Markdown"
        })
      });

      return res.status(200).send("ok");
    }

    // أول رسالة من المستخدم
    if (message) {
      const chatId = message.chat.id;
      const text = message.text;

      if (text === "/start" || text.includes("هاي") || text.includes("اه")) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "👋 أهلاً بيك في خدمة فودافون كاش! اختار اللي تحب تعمله:",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "💰 معرفة الرصيد", callback_data: "balance" },
                  { text: "🔁 تحويل الأموال", callback_data: "transfer" }
                ],
                [
                  { text: "🔐 نسيت الرقم السري", callback_data: "pin" },
                  { text: "💳 السحب من ماكينة", callback_data: "atm" }
                ]
              ]
            }
          })
        });
      } else {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "اختار من الأزرار تحت ⬇️",
            parse_mode: "Markdown"
          })
        });
      }
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(200).send("error");
  }
}
