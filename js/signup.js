// 1. تعريف العناصر
const signupForm = document.getElementById("signup-form");
const submitButton = document.getElementById("submit-button");

// 2. إضافة Event Listener للنموذج
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if(submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 
            '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...>'
    
    }

    const formData = {
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        rePassword: document.getElementById("rePassword").value
    };

    // Client-side validation
    if (!formData.username || !formData.email || !formData.password || !formData.rePassword) {
        alert("الرجاء ملء جميع الحقول الإلزامية!");
        resetButton();
        return;
    }
    if (formData.password !== formData.rePassword) {
        alert("كلمتا المرور غير متطابقتين!");
        resetButton();
        return;
    }
    if (!validateEmail(formData.email)) {
        alert("الرجاء إدخال عنوان بريد إلكتروني صحيح.");
        resetButton();
        return;
    }

    console.log("Attempting signup with data:", JSON.stringify(formData));

    try {
        const response = await fetch("https://sha-boot.onrender.com/auth/signUp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        // Log basic response information
        console.log("Signup API Response Status:", response.status);
        console.log("Signup API Response Status Text:", response.statusText);

        const data = await response.json();
        console.log("Signup API Response Data:", data);

        if (response.status === 201 && data && data.message && data.message.toLowerCase().includes("signup successfuly")) {
            alert("تم التسجيل بنجاح! تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى التحقق من بريدك (بما في ذلك مجلد الرسائل غير المرغوب فيها) لتفعيل الحساب.");
            signupForm.reset(); 
            window.location.href = "../html/login.html";
        } else if (response.status === 409 && data && data.message) {
            alert(`فشل التسجيل: ${data.message}`); // E.g., "Email or Username already exists"
        } else {
            // Handle other errors or unexpected responses
            let errorMessage = "فشل التسجيل.";
            if (data && data.message) {
                errorMessage = data.message;
            } else if (response.status) {
                errorMessage = `حدث خطأ غير متوقع. رمز الحالة: ${response.status}`;
            }
            console.error("Signup failed. Status:", response.status, "Data:", data);
            alert(errorMessage);
        }
    } catch (error) {
        console.error("Signup Fetch/Network Error:", error);
        alert("حدث خطأ أثناء محاولة الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
    } finally {
        resetButton();
    }
});

function resetButton() {
    if(submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "تسجيل";
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

