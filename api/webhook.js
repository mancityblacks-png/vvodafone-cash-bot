// api/webhook.js
import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  try {
    const body = req.body;

    // لو المستخدم ضغط على زر
    if (body.callback_query) {
      const chatId = body.callback_query.message.chat.id;
      const data = body.callback_query.data;

      let replyText = "";

      switch (data) {
        case "balance":
          replyText = "💰 لمعرفة رصيد فودافون كاش اطلب الكود *#9*13#";
          break;
        case "transfer":
          replyText = "🔁 لتحويل فلوس استخدم الكود *#9*7*رقم*المبلغ#";
          break;
        case "pin":
          replyText = "🔐 لو نسيت الرقم السري اطلب *#9*12# أو كلم 7001";
          break;
        case "atm":
          replyText = "💳 للسحب من ماكينة اطلب *#9*22#";
          break;
        case "home":
          await sendMenu(chatId);
          return res.status(200).send("ok");
        default:
          replyText = "مش فاهمك، جرب تاني 😊";
      }

      await sendMessage(chatId, replyText, true);
      return res.status(200).send("ok");
    }

    // لو المستخدم بعت رسالة جديدة
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text?.toLowerCase() || "";

      if (text === "/start" || text.includes("هاي") || text.includes("اه")) {
        await sendMenu(chatId);
      } else {
        await sendMessage(chatId, "اختار من الأزرار تحت ⬇️");
      }
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("Error:", err);
    res.status(200).send("error");
  }
}

// 🔹 إرسال رسالة عادية
async function sendMessage(chatId, text, includeBack = false) {
  const reply_markup = includeBack
    ? {
        inline_keyboard: [
          [{ text: "🔙 الرجوع للقائمة الرئيسية", callback_data: "home" }],
        ],
      }
    : undefined;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_markup,
    }),
  });
}

// 🔹 إرسال القائمة الرئيسية بالأزرار
async function sendMenu(chatId) {
  const text = "👋 أهلاً بيك في خدمة *فودافون كاش*! اختار اللي تحب تعمله:";
  const keyboard = {
    inline_keyboard: [
      [
        { text: "💰 معرفة الرصيد", callback_data: "balance" },
        { text: "🔁 تحويل الأموال", callback_data: "transfer" },
      ],
      [
        { text: "🔐 نسيت الرقم السري", callback_data: "pin" },
        { text: "💳 السحب من ماكينة", callback_data: "atm" },
      ],
    ],
  };

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }),
  });
}
