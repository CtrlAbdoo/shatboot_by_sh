const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get("email");

document.getElementById("reset-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const otp = document.getElementById("otp").value.trim();
  const password = document.getElementById("password").value;
  const rePassword = document.getElementById("rePassword").value;

  // فحص الحقول
  if (!email || !otp || !password || !rePassword) {
    alert("من فضلك، املأ جميع الحقول!");
  }
  if (password !== rePassword) {
    alert("كلمتا المرور غير متطابقتين!");
  }
  if (password.length < 6) {
    alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل!");
  }

  try {
    const response = await fetch("https://sha-boot.onrender.com/resetPassword", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "email": email
      },
      body: JSON.stringify({ otp, password, rePassword })
    });
    const data = await response.json();

    // طباعة التفاصيل في الـ Console
    console.log("استجابة الـ API:", data);
    console.log("Status Code:", response.status);

    if (response.status === 200 && data.message && data.message.toLowerCase().includes("successfuly")) {
      alert("تم تحديث كلمة المرور بنجاح!");
      // التأكد من التحويل
      window.location.href = "login.html";
   }
    
    if (response.status === 409) {
      alert("فشل التغيير! الرسالة: " + (data.message || "تحقق من الـ OTP أو الإيميل"));
     window.location.href = "forgot-password.html";
    }

  } catch (error) {
    console.error("خطأ:", error);
    alert("حدث خطأ أثناء الاتصال! تحقق من الإنترنت.");
   window.location.href = "forgot-password.html";
  }
});