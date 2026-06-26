// ============================================================
// 2K16 Barber Shop — datos del negocio (fuente única de verdad)
// Mantené estos datos IDÉNTICOS a tu ficha de Google Business
// (Nombre · Dirección · Teléfono = "NAP"). La consistencia NAP
// entre la web y Google Maps es lo que más pesa para posicionar
// en las búsquedas locales / "barbería cerca de mí".
// ============================================================

export const SITE_URL = "https://2kbarber.pr4zka.online";

export const business = {
  name: "2K16 Barber Shop",
  legalName: "2K16 Barber Shop",
  description:
    "Barbería en Luque, Paraguay. Cortes de cabello, arreglo de barba y afeitado clásico con estilo street. Reservá tu turno online.",
  // Dirección (debe coincidir con Google Business)
  street: "Herrero Bueno casi",
  city: "Luque",
  region: "Central",
  postalCode: "2060",
  country: "PY",
  // Coordenadas exactas (de la ficha de Google Maps)
  lat: -25.2588803,
  lng: -57.4908476,
  // Contacto — ambos WhatsApp
  phones: [
    { label: "WhatsApp principal", e164: "+595984198356", wa: "595984198356", primary: true },
    { label: "WhatsApp", e164: "+595991430366", wa: "595991430366", primary: false },
  ],
  // Enlace de la ficha de Google Maps
  maps: "https://maps.app.goo.gl/cHTXmYwcRvf7PQiT9?g_st=iw",
  mapsPlace:
    "https://www.google.com/maps/place/2k16barbershop/data=!4m2!3m1!1s0x0:0x316e0e6d3b72d88a",
  // Redes (dejá "#" si todavía no tenés)
  instagram: "#",
  // Horarios
  hours: [
    { d: "Lun a Vie", h: "9:00 – 20:00" },
    { d: "Sábado", h: "9:00 – 18:00" },
    { d: "Domingo", h: "Cerrado" },
  ],
  priceRange: "₲₲",
} as const;

// Mensaje pre-cargado del botón de WhatsApp
export const waMessage = encodeURIComponent(
  "¡Hola! Quiero reservar un turno en 2K16 Barber Shop 💈",
);

export function waLink(wa: string): string {
  return `https://wa.me/${wa}?text=${waMessage}`;
}

// Indicaciones paso a paso hacia el local (abre Google Maps con la ruta)
export const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`;

// Mapa embebido — el `(Etiqueta)` fuerza un pin visible con el nombre del local
export const mapEmbed = `https://maps.google.com/maps?q=${business.lat},${business.lng}(${encodeURIComponent(
  business.name,
)})&z=17&hl=es&output=embed`;

export const primaryPhone =
  business.phones.find((p) => p.primary) ?? business.phones[0];

// Schema.org JSON-LD — BarberShop (LocalBusiness). Le dice a Google
// exactamente qué negocio sos, dónde estás y cómo contactarte.
export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "BarberShop",
  "@id": `${SITE_URL}/#barbershop`,
  name: business.name,
  description: business.description,
  url: SITE_URL,
  image: `${SITE_URL}/logo.png`,
  logo: `${SITE_URL}/logo.png`,
  telephone: primaryPhone.e164,
  priceRange: business.priceRange,
  currenciesAccepted: "PYG",
  address: {
    "@type": "PostalAddress",
    streetAddress: business.street,
    addressLocality: business.city,
    addressRegion: business.region,
    postalCode: business.postalCode,
    addressCountry: business.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: business.lat,
    longitude: business.lng,
  },
  hasMap: business.mapsPlace,
  sameAs: [business.mapsPlace, business.maps].filter((u) => u && u !== "#"),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "18:00",
    },
  ],
  areaServed: { "@type": "City", name: "Luque" },
  contactPoint: business.phones.map((p) => ({
    "@type": "ContactPoint",
    telephone: p.e164,
    contactType: "reservations",
    availableLanguage: ["Spanish"],
  })),
};
