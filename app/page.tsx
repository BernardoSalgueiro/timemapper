"use client";

// import de bibliotecas ou arquivos necessários
import { useState } from "react";
import { translations } from "./lang/translations";


type Location = {
  id: number;
  label: string;
  latitude: string;
  longitude: string;
};

// Página inicial (home)
export default function Home() {

  // Lógica para alterar o idioma do site (pt, en, es)
  const [language, setLanguage] = useState<keyof typeof translations>("pt");
  const t = translations[language];

  // Lógica da API para converter o horário


  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  const [timezoneOrigem, setTimezoneOrigem] = useState("");
  const [timezoneDestino, setTimezoneDestino] = useState("");

  const [horaOrigem, setHoraOrigem] = useState("");
  const [horaDestino, setHoraDestino] = useState("");

  const [sugestoesOrigem, setSugestoesOrigem] = useState<Location[]>([]);
  const [sugestoesDestino, setSugestoesDestino] = useState<Location[]>([]);

  const [campoAtivo, setCampoAtivo] = useState<"origem" | "destino">("origem");

  async function buscarLocais(texto: string, tipo: "origem" | "destino") {
    if (texto.length < 2) {
      tipo === "origem" ? setSugestoesOrigem([]) : setSugestoesDestino([]);
      return;
    }

    const response = await fetch(`/api/locations?query=${encodeURIComponent(texto)}&lang=${language}`);
    const data = await response.json();

    tipo === "origem" ? setSugestoesOrigem(data) : setSugestoesDestino(data);
  }

  async function selecionarLocal(local: Location, tipo: "origem" | "destino") {
    const response = await fetch(
      `/api/timezone?lat=${local.latitude}&lng=${local.longitude}`
    );

    const data = await response.json();

    if (tipo === "origem") {
      setOrigem(local.label);
      setTimezoneOrigem(data.timezone);
      setSugestoesOrigem([]);
      return;
    }

    setDestino(local.label);
    setTimezoneDestino(data.timezone);
    setSugestoesDestino([]);
  }

  async function converterHorario() {
    if (!timezoneOrigem || !timezoneDestino) {
      alert("Selecione origem e destino nas sugestões.");
      return;
    }

    const time = campoAtivo === "origem" ? horaOrigem : horaDestino;

    if (!time) {
      alert("Informe um horário.");
      return;
    }

    const response = await fetch("/api/convert-time", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        time,
        fromTimezone: campoAtivo === "origem" ? timezoneOrigem : timezoneDestino,
        toTimezone: campoAtivo === "origem" ? timezoneDestino : timezoneOrigem,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erro ao converter horário.");
      return;
    }

    if (campoAtivo === "origem") {
      setHoraDestino(data.result);
    } else {
      setHoraOrigem(data.result);
    }
  }

  function limparCampos() {
    setOrigem("");
    setDestino("");

    setTimezoneOrigem("");
    setTimezoneDestino("");

    setHoraOrigem("");
    setHoraDestino("");

    setSugestoesOrigem([]);
    setSugestoesDestino([]);

    setCampoAtivo("origem");
  }

  // estrutura do site (HTML)
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-row justify-between">
          <h1 className="inline-block border-b-2 border-amber-300 p-2 text-2xl font-bold font-mono sm:text-3xl lg:text-4xl">
            {t.title}
          </h1>

          <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as keyof typeof translations)}
          className="bg-zinc-900 p-2 rounded-lg outline-none ml-4" name="" id=""
          >
            <option value="pt">🇵🇹 Português</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>

        <p className="py-4 text-sm font-sans sm:text-base lg:text-lg">
          {t.description}
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="relative rounded-2xl bg-zinc-900 p-4 shadow-lg">
            <label className="mb-2 block font-sans font-bold">{t.origin}</label>

            <input
              type="text"
              value={origem}
              onChange={(e) => {
                setOrigem(e.target.value);
                setTimezoneOrigem("");
                buscarLocais(e.target.value, "origem");
              }}
              placeholder={t.fieldText}
              className="w-full rounded-lg bg-zinc-800 p-3 text-sm outline-none sm:text-base"
            />

            {sugestoesOrigem.length > 0 && (
              <ul className="absolute z-50 mt-2 max-h-56 w-[calc(100%-2rem)] overflow-auto rounded-lg bg-zinc-800 shadow-lg">
                {sugestoesOrigem.map((local) => (
                  <li
                    key={local.id}
                    onClick={() => selecionarLocal(local, "origem")}
                    className="cursor-pointer p-3 text-sm hover:bg-zinc-700"
                  >
                    {local.label}
                  </li>
                ))}
              </ul>
            )}

            <input
              type="time"
              value={horaOrigem}
              onFocus={() => setCampoAtivo("origem")}
              onChange={(e) => {
                setHoraOrigem(e.target.value);
                setCampoAtivo("origem");
              }}
              className="mt-3 w-full rounded-lg bg-zinc-800 p-3 text-sm outline-none sm:text-base"
            />
          </div>

          <div className="relative rounded-2xl bg-zinc-900 p-4 shadow-lg">
            <label className="mb-2 block font-sans font-bold">{t.destination}</label>

            <input
              type="text"
              value={destino}
              onChange={(e) => {
                setDestino(e.target.value);
                setTimezoneDestino("");
                buscarLocais(e.target.value, "destino");
              }}
              placeholder={t.fieldText}
              className="w-full rounded-lg bg-zinc-800 p-3 text-sm outline-none sm:text-base"
            />

            {sugestoesDestino.length > 0 && (
              <ul className="absolute z-50 mt-2 max-h-56 w-[calc(100%-2rem)] overflow-auto rounded-lg bg-zinc-800 shadow-lg">
                {sugestoesDestino.map((local) => (
                  <li
                    key={local.id}
                    onClick={() => selecionarLocal(local, "destino")}
                    className="cursor-pointer p-3 text-sm hover:bg-zinc-700"
                  >
                    {local.label}
                  </li>
                ))}
              </ul>
            )}

            <input
              type="time"
              value={horaDestino}
              onFocus={() => setCampoAtivo("destino")}
              onChange={(e) => {
                setHoraDestino(e.target.value);
                setCampoAtivo("destino");
              }}
              className="mt-3 w-full rounded-lg bg-zinc-800 p-3 text-sm outline-none sm:text-base"
            />
          </div>
        </div>
        
        <p className="mt-6 text-sm text-zinc-400">{t.info}</p>

        <button
          type="button"
          onClick={converterHorario}
          className="mt-6 w-full rounded-lg bg-amber-300 p-3 font-bold text-zinc-950 transition hover:bg-amber-400"
        >
          {t.convert}
        </button>

        <button
          type="button"
          onClick={limparCampos}
          className="flex-1 mt-3 w-full rounded-lg border border-zinc-600 bg-zinc-800 p-3 font-bold transition hover:bg-zinc-700 "
        >
          Limpar
        </button>

      </section>
    </main>
  );
}