"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  HeartHandshake,
  Menu,
  X,
  ArrowRight,
  Users,
  CalendarHeart,
  MapPin,
  Stethoscope,
  Pill,
  Activity,
  ShieldCheck,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
} from "lucide-react";

/* ---------- Scroll reveal ---------- */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Animated counter ---------- */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const duration = 1600;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      +{value.toLocaleString("es-VE")}
      {suffix}
    </span>
  );
}

const navLinks = [
  { label: "Nosotros", href: "#nosotros" },
  { label: "Impacto", href: "#impacto" },
  { label: "Programas", href: "#programas" },
  { label: "Contacto", href: "#contacto" },
];

const metrics = [
  { icon: Users, target: 15000, label: "Pacientes atendidos", tone: "bg-blue-50 text-blue-800" },
  {
    icon: CalendarHeart,
    target: 120,
    label: "Jornadas médicas (Abordajes)",
    tone: "bg-sky-50 text-sky-700",
  },
  {
    icon: MapPin,
    target: 50,
    label: "Comunidades beneficiadas",
    tone: "bg-emerald-50 text-emerald-700",
  },
];

const programs = [
  {
    icon: Stethoscope,
    title: "Jornadas Médicas Comunitarias",
    desc: "Llevamos equipos de salud a las comunidades para brindar consultas, triaje y atención integral totalmente gratuita.",
  },
  {
    icon: Pill,
    title: "Entrega de Medicamentos",
    desc: "Nuestra farmacia comunitaria garantiza el acceso a tratamientos y medicinas esenciales sin costo para las familias.",
  },
  {
    icon: Activity,
    title: "Perfil Epidemiológico y Prevención",
    desc: "Analizamos datos de salud para anticipar brotes, diseñar campañas preventivas y proteger a las poblaciones vulnerables.",
  },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* ---------- Header ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center">
              <Image src="/minilogo.png" alt="Logo Tejiendo Redes" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-lg font-extrabold leading-tight tracking-tight text-[#1e3a8a]">
              Tejiendo Redes
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-[#1e3a8a]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Iniciar Sesión
            </Link>
            <a
              href="#contacto"
              className="rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-900 hover:shadow-blue-900/30"
            >
              Únete como Voluntario
            </a>
          </div>

          <button
            className="rounded-lg p-2 text-slate-700 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
                >
                  Iniciar Sesión
                </Link>
                <a
                  href="#contacto"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Únete como Voluntario
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section id="inicio" className="relative overflow-hidden pt-20">
        <img
          src="/login-bg.jpg"
          alt="Voluntarios brindando atención médica en la comunidad"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/95 via-blue-900/85 to-blue-950/90" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-sky-100 backdrop-blur">
                <ShieldCheck className="h-4 w-4" /> Aliados de UNICEF y ACNUR
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                La salud es un derecho, <span className="text-sky-300">no un privilegio</span>.
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100">
                Juntos tejemos redes de esperanza para quienes más lo necesitan, llevando atención
                médica gratuita y de calidad a tu comunidad.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-[#1e3a8a] shadow-xl shadow-blue-950/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  Quiero ser voluntario
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#programas"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
                >
                  Conoce nuestros programas
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Metrics ---------- */}
      <section id="impacto" className="relative -mt-16 pb-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 120}>
                <div className="rounded-2xl border border-slate-100 bg-white/90 p-7 text-center shadow-xl shadow-slate-900/5 backdrop-blur">
                  <span
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${m.tone}`}
                  >
                    <m.icon className="h-7 w-7" />
                  </span>
                  <p className="mt-5 text-4xl font-extrabold tracking-tight text-[#1e3a8a]">
                    <Counter target={m.target} />
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{m.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Nosotros ---------- */}
      <section id="nosotros" className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/10">
              <img
                src="/login-bg.jpg"
                alt="Equipo médico de la Fundación Tejiendo Redes"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-sky-600">
                Quiénes somos
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Una red humana al servicio de la comunidad
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                La Fundación Tejiendo Redes es una ONG médica comunitaria que trabaja de la mano con
                aliados internacionales como UNICEF y ACNUR para garantizar el acceso a la salud de
                las poblaciones más vulnerables de Venezuela.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Atención médica 100% gratuita",
                  "Equipos multidisciplinarios de salud",
                  "Presencia en comunidades de difícil acceso",
                ].map((point) => (
                  <li key={point} className="flex items-center gap-3 text-slate-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Programas ---------- */}
      <section id="programas" className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-sky-600">
              Lo que hacemos
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tres pilares para transformar vidas
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Cada programa está diseñado para brindar salud integral, digna y sostenible.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {programs.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <div className="group h-full rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/20 transition-transform group-hover:scale-105">
                    <p.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Alianzas ---------- */}
      <section className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Con el apoyo de:
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale">
              {["UNICEF", "ACNUR", "Universidad Central", "Cruz Roja"].map((name) => (
                <span
                  key={name}
                  className="text-2xl font-extrabold tracking-tight text-slate-400 transition-colors hover:text-slate-600"
                >
                  {name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- CTA final ---------- */}
      <section id="contacto" className="px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#1e3a8a] px-8 py-16 text-center shadow-2xl shadow-blue-900/30 sm:px-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Médicos, estudiantes y voluntarios: los necesitamos
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
                Súmate al Sistema de Registro Tejiendo Redes y ayúdanos a llevar salud a más
                comunidades. Tu tiempo puede cambiar una vida.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-[#1e3a8a] shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Regístrate ahora
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-slate-100 bg-slate-900 py-14 text-slate-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center">
                  <Image src="/minilogo.png" alt="Logo Tejiendo Redes" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-lg font-extrabold text-white">Tejiendo Redes</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                Tejiendo redes de esperanza y salud para las comunidades más vulnerables de
                Venezuela.
              </p>
              <div className="mt-5 flex gap-3">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 transition-colors hover:bg-[#1e3a8a] hover:text-white"
                    aria-label="Red social"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Enlaces</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-slate-400 transition-colors hover:text-white">
                      {l.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link href="/login" className="text-slate-400 transition-colors hover:text-white">
                    Iniciar Sesión
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contacto</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> contacto@tejiendoredes.org
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> +58 212 000 0000
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Caracas, Venezuela
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>Sistema de Registro Tejiendo Redes © 2026</p>
            <div className="flex gap-6">
              <a href="#" className="transition-colors hover:text-slate-300">
                Términos y condiciones
              </a>
              <a href="#" className="transition-colors hover:text-slate-300">
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
