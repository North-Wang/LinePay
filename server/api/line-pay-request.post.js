import CryptoJS from "crypto-js";
import axios from "axios";

// 簽名生成函式
function signKey(clientKey, msg) {
  const hash = CryptoJS.HmacSHA256(msg, clientKey);
  return CryptoJS.enc.Base64.stringify(hash);
}

export default defineEventHandler(async (event) => {
  try {
    // 獲取請求的 Body 資料
    const body = await readBody(event);

    // 獲取環境變數
    const channelId = process.env.VITE_LINE_PAY_CHANNEL_ID;
    const channelSecret = process.env.VITE_line_pay_channel_secret;
    const baseUrl = "https://sandbox-api-pay.line.me";

    // 生成 nonce（唯一隨機值）
    const nonce = crypto.randomUUID();

    // API 路徑和數據
    const apiPath = "/v2/payments/request";
    const requestData = {
      amount: body.amount || 1000, // 測試金額，默認為 1000
      currency: "TWD",
      orderId: `test-order-${Date.now()}`,
      packages: [
        {
          id: "package-1",
          amount: body.amount || 1000,
          name: "測試商品包",
          products: [
            {
              id: "product-1",
              name: "測試商品",
              quantity: 1,
              price: body.amount || 1000,
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl: "http://localhost:3000/AfterPay", // 替換為你的 confirm URL
        cancelUrl: "http://localhost:3000/AfterPay", // 替換為你的 cancel URL
      },
    };

    // 生成簽名
    const payload =
      channelSecret + apiPath + JSON.stringify(requestData) + nonce;
    const signature = signKey(channelSecret, payload);

    // 設置 HTTP 標頭
    const headers = {
      "X-LINE-ChannelId": channelId,
      "X-LINE-Authorization": signature,
      "X-LINE-Authorization-Nonce": nonce,
      "Content-Type": "application/json",
    };

    // 發送請求到 Line Pay
    const response = await axios.post(`${baseUrl}${apiPath}`, requestData, {
      headers,
    });

    // 返回 Line Pay 的響應
    return response.data;
  } catch (error) {
    console.error(
      "Line Pay API 請求失敗:",
      error.response?.data || error.message
    );
    throw createError({
      statusCode: 500,
      message: "Line Pay API 請求失敗",
    });
  }
});
