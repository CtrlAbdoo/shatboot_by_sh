// 1. تعريف العناصر
const loginForm = document.getElementById("login-form");
const submitButton = loginForm.querySelector("button[type='submit']"); // More specific selector

// 2. إضافة Event Listener للنموذج
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // 3. تعطيل الزر أثناء التحميل
    if(submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 
            '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
    }

    // 4. جمع البيانات
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // 5. التحقق من البيانات (أساسي)
    if (!email || !password) {
        alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور!");
        resetButton();
        return;
    }

    try {
        // 6. إرسال البيانات إلى الباك إند
        const response = await fetch("https://sha-boot.onrender.com/auth/signIn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        // 7. معالجة الاستجابة المحسنة
        if (response.ok && data.token) { // Check for response.ok and data.token
            localStorage.setItem("token", data.token);
            // Optionally, store username and email if needed later
            if(data.userName) localStorage.setItem("userName", data.userName);
            if(data.email) localStorage.setItem("userEmail", data.email); // Store actual email from response
            alert(data.message || "تم تسجيل الدخول بنجاح!"); // Use message from backend if available
            window.location.href = "chat.html";
        } else {
            // Provide more specific error messages
            let errorMessage = "فشل في تسجيل الدخول.";
            if (data && data.message) {
                errorMessage = data.message; // Use backend error message
            } else if (response.status === 401) {
                errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
            } else if (response.status === 404 && data.message && data.message.includes("not confirmed")){
                errorMessage = "لم يتم تأكيد حسابك بعد. يرجى التحقق من بريدك الإلكتروني.";
            } else if (response.status === 404) {
                 errorMessage = "المستخدم غير موجود أو الحساب لم يتم تأكيده.";
            }
            alert(errorMessage);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
        resetButton();
    }
});

// 8. دالة إعادة تعيين الزر
function resetButton() {
    if(submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "تسجيل الدخول";
    }
}

/**
 * JSDoc comments can be added here for functions if needed.
 * For example, a utility function to validate email format (if not already present elsewhere).
 */

