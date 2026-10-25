// Hand-written sample questions for the viewer lab only (original wording, anchored to PDF pages of
// Class 11 Biology Ch.6 "Anatomy of Flowering Plants", printed pages 71-78, offset 70). Not production content.
export type SampleQuestion = {
  id: string; pdfPage: number; stem: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3;
  explanation: string; difficulty: "easy" | "medium" | "hard";
};

export const CH6_OFFSET = 70;

export const CH6_QUESTIONS: SampleQuestion[] = [
  { id: "c6-72-a", pdfPage: 2, difficulty: "easy", stem: "In grasses, the guard cells of a stoma are:",
    options: ["Bean-shaped", "Dumb-bell shaped", "Kidney-shaped with no chloroplasts", "Rectangular and thin-walled"], answer: 1,
    explanation: "Grass guard cells are dumb-bell shaped, unlike the bean-shaped guard cells of most other plants." },
  { id: "c6-72-b", pdfPage: 2, difficulty: "medium", stem: "Which wall of a guard cell is highly thickened?",
    options: ["The outer wall, away from the pore", "The wall shared with the subsidiary cell", "The inner wall, towards the stomatal pore", "Both walls equally"], answer: 2,
    explanation: "The inner walls facing the stomatal pore are thick, the outer walls are thin, which helps the pore open and close." },
  { id: "c6-73-a", pdfPage: 3, difficulty: "easy", stem: "Vascular bundles that have cambium between xylem and phloem are called:",
    options: ["Radial", "Closed", "Open", "Scattered"], answer: 2,
    explanation: "Cambium lets the bundle form secondary xylem and phloem, so such bundles are open." },
  { id: "c6-73-b", pdfPage: 3, difficulty: "medium", stem: "A radial arrangement of xylem and phloem, on different radii, is found in:",
    options: ["Dicot stems", "Monocot stems", "Roots", "Leaves"], answer: 2,
    explanation: "In roots xylem and phloem alternate along different radii. Stems and leaves usually have conjoint bundles." },
  { id: "c6-74-a", pdfPage: 4, difficulty: "medium", stem: "Casparian strips on endodermal cells are made of:",
    options: ["Lignin", "Cellulose", "Suberin", "Cutin"], answer: 2,
    explanation: "Water-impermeable, waxy suberin is deposited on the radial and tangential walls of endodermal cells." },
  { id: "c6-76-a", pdfPage: 6, difficulty: "easy", stem: "A ring-like arrangement of vascular bundles is characteristic of:",
    options: ["Monocot stem", "Dicot stem", "Monocot root", "Isobilateral leaf"], answer: 1,
    explanation: "A ring of conjoint, open bundles is a hallmark of the dicot stem; monocot bundles are scattered." },
  { id: "c6-77-a", pdfPage: 7, difficulty: "medium", stem: "When bulliform cells lose water and become flaccid, the grass leaf:",
    options: ["Opens flat", "Curls inwards", "Sheds stomata", "Turns the cuticle thicker"], answer: 1,
    explanation: "Flaccid bulliform cells make the leaf curl inwards, which reduces water loss." },
];
