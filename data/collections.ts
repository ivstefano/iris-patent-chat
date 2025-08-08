export type CollectionDocument = {
  filename: string
  title: string
  description: string
}

export type Collection = {
  id: string
  name: string
  description: string
  coverImage?: string
  documents: CollectionDocument[]
}

export const collections: Collection[] = [
  {
    id: "metal-patents",
    name: "Metal Patents",
    description:
      "A curated set of metal-related patent PDFs covering high-strength steel sheets, non-oriented electrical steel, magnetic properties, and manufacturing methods.",
    coverImage: "/abstract-metal-gradient.png",
    documents: [
      {
        filename: "EP2537954_A1.pdf",
        title:
          "High-Strength Hot-Dipped Galvanized Steel Sheet with Excellent Formability and Spot Weldability",
        description:
          "High-strength hot-dipped galvanized steel sheet with optimized composition and plating alloy phases for superior formability, corrosion resistance, and spot weldability. Process includes hot rolling, annealing, and plating to ensure minimal cracks and >590 MPa tensile strength.",
      },
      {
        filename: "EP1816226_A1.pdf",
        title: "Non-Oriented Electrical Steel Sheet with Superior Core Loss Properties",
        description:
          "Low core loss non-oriented electrical steel emphasizing REM oxysulfides and TiN precipitate control. Manufacturing spans casting, hot/cold rolling, and annealing, achieving improved iron loss (W15/50 < 3.0 W/kg) for motor applications.",
      },
      {
        filename: "EP2316980_A1.pdf",
        title:
          "Non-Oriented Electrical Steel Sheet with High Magnetic Permeability and Low Iron Loss",
        description:
          "Enhanced magnetic properties with relative permeability >5000 and low iron loss. Utilizes multilayer Fe-Ni alloy films via sputtering with conventional rolling/annealing to improve high-frequency performance.",
      },
      {
        filename: "EP1577413_A1.pdf",
        title: "Non-Oriented Electrical Steel Sheet with Low Iron Loss and High Strength",
        description:
          "Achieves low iron loss via fine Cr nitride precipitates (<0.1 μm) and controlled composition. Process control through hot rolling, annealing (800–1100°C), cold rolling, and final anneal yields iron loss <5 W/kg at 50 Hz.",
      },
      {
        filename: "EP2679695_A1.pdf",
        title:
          "High-Strength Non-Oriented Electrical Steel Sheet with Excellent Fatigue Strength and Low Iron Loss",
        description:
          "Focus on high tensile strength (>580 MPa), fatigue limit (>300 MPa), and low iron loss (W10/400 < 20 W/kg) using Ti carbides/nitrides and ferrite microstructure. Suitable for hybrid vehicle motors.",
      },
      {
        filename: "EP2439302_A1.pdf",
        title:
          "Non-Oriented Electrical Steel Sheet with Superior Magnetic Properties and Bi Inclusions",
        description:
          "Improves magnetic flux density and reduces iron loss via controlled Bi (0.0005–0.05%) and Ti balance, leveraging metallic Bi inclusions. Process leverages casting, hot/cold rolling, and final anneal (800–1100°C).",
      },
      {
        filename: "EP2602335_A1.pdf",
        title:
          "Manufacturing Method for Non-Oriented Electrical Steel Sheet with High Strength and Anisotropic Magnetic Properties",
        description:
          "Method for high-strength sheets (yield >400 MPa) and direction-dependent magnetic properties: sequential rolling and anneals (700–900°C) to optimize core loss and rotor performance.",
      },
      {
        filename: "EP2390376_A1.pdf",
        title:
          "Non-Oriented Electrical Steel Sheet for High-Speed Rotor Applications with Low Core Loss",
        description:
          "Targets high-speed rotors with high strength (>600 MPa) and low high-frequency core loss (W10/400 ≤ 100 W/kg). Thin sheets (≤0.3 mm), stress relief annealing, and alloy control enable low eddy current loss.",
      },
      {
        filename: "EP2698441_A1.pdf",
        title:
          "High-Strength Non-Oriented Electrical Steel Sheet with Controlled Sulfide Precipitates",
        description:
          "Balances Mn/S (10 ≤ Mn/S ≤ 50) and sulfide density (≥1×10^10 /mm³) to achieve >580 MPa tensile while preserving magnetic performance. Process includes hot rolling ≥1000°C, controlled coiling, and final anneal.",
      },
      {
        filename: "EP2278034_A1.pdf",
        title:
          "High-Strength Non-Oriented Magnetic Steel Sheet with Low Iron Loss After Punching",
        description:
          "Maintains low iron loss after punching/annealing (W10/400 ≤ 40 W/kg) with coarse grains and high-temperature annealing strategy. Demonstrates improved motor efficiency and processability.",
      },
    ],
  },
]
