import { HiShieldCheck, HiSparkles, HiUserGroup, HiHeart } from "react-icons/hi";

const services = [
  {
    title: "Rekam Medis Digital",
    description: "Simpan dan akses semua riwayat kesehatan dengan mudah melalui dashboard yang aman dan terintegrasi.",
    icon: HiShieldCheck,
  },
  {
    title: "Konsultasi Dokter",
    description: "Buat janji temu dan konsultasi dengan tenaga medis tanpa harus datang ke rumah sakit.",
    icon: HiSparkles,
  },
  {
    title: "Pemantauan Kesehatan",
    description: "Pantau status perawatan, obat, dan hasil pemeriksaan dalam satu tampilan yang mudah dibaca.",
    icon: HiUserGroup,
  },
  {
    title: "Dukungan Penuh",
    description: "Dukungan teknis dan layanan kesehatan membantu Anda menggunakan aplikasi dengan lancar.",
    icon: HiHeart,
  },
];

const Service = () => {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,rgba(56,189,248,0.08),rgba(96,165,250,0.12))] px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-7xl space-y-14">
        <div className="rounded-[2rem] bg-[var(--color-secondary)] p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/90 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200">
                <HiSparkles className="h-5 w-5 text-[var(--color-primary)]" />
                Layanan Kami
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                  Temukan layanan kesehatan digital yang mendukung setiap proses perawatan.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  HEALINK menyediakan fitur lengkap dari rekam medis digital hingga konsultasi dokter, dibuat untuk membantu pengguna mengelola kesehatan dengan lebih sederhana dan aman.
                </p>
              </div>
            </div>
            <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70">
              <div className="rounded-[1.75rem] bg-[var(--color-primary)]/5 p-6 text-slate-950 ring-1 ring-[var(--color-primary)]/10">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Mengapa pilih HEALINK</p>
                <h2 className="mt-4 text-3xl font-bold">Layanan dirancang untuk kenyamanan dan kepercayaan pengguna.</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Nikmati akses cepat ke riwayat kesehatan, konsultasi online, dan pemantauan terpusat, didukung oleh sistem yang aman dan mudah dipakai.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm shadow-slate-200">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-sm shadow-slate-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-[2rem] bg-[var(--color-secondary)] p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/90 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200">
                Fokus Pelayanan
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Solusi lengkap untuk perjalanan kesehatan Anda.</h2>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                Dari pengelolaan catatan medis hingga dukungan teknis, setiap fitur di HEALINK dirancang agar proses kesehatan Anda lebih terorganisir dan mudah diakses.
              </p>
            </div>
            <div className="space-y-4 rounded-[1.75rem] bg-white p-6 shadow-sm shadow-slate-200">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <HiUserGroup className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-950">Akses kapan saja</p>
                  <p className="mt-2 text-sm text-slate-600">Gunakan HEALINK kapan pun dari perangkat apa pun.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                  <HiHeart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-950">Perawatan terintegrasi</p>
                  <p className="mt-2 text-sm text-slate-600">Semua layanan kesehatan Anda tersimpan dalam satu ekosistem.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default Service;
