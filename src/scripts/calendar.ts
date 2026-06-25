import { getHorarios, type Slot } from "../lib/api";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

interface CalendarOpts {
  calEl: HTMLElement;
  slotsEl: HTMLElement;
  fechaInput: HTMLInputElement;
  horaInput: HTMLInputElement;
}

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function initCalendar({ calEl, slotsEl, fechaInput, horaInput }: CalendarOpts) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selected: Date | null = null;

  function selectDate(d: Date) {
    selected = d;
    fechaInput.value = iso(d);
    horaInput.value = "";
    render();
    loadSlots(iso(d));
  }

  async function loadSlots(fechaISO: string) {
    slotsEl.innerHTML =
      '<span class="text-sm text-white/40">Buscando horarios disponibles...</span>';
    const slots = await getHorarios(fechaISO);
    renderSlots(slots);
  }

  function renderSlots(slots: Slot[]) {
    if (!slots.length) {
      slotsEl.innerHTML =
        '<span class="text-sm text-white/40">No hay horarios para este día.</span>';
      return;
    }
    slotsEl.innerHTML = "";
    slots.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = s.hora;
      b.disabled = !s.disponible;
      b.className = s.disponible
        ? "slot rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        : "rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/25 line-through cursor-not-allowed";
      if (s.disponible) {
        b.addEventListener("click", () => {
          horaInput.value = s.hora;
          slotsEl.querySelectorAll(".slot").forEach((el) =>
            el.classList.remove("bg-[var(--accent)]", "text-black", "border-[var(--accent)]"),
          );
          b.classList.add("bg-[var(--accent)]", "text-black", "border-[var(--accent)]");
          b.classList.remove("text-white");
        });
      }
      slotsEl.appendChild(b);
    });
  }

  function render() {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const startDay = (first.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDisabled =
      year === today.getFullYear() && month === today.getMonth();

    let html = `
      <div class="mb-3 flex items-center justify-between">
        <button type="button" data-cal-prev ${prevDisabled ? "disabled" : ""}
          class="h-8 w-8 rounded-full border border-white/15 text-white transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:hover:border-white/15">‹</button>
        <span class="display text-lg tracking-wide text-white">${MESES[month]} ${year}</span>
        <button type="button" data-cal-next
          class="h-8 w-8 rounded-full border border-white/15 text-white transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">›</button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center">
        ${DIAS.map((d) => `<span class="py-1 text-[0.65rem] uppercase tracking-wider text-white/40">${d}</span>`).join("")}
    `;

    for (let i = 0; i < startDay; i++) html += `<span></span>`;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const past = d < today;
      const isSel = selected && iso(selected) === iso(d);
      const base =
        "aspect-square rounded-lg text-sm transition-colors flex items-center justify-center";
      let cls: string;
      if (past) {
        cls = `${base} text-white/20 cursor-not-allowed`;
      } else if (isSel) {
        cls = `${base} bg-[var(--accent)] text-black font-bold`;
      } else {
        cls = `${base} text-white hover:bg-white/10 hover:text-[var(--accent)] cursor-pointer`;
      }
      html += `<button type="button" class="${cls}" data-day="${day}" ${past ? "disabled" : ""}>${day}</button>`;
    }

    html += `</div>`;
    calEl.innerHTML = html;

    calEl.querySelector("[data-cal-prev]")?.addEventListener("click", () => {
      view = new Date(year, month - 1, 1);
      render();
    });
    calEl.querySelector("[data-cal-next]")?.addEventListener("click", () => {
      view = new Date(year, month + 1, 1);
      render();
    });
    calEl.querySelectorAll<HTMLButtonElement>("[data-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const day = parseInt(btn.dataset.day!, 10);
        selectDate(new Date(year, month, day));
      });
    });
  }

  render();
}
