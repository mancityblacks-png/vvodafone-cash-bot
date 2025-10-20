// api/webhook.js
import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = req.body;
  const message = update?.message?.text || "";
  const chatId = update?.message?.chat?.id;

  if (!chatId || !message) return res.status(200).send("no message");

  try {
    const lower = message.toLowerCase();
    let reply;

    if (lower.includes("رصيد")) {
      reply = "علشان تعرف رصيد فودافون كاش اطلب الكود *#9*13# 💰";
    } else if (lower.includes("تحويل")) {
      reply = "لتحويل فلوس اطلب *#9*7*رقم*المبلغ# 🔁";
    } else if (lower.includes("atm") || lower.includes("سحب") || lower.includes("ماكينة")) {
      reply = "للسحب من ماكينة اطلب *#9*22# 💳";
    } else if (lower.includes("نسيت") || lower.includes("الرقم السري")) {
      reply = "لو نسيت الرقم السري اطلب *#9*12# أو كلم 7001 🔐";
    } else if (OPENAI_KEY) {
      // استخدم ذكاء OpenAI لو المفتاح موجود
      const ai = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "أنت بوت فودافون كاش باللهجة المصرية. رد بإيجاز وبود." },
            { role: "user", content: message }
          ],
          max_tokens: 200
        })
      });
      const data = await ai.json();
      reply = data?.choices?.[0]?.message?.content || "آسف مش سامعك كويس، جرب تاني 🙏";
    } else {
      reply = "أنا بوت فودافون كاش 🤖 اسألني عن الرصيد، التحويل، أو السحب.";
    }

    // رد على المستخدم في تليجرام
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: reply, parse_mode: "Markdown" })
    });

    res.status(200).send("ok");
  } catch (e) {
    console.error(e);
    res.status(200).send("error");
  }
}
