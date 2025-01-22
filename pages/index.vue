<template>
  <h1>測試 Line Pay 支付</h1>
  <input
    type="number"
    v-model="amount"
    placeholder="輸入支付金額"
    class="input"
  />
  <button @click="handlePayment" class="button">發起支付請求</button>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const amount = ref(1);
const handlePayment = async () => {
  try {
    const response = await axios.post("/api/line-pay-request", {
      amount: amount.value,
    });
    console.log("支付請求成功:", response);
    // 重定向用戶到支付頁面
    window.location.href = response.data.info.paymentUrl.web;
  } catch (error) {
    console.error("支付請求失敗:", error);
  }
};
</script>
