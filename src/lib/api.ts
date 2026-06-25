// Integración con el backend propio (https://api.pr4zka.online/api).
// El endpoint de citas aún no existe en el backend; cuando lo crees,
// ajustá PUBLIC_CITAS_PATH en .env o el payload/headers acá abajo.

const BASE = import.meta.env.PUBLIC_API_BASE ?? "https://api.pr4zka.online/api";
const CITAS_PATH = import.meta.env.PUBLIC_CITAS_PATH ?? "/citas";
const HORARIOS_PATH = import.meta.env.PUBLIC_HORARIOS_PATH ?? "/horarios";

export interface CitaPayload {
  nombre: string;
  correo: string;
  numero: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
}

export interface Slot {
  hora: string;
  disponible: boolean;
}

// Horarios disponibles para una fecha. Cuando el backend exponga el endpoint
// /horarios?fecha=YYYY-MM-DD, se usan sus datos; si no, cae a una franja por defecto.
export async function getHorarios(fechaISO: string): Promise<Slot[]> {
  const url = `${BASE.replace(/\/$/, "")}${HORARIOS_PATH}?fecha=${encodeURIComponent(fechaISO)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        return data.map((x: any) =>
          typeof x === "string"
            ? { hora: x, disponible: true }
            : {
                hora: x.hora ?? x.time ?? "",
                disponible: x.disponible ?? x.available ?? true,
              },
        );
      }
    }
  } catch {
    // sin conexión / endpoint inexistente -> fallback
  }
  return defaultSlots();
}

function defaultSlots(): Slot[] {
  const out: Slot[] = [];
  for (let h = 9; h < 20; h++) {
    for (const mm of ["00", "30"]) {
      out.push({ hora: `${String(h).padStart(2, "0")}:${mm}`, disponible: true });
    }
  }
  return out;
}

export interface CitaResult {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
}

export async function crearCita(payload: CitaPayload): Promise<CitaResult> {
  const url = `${BASE.replace(/\/$/, "")}${CITAS_PATH}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Si el endpoint requiere token:
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    let data: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        error:
          (data as any)?.message ??
          `El servidor respondió ${res.status}. (Falta crear el endpoint ${CITAS_PATH}?)`,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err) {
    // Probable CORS o backend caído / endpoint inexistente.
    return {
      ok: false,
      status: 0,
      error:
        "No se pudo conectar con el servidor. Verificá el endpoint de citas y CORS en el backend.",
    };
  }
}
