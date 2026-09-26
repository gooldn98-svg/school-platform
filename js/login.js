// إنشاء اتصال Supabase
const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// نموذج تسجيل الدخول
const loginForm = document.getElementById("login-form");

const loginMessage =
    document.getElementById("login-message");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    loginMessage.textContent =
        "جاري تسجيل الدخول...";


    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            loginMessage.textContent =
                "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

            console.error(error);

            return;
        }


        // نجاح تسجيل الدخول
        loginMessage.textContent =
            "تم تسجيل الدخول بنجاح...";


        // الانتقال إلى لوحة التحكم
        window.location.href =
            "../dashboard.html";


    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            "حدث خطأ أثناء تسجيل الدخول.";

    }

});
