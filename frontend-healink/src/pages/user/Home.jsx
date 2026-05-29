import { HiSparkles, HiShieldCheck, HiUserGroup } from "react-icons/hi";

const Home = () => {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,rgba(96,165,250,0.16),rgba(56,189,248,0.04))] px-6 py-10 text-slate-900">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 rounded-[2.25rem] bg-[var(--color-secondary)] p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/90 md:p-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="space-y-8 lg:w-1/2">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200">
              <HiSparkles className="h-5 w-5 text-[var(--color-primary)]" />
              Solusi kesehatan digital modern untuk Anda
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                HEALINK — <span className="text-[var(--color-primary)]">aman</span>, <span className="text-[var(--color-accent)]">cepat</span>, dan <span className="text-[var(--color-primary)]">terpercaya</span>.
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Akses rekam medis, konsultasi dokter, dan layanan kesehatan lain dalam satu platform yang dirancang untuk kenyamanan dan keamanan Anda.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(37,99,235,0.24)] transition hover:-translate-y-0.5 hover:bg-blue-600">
                Mulai Sekarang
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                Pelajari Lebih Lanjut
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-white p-5 text-slate-900 shadow-sm shadow-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <HiShieldCheck className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold">Keamanan Data</p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-5 text-slate-900 shadow-sm shadow-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                  <HiSparkles className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold">Pengalaman Intuitif</p>
              </div>
              <div className="rounded-[1.5rem] bg-white p-5 text-slate-900 shadow-sm shadow-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <HiUserGroup className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold">Akses untuk Semua</p>
              </div>
            </div>
          </div>

          <div className="relative lg:w-1/2">
            <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-[var(--color-primary)]/15 blur-2xl" />
            <div className="absolute -right-10 bottom-10 h-32 w-32 rounded-full bg-[var(--color-accent)]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-xl shadow-slate-200/60">
              <div className="mb-8 rounded-[1.75rem] bg-[var(--color-primary)]/5 p-6 text-slate-950 ring-1 ring-[var(--color-primary)]/10">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Highlight HEALINK</p>
                <h2 className="mt-5 text-3xl font-bold">Kelola kesehatan Anda tanpa batasan.</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Akses catatan medis, jadwal konsultasi, dan dukungan ahli kapan saja dengan tampilan yang bersih dan mudah digunakan.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Pengingat otomatis</p>
                  <p className="mt-2 text-sm text-slate-600">Jangan lewatkan jadwal konsultasi dan perawatan penting.</p>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Riwayat medis terpusat</p>
                  <p className="mt-2 text-sm text-slate-600">Semua informasi kesehatan terkonsolidasi di satu dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;