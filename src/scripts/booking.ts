import { crearCita } from "../lib/api";
import { initCalendar } from "./calendar";

export function initBooking() {
  const form = document.getElementById("reserva-form") as HTMLFormElement | null;
  const msg = document.getElementById("reserva-msg");
  const submit = document.getElementById("reserva-submit") as HTMLButtonElement | null;
  if (!form || !msg || !submit) return;

  // Calendario + horarios
  const calEl = document.getElementById("cal");
  const slotsEl = document.getElementById("slots");
  const fechaInput = document.getElementById("fecha") as HTMLInputElement | null;
  const horaInput = document.getElementById("hora") as HTMLInputElement | null;
  if (calEl && slotsEl && fechaInput && horaInput) {
    initCalendar({ calEl, slotsEl, fechaInput, horaInput });
  }

  const setMsg = (text: string, kind: "ok" | "error" | "info") => {
    msg.textContent = text;
    msg.style.color =
      kind === "ok" ? "#7CFFB2" : kind === "error" ? "#FF6B6B" : "rgba(255,255,255,0.6)";
  };

  const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = String(data.get("nombre") || "").trim();
    const correo = String(data.get("correo") || "").trim();
    const numero = String(data.get("numero") || "").trim();
    const fecha = String(data.get("fecha") || "").trim();
    const hora = String(data.get("hora") || "").trim();

    if (!nombre || !correo || !numero) {
      setMsg("Completá todos los campos, capo.", "error");
      return;
    }
    if (!emailOk(correo)) {
      setMsg("Ese correo no parece válido.", "error");
      return;
    }
    if (!fecha) {
      setMsg("Elegí un día en el calendario.", "error");
      return;
    }
    if (!hora) {
      setMsg("Elegí un horario disponible.", "error");
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Enviando...";
    setMsg("Reservando tu lugar...", "info");

    const res = await crearCita({ nombre, correo, numero, fecha, hora });

    if (res.ok) {
      setMsg("¡Listo! Tu turno fue solicitado. Te contactamos para confirmar. ✂♛", "ok");
      form.reset();
    } else {
      setMsg(res.error ?? "Algo salió mal. Probá de nuevo en un rato.", "error");
    }

    submit.disabled = false;
    submit.textContent = original;
  });
}
