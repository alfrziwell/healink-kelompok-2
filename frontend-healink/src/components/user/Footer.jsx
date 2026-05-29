import { Link } from 'react-router-dom';
import { FaHeartbeat, FaLinkedinIn, FaTwitter, FaInstagram } from 'react-icons/fa';
import { HiOutlineHeart } from 'react-icons/hi';

const companyLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Our Team', to: '/about' },
  { label: 'Careers', to: '/contact' },
  { label: 'Contact', to: '/contact' },
];

const serviceLinks = [
  { label: 'Rekam Medis', to: '/services' },
  { label: 'Diagnosa Digital', to: '/services' },
  { label: 'Data Pasien', to: '/services' },
  { label: 'Rumah Sakit', to: '/services' },
];

const resourceLinks = [
  { label: 'Documentation', to: '/services' },
  { label: 'Help Center', to: '/contact' },
  { label: 'Blog', to: '/' },
  { label: 'Community', to: '/contact' },
];

const legalLinks = [
  { label: 'Terms of Service', to: '/contact' },
  { label: 'Privacy Policy', to: '/contact' },
  { label: 'Cookie Policy', to: '/contact' },
];

const Footer = () => {
  return (
    <footer className="font-poppins">
      {/* CTA banner */}
      <section className="bg-primary px-4 py-14 text-center sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
          Rekam Medis Terpercaya dengan Blockchain
        </h2>
        <Link
          to="/login"
          className="mt-8 inline-flex rounded-full bg-accent px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-accent/90"
        >
          Get Started
        </Link>
      </section>

      {/* Links grid */}
      <section className="bg-slate-900 px-4 py-14 text-slate-300 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                <FaHeartbeat className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold text-white">HEALINK</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Platform rekam medis berbasis blockchain untuk keamanan data pasien,
              traceability diagnosa, dan kolaborasi rumah sakit yang terpercaya.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-primary hover:text-primary"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-primary hover:text-primary"
                aria-label="Twitter"
              >
                <FaTwitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-primary hover:text-primary"
                aria-label="Instagram"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-400 transition hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services / Industries */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Services</h3>
            <ul className="mt-4 space-y-3">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-400 transition hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Resources</h3>
            <ul className="mt-4 space-y-3">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-400 transition hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-400 transition hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <section className="border-t border-slate-800 bg-slate-950 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} HEALINK. All rights reserved.</p>
          <p className="inline-flex items-center gap-1">
            Made with
            <HiOutlineHeart className="h-4 w-4 text-primary" />
            by HEALINK
          </p>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
