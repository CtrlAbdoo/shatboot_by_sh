// 1. استخراج التوكن من الرابط
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    document.getElementById("verify-message").textContent = "رابط التأكيد غير صالح!";
    console.error("Token is missing");
} else {
    // 2. إرسال طلب التأكيد
    fetch(`https://sha-boot.onrender.com/auth/verify/${token}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) throw new Error("فشل في التأكيد");
        return response.json();
    })
    .then(data => {
        // 3. عرض رسالة النجاح
        document.getElementById("verify-message").textContent = data.message;
        
        // 4. التوجيه التلقائي بعد 3 ثوان
        setTimeout(() => {
            window.location.href = "../html/login.html";
        }, 3000);
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById("verify-message").textContent = "فشل في التأكيد: " + error.message;
    });
}

// 5. وظيفة زر الذهاب لتسجيل الدخول (إذا كان موجودًا في HTML)
const loginRedirectBtn = document.getElementById("loginRedirect");
if (loginRedirectBtn) {
    loginRedirectBtn.addEventListener("click", () => {
        window.location.href = "../html/login.html";
    });
}