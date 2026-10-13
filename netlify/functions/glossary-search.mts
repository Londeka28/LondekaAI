import type { Config } from "@netlify/functions";
import { ilike, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { glossaryTerms } from "../../db/schema.js";

const CURATED_TERMS = [
  {
    english_term: "Artificial Gravity",
    isizulu_wording: "Amandla adonsela phansi okwenziwa",
    afrikaans_wording: "Kunsmatige swaartekrag",
    definition: "The creation of an inertial force that mimics gravitational attraction, typically by rotating a spacecraft or habitat hull.",
    example: "The rotating torus provides 0.8g of artificial gravity for crew health and bone density preservation.",
    status: "approved",
  },
  {
    english_term: "Life Support System (ECLSS)",
    isizulu_wording: "Uhlelo Lokusekela Impilo",
    afrikaans_wording: "Lewensondersteuningstelsel",
    definition: "An integrated suite of hardware that provides breathable atmosphere, water recycling, thermal control, and waste management.",
    example: "The closed-loop life support system recovers 98% of moisture from crew perspiration and respiration.",
    status: "approved",
  },
  {
    english_term: "Radiation Shielding",
    isizulu_wording: "Isivikelo Semisebe Yasemkhathini",
    afrikaans_wording: "Stralingsbeskerming",
    definition: "Structural materials and electromagnetic barriers designed to protect human occupants and electronics from cosmic rays and solar storms.",
    example: "A two-meter layer of compacted regolith lines the exterior shell for radiation shielding.",
    status: "approved",
  },
  {
    english_term: "Regolith",
    isizulu_wording: "Inhlabathi Yasemkhathini",
    afrikaans_wording: "Regoliet",
    definition: "The layer of unconsolidated rocky material covering bedrock on the Moon, Mars, or asteroids, commonly used for in-situ resource utilization.",
    example: "Excavated regolith was sintered to build radiation-hardened landing pads.",
    status: "approved",
  },
  {
    english_term: "Solar Array",
    isizulu_wording: "Uxhaxha Lwamapaneli Elanga",
    afrikaans_wording: "Sonpaneelreeks",
    definition: "An interconnected grid of photovoltaic cells that converts solar irradiance into electrical power for settlement subsystems.",
    example: "Bifacial solar arrays pivot continuously to optimize sunlight capture during orbital daylight.",
    status: "approved",
  },
  {
    english_term: "Orbital Velocity",
    isizulu_wording: "Isivinini Sokujikeleza",
    afrikaans_wording: "Wentelbaanspoed",
    definition: "The horizontal velocity required to balance gravitational attraction and maintain a stable orbit around a celestial body.",
    example: "The habitat maintains a circular low-Earth orbital velocity of roughly 7.7 km per second.",
    status: "approved",
  },
  {
    english_term: "Airlock",
    isizulu_wording: "Isango Lomoya Elikhethekile",
    afrikaans_wording: "Lugsluis",
    definition: "A compartmentalized chamber with dual airtight seals allowing ingress and egress between pressurized modules and the vacuum of space.",
    example: "Astronauts cycle the airlock down to vacuum before beginning extravehicular activity (EVA).",
    status: "approved",
  },
  {
    english_term: "Atmospheric Revitalization",
    isizulu_wording: "Ukuvuselelwa Komoya Wokuphefumula",
    afrikaans_wording: "Atmosferiese Hernuwing",
    definition: "Chemical scrubbing of carbon dioxide and electrolysis of water to replenish oxygen within pressurized living quarters.",
    example: "The Sabatier reactor and Bosch process handle atmospheric revitalization inside the colony.",
    status: "approved",
  },
  {
    english_term: "Micrometeoroid Protection",
    isizulu_wording: "Ukuvikeleka Ematsheni Asemkhathini",
    afrikaans_wording: "Mikrometeoroïedbeskerming",
    definition: "Multi-layered Whipple shields designed to vaporize high-velocity orbital debris before breaching the pressure vessel.",
    example: "Whipple bumpers provide micrometeoroid protection across the habitat's leading edges.",
    status: "approved",
  },
  {
    english_term: "In-Situ Resource Utilization (ISRU)",
    isizulu_wording: "Ukusetshenziswa Kwemithombo Yasendaweni",
    afrikaans_wording: "In-situ Hulpbronbenutting",
    definition: "The practice of harvesting and processing extraterrestrial materials into propellants, breathable oxygen, and construction blocks.",
    example: "ISRU plants at the lunar south pole extract volatile water ice from permanently shadowed craters.",
    status: "approved",
  },
];

export default async (req: Request) => {
  const url = new URL(req.url);
  const query = (url.searchParams.get("q") || "").trim();

  if (!query) {
    return Response.json(
      { results: [], message: "Search query parameter 'q' is required." },
      { status: 400 }
    );
  }

  const normalizedQuery = query.toLowerCase();
  let dbResults: any[] = [];

  try {
    const searchPattern = `%${query}%`;
    const rows = await db
      .select()
      .from(glossaryTerms)
      .where(
        or(
          ilike(glossaryTerms.englishTerm, searchPattern),
          ilike(glossaryTerms.isizuluWording, searchPattern),
          ilike(glossaryTerms.afrikaansWording, searchPattern)
        )
      );

    dbResults = rows.map((r) => ({
      english_term: r.englishTerm,
      isizulu_wording: r.isizuluWording,
      afrikaans_wording: r.afrikaansWording,
      definition: r.definition,
      example: r.example,
      status: r.status,
    }));
  } catch (dbErr) {
    // Database connection or table provisioning can still be completing
  }

  const curatedMatches = CURATED_TERMS.filter(
    (t) =>
      t.english_term.toLowerCase().includes(normalizedQuery) ||
      t.isizulu_wording.toLowerCase().includes(normalizedQuery) ||
      t.afrikaans_wording.toLowerCase().includes(normalizedQuery)
  );

  // Combine results with deduplication by english_term
  const combined = [...dbResults];
  const seen = new Set(combined.map((c) => c.english_term.toLowerCase()));
  for (const term of curatedMatches) {
    if (!seen.has(term.english_term.toLowerCase())) {
      combined.push(term);
      seen.add(term.english_term.toLowerCase());
    }
  }

  return Response.json({
    query,
    results: combined,
  });
};

export const config: Config = {
  path: "/api/glossary/search",
};
