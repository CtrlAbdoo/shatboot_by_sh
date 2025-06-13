// forgot-password.js

document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordForm = document.getElementById("forgot-password-form");
    const submitButton = document.getElementById("submit-button");

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 
                    '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            }

            const emailInput = document.getElementById("email");
            const email = emailInput ? emailInput.value.trim() : null;

            if (!email || !validateEmail(email)) {
                alert("الرجاء إدخال عنوان بريد إلكتروني صالح.");
                resetSubmitButton();
                return;
            }

            try {
                const response = await fetch("https://sha-boot.onrender.com/forgetPassword", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email })
                });

                const data = await response.json();

                if (response.ok && data.message && data.message.toLowerCase().includes("otp code has been sent")) {
                    alert("تم إرسال رمز OTP إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك (وصندوق البريد المزعج ).");
                    // Redirect to reset-password.html, passing the email as a query parameter
                    window.location.href = `reset-password.html?email=${encodeURIComponent(email)}`;
                } else {
                    let errorMessage = "فشل في إرسال رمز OTP.";
                    if (data && data.message) {
                        errorMessage = data.message; // Use backend error message
                    } else if (response.status === 404) {
                        errorMessage = "البريد الإلكتروني غير مسجل.";
                    }
                    alert(errorMessage);
                }
            } catch (error) {
                console.error("Forgot Password Error:", error);
                alert("حدث خطأ أثناء محاولة إرسال رمز OTP. يرجى المحاولة مرة أخرى.");
            } finally {
                resetSubmitButton();
            }
        });
    }
});

function resetSubmitButton() {
    const submitButton = document.getElementById("submit-button");
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "إرسال الرمز";
    }
}

/**
 * Validates email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

