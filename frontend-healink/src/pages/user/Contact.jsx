import { HiMail, HiMap, HiPhone, HiClock } from "react-icons/hi";

const contactMethods = [
  {
    title: "Email Support",
    value: "support@healink.id",
    icon: HiMail,
  },
  {
    title: "Telepon",
    value: "+62 812-3456-7890",
    icon: HiPhone,
  },
  {
    title: "Alamat Kantor",
    value: "Jl. Sehat No. 12, Jakarta Selatan",
    icon: HiMap,
  },
  {
    title: "Jam Operasional",
    value: "Senin - Jumat, 08:00 - 17:00",
    icon: HiClock,
  },
];

const Contact = () => {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,rgba(56,189,248,0.08),rgba(96,165,250,0.12))] px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-7xl space-y-14">
        <div className="rounded-[2rem] bg-[var(--color-secondary)] p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/90 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200">
                <HiMail className="h-5 w-5 text-[var(--color-primary)]" />
                Kontak Kami
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                  Hubungi tim HEALINK untuk bantuan dan informasi lebih lanjut.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  Kami siap membantu Anda dengan segala pertanyaan, mulai dari bantuan teknis hingga dukungan untuk layanan kesehatan digital.
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70">
              <div className="rounded-[1.75rem] bg-[var(--color-primary)]/5 p-6 text-slate-950 ring-1 ring-[var(--color-primary)]/10">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Layanan Pelanggan</p>
                <h2 className="mt-4 text-3xl font-bold">Kami siap mendengar kebutuhan Anda.</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Sampaikan pertanyaan atau saran Anda, dan tim HEALINK akan merespons dengan cepat serta profesional.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] bg-white/95 p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/90">
            <div className="grid gap-6 sm:grid-cols-2">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.title} className="rounded-[1.75rem] border border-slate-200 p-6 shadow-sm shadow-slate-200">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{method.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{method.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[var(--color-secondary)] p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/90">
            <h2 className="text-3xl font-bold text-slate-950">Kirim pesan kepada kami</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Isi formulir di bawah ini untuk menghubungi tim support HEALINK. Kami akan merespons secepat mungkin.
            </p>
            <form className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Nama
                  <input className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/10" placeholder="Nama lengkap" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">
                  Email
                  <input className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/10" placeholder="email@domain.com" />
                </label>
              </div>
              <label className="space-y-2 text-sm font-semibold text-slate-700">
                Pesan Anda
                <textarea className="min-h-[140px] w-full rounded-[2rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)]/60 focus:ring-2 focus:ring-[var(--color-primary)]/10" placeholder="Tulis pesan atau pertanyaan Anda di sini..."></textarea>
              </label>
              <button type="button" className="rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(37,99,235,0.24)] transition hover:bg-blue-600">
                Kirim Pesan
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
};

export default Contact;
