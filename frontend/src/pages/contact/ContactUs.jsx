import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import BTN from "../../components/button/BTN";
import useLanguage from "../../context/useLanguage";

// const STRAPI_URL = "http://localhost:1337";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
const WEB3FORMS_KEY = "605a258b-7412-43cb-b5f1-2596598147ba";
const SITE_NAME = "osama.com ";

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

  // جلب بيانات التواصل من الـ endpoint القديم
  useEffect(() => {
    axios
      .get(`${STRAPI_URL}/api/my-contact`, { timeout: 8000 })
      .then((res) => setContact(res.data?.data ?? res.data ?? null))
      .catch((err) => console.error(t.contact.loadError, err));
  }, [t.contact.loadError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = nameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const message = messageRef.current.value.trim();

    if (!name || !message) {
      toast.error(t.contact.error);
      return;
    }

    setSending(true);

    try {
      // حفظ الرسالة في Strapi
      await axios.post(
        `${STRAPI_URL}/api/messages`,
        {
          data: { name, email, message },
        },
        { timeout: 8000 },
      );

      // إرسال إشعار الإيميل عبر Web3Forms
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

      toast.success(t.contact.success);
      formRef.current?.reset();
    } catch (err) {
      console.error(t.contact.sendError, err);
      const isStrapiUnavailable = err.config?.url?.startsWith(STRAPI_URL) && (!err.response || err.response.status >= 500);
      if (!isStrapiUnavailable) toast.error(t.contact.error);
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
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-3xl bg-zinc-100 p-6 shadow-lg sm:col-span-3 sm:p-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input name="name" ref={nameRef} placeholder={t.contact.name} aria-label={t.contact.name} className={inputClasses} required />

            <input
              name="email"
              type="email"
              ref={emailRef}
              placeholder={t.contact.email}
              aria-label={t.contact.email}
              className={inputClasses}
            />
          </div>

          <textarea
            name="message"
            ref={messageRef}
            placeholder={t.contact.message}
            aria-label={t.contact.message}
            rows={5}
            className={`${inputClasses} resize-none`}
            required
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
