import { HiSparkles, HiUsers, HiShieldCheck, HiClipboardList } from "react-icons/hi";
import DitaFoto from "../../assets/img/our-team/dita.png";
import ArhamFoto from "../../assets/img/our-team/arham.png";
import RyanFoto from "../../assets/img/our-team/ryan.png";
// import DitaFoto from "../../assets/img/our-team/dita.png";

const teamMembers = [
  {
    name: "Alif Alfarizi",
    nim: "105240003",
    role: "Insfrastruktur & DevOps",
    avatarUrl: "https://i.pravatar.cc/150?img=10",
  },
  {
    name: "Dita Ramadhanti",
    nim: "105240019",
    role: "Chaincode Developer - Smart Contract",
    avatarUrl: DitaFoto,
  },
  {
    name: "M Arham Juanriana",
    nim: "105240036",
    role: "Backend Developer - SDK Integration",
    avatarUrl: ArhamFoto,
  },
  {
    name: "Ryan Rahmabakti",
    nim: "105240013",
    role: "Frontend Developer - QA Tester",
    avatarUrl: RyanFoto,
  },
];

const About = () => {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,rgba(56,189,248,0.08),rgba(96,165,250,0.12))] px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-7xl space-y-14">
        <div className="rounded-[2rem] bg-[var(--color-secondary)] p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/90 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200">
                <HiSparkles className="h-5 w-5 text-[var(--color-primary)]" />
                Tentang HEALINK
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                  Platform kesehatan digital yang membawamu lebih dekat dengan perawatan berkualitas.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  HEALINK menciptakan pengalaman kesehatan digital yang aman, mudah diakses, dan terpadu. Mulai dari penyimpanan rekam medis hingga konsultasi virtual, kami membantu pasien dan tenaga medis berinteraksi dengan lebih cepat.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <HiShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">Keamanan Terjamin</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Semua data medis tersimpan di lingkungan yang aman dengan kontrol akses yang ketat.</p>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                    <HiClipboardList className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">Layanan Terintegrasi</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Kelola riwayat kesehatan, janji temu, dan informasi medis dalam satu dashboard yang mudah digunakan.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70">
              <div className="rounded-[1.75rem] bg-[var(--color-primary)]/5 p-6 text-slate-950 ring-1 ring-[var(--color-primary)]/10">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Misi Kami</p>
                <h2 className="mt-4 text-3xl font-bold">Meningkatkan akses kesehatan digital untuk semua pengguna.</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Kami percaya bahwa setiap orang berhak menerima perawatan medis yang cepat, terintegrasi, dan dapat dipercaya - kapan saja dan di mana saja.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] bg-white/95 p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/90 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
                <HiUsers className="h-5 w-5" />
                Our Team
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Tim proyek HEALINK</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Empat orang berbakat bersatu untuk mengembangkan platform kesehatan digital yang mudah digunakan dan dapat diandalkan.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {teamMembers.map((member) => {
              const initials = member.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("");

              return (
                <div
                  key={member.nim}
                  className="flex h-full flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-[var(--color-secondary)] p-6 text-slate-900 shadow-sm shadow-slate-200 min-h-[280px]"
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="h-20 w-20 rounded-full object-cover shadow-sm shadow-slate-200"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] shadow-sm shadow-slate-200">
                        <span className="text-2xl font-semibold">{initials}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-slate-950 break-words">{member.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">NIM {member.nim}</p>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm leading-6 text-slate-700 break-words">{member.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
};

export default About;
