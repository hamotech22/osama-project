import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import BTN from "../../components/button/BTN";
import useLanguage from "../../context/useLanguage";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

// [تعديل 1] نقل مفتاح Web3Forms لملف .env (VITE_WEB3FORMS_KEY=...)
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const SITE_NAME = "osama.com ";

// [تعديل 2] ثوابت الـ validation (نفس الأرقام لازم تتحط في Strapi)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 150,
  messageMin: 10,
  messageMax: 2000,
};
const COOLDOWN_MS = 30_000; // الفاصل الأدنى بين رسالتين

const inputClasses =
  "w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-body text-zinc-900 shadow-sm outline-none focus:border-zinc-300 focus:ring-2 focus:ring-blue-500/20";

export default function ContactUs() {
  const { t } = useLanguage();
  const [contact, setContact] = useState(null);
  const [sending, setSending] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);
  const formRef = useRef(null);

  // [تعديل 3] ref للـ honeypot + ref لوقت آخر إرسال
  const honeypotRef = useRef(null);
  const lastSentRef = useRef(0);

  useEffect(() => {
    axios
      .get(`${STRAPI_URL}/api/my-contact`, { timeout: 8000 })
      .then((res) => setContact(res.data?.data ?? res.data ?? null))
      .catch((err) => console.error(t.contact.loadError, err));
  }, [t.contact.loadError]);

  // [تعديل 4] دالة validation منفصلة، بترجع رسالة الخطأ أو null لو كله تمام
  const validate = ({ name, email, message }) => {
    if (!name || !message) return t.contact.requiredFields;

    if (name.length < LIMITS.nameMin) return t.contact.nameTooShort;
    if (name.length > LIMITS.nameMax) return t.contact.tooLong;

    if (email && !EMAIL_REGEX.test(email)) return t.contact.invalidEmail;
    if (email.length > LIMITS.emailMax) return t.contact.tooLong;

    if (message.length < LIMITS.messageMin) return t.contact.messageTooShort;
    if (message.length > LIMITS.messageMax) return t.contact.tooLong;

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // [تعديل 5] منع الإرسال المزدوج
    if (sending) return;

    // [تعديل 6] Honeypot: لو الحقل المخفي اتملى يبقى بوت، نتجاهل بهدوء
    if (honeypotRef.current?.value) {
      formRef.current?.reset();
      return;
    }

    // [تعديل 7] Cooldown ضد السبام
    if (Date.now() - lastSentRef.current < COOLDOWN_MS) {
      toast.error(t.contact.waitBeforeResend);
      return;
    }

    const name = nameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const message = messageRef.current.value.trim();

    // [تعديل 8] استدعاء دالة الـ validation بدل الـ if القديم
    const validationError = validate({ name, email, message });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSending(true);

    try {
      await axios.post(
        `${STRAPI_URL}/api/messages`,
        { data: { name, email, message } },
        { timeout: 8000 },
      );

      // [تعديل 9] لو مفتاح Web3Forms مش موجود نتخطى الإيميل بدل ما يطلع خطأ
      if (WEB3FORMS_KEY) {
        try {
          const response = await axios.post(
            "https://api.web3forms.com/submit",
            {
              access_key: WEB3FORMS_KEY,
              subject: `رسالة جديدة من موقع ${SITE_NAME}`,
              from_name: SITE_NAME,
              name,
              email,
              message,
            },
            { timeout: 8000 },
          );

          if (response.data?.success !== true) {
            console.error("Web3Forms error:", response.data);
          }
        } catch (mailErr) {
          console.error("Email notification failed:", mailErr);
        }
      }

      lastSentRef.current = Date.now(); // [تعديل 10] تسجيل وقت آخر إرسال ناجح
      toast.success(t.contact.success);
      formRef.current?.reset();
    } catch (err) {
      console.error(t.contact.sendError, err);

      // [تعديل 11] عرض خطأ الـ validation اللي راجع من Strapi (status 400)
      const errorMessage = err.response?.status === 400
        ? t.contact.validationFailed
        : t.contact.error;
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="mx-auto w-full max-w-360 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-h2 font-semibold text-zinc-950">{t.contact.title}</h2>

        <p className="mx-auto mt-5 max-w-xl text-body text-zinc-600">{t.contact.description}</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-5">
        {/* [تعديل 12] noValidate عشان رسائلنا هي اللي تظهر بدل رسائل المتصفح */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4 rounded-3xl bg-zinc-100 p-6 shadow-lg sm:col-span-3 sm:p-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* [تعديل 13] minLength و maxLength على الاسم */}
            <input
              name="name"
              ref={nameRef}
              placeholder={t.contact.name}
              aria-label={t.contact.name}
              className={inputClasses}
              minLength={LIMITS.nameMin}
              maxLength={LIMITS.nameMax}
              required
            />

            {/* [تعديل 14] maxLength على الإيميل */}
            <input
              name="email"
              type="email"
              ref={emailRef}
              placeholder={t.contact.email}
              aria-label={t.contact.email}
              className={inputClasses}
              maxLength={LIMITS.emailMax}
            />
          </div>

          {/* [تعديل 15] minLength و maxLength على الرسالة */}
          <textarea
            name="message"
            ref={messageRef}
            placeholder={t.contact.message}
            aria-label={t.contact.message}
            rows={5}
            className={`${inputClasses} resize-none`}
            minLength={LIMITS.messageMin}
            maxLength={LIMITS.messageMax}
            required
          />

          {/* [تعديل 16] حقل Honeypot مخفي: البشر مش بيشوفوه، والبوتات بتملاه */}
          <input
            type="text"
            name="website"
            ref={honeypotRef}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-2499.75 h-0 w-0 opacity-0"
          />

          <div className="mt-2 flex items-center gap-4">
            <BTN type="submit" disabled={sending}>
              {sending ? t.contact.sending : t.contact.send}
            </BTN>
          </div>
        </form>

        <div className="flex flex-col gap-4 sm:col-span-2">
          <a
            href={`https://wa.me/${String(contact?.whatsapp ?? "").replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-3xl bg-zinc-100 p-6 shadow-lg transition hover:bg-white"
          >
            <span className="block text-small font-medium text-zinc-900">{t.contact.whatsappLabel}</span>

            <span className="block text-small text-zinc-500">{contact?.whatsapp ?? t.contact.whatsapp}</span>
          </a>

          <a
            href={contact?.email ? `mailto:${contact.email}` : undefined}
            className="rounded-3xl bg-zinc-100 p-6 shadow-lg transition hover:bg-white"
          >
            <span className="block text-small font-medium text-zinc-900">{t.contact.emailLabel}</span>

            <span className="block truncate text-small text-zinc-500">{contact?.email ?? "—"}</span>
          </a>
        </div>
      </div>
    </section>
  );
}