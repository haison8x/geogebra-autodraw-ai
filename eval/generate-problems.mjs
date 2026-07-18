// eval/generate-problems.mjs
// Generate a deterministic benchmark of 100 plane-geometry problems from templates.
//
// Because problems come from templates, we KNOW the ground truth for each one:
//   - expectedPoints : point names the problem explicitly asks to construct.
//     Point names are deterministic (the problem names them A, B, C, M, O…), unlike
//     segment/line names which the AI picks freely — so we grade on points only.
//   - expectedConics : minimum number of circle/conic objects that must exist.
//
// Output: eval/problems.json  ([{ id, category, problem, expectedPoints, expectedConics }])
//
//   node eval/generate-problems.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// ── Template catalog ──────────────────────────────────────────────────────────
// Each template is a factory: given a distinct label-set it returns a problem.
// `pts` = the point names the problem introduces/asks for (ground truth).
// `conics` = number of circles the problem asks to draw.
// Problems are in Vietnamese (the extension's primary use case) — they mirror the
// phrasing GeoGebra teachers actually use.

/** @typedef {{category:string, build:(L:string[])=>{problem:string, pts:string[], conics:number}}} Template */

/** @type {Template[]} */
const TEMPLATES = [
  // ── Triangles: cevians & centers ─────────────────────────────────────────────
  {
    category: 'triangle-median',
    build: ([A, B, C, M]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Gọi ${M} là trung điểm của cạnh ${B}${C}. Vẽ tam giác ${A}${B}${C} và đường trung tuyến ${A}${M}.`,
      pts: [A, B, C, M],
      conics: 0,
    }),
  },
  {
    category: 'triangle-altitude',
    build: ([A, B, C, H]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Vẽ đường cao ${A}${H} hạ từ đỉnh ${A} xuống cạnh ${B}${C} (${H} là chân đường cao).`,
      pts: [A, B, C, H],
      conics: 0,
    }),
  },
  {
    category: 'triangle-bisector',
    build: ([A, B, C, D]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Vẽ đường phân giác trong của góc ${A}, cắt cạnh ${B}${C} tại ${D}.`,
      pts: [A, B, C, D],
      conics: 0,
    }),
  },
  {
    category: 'triangle-centroid',
    build: ([A, B, C, G]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Xác định trọng tâm ${G} của tam giác (giao điểm ba đường trung tuyến).`,
      pts: [A, B, C, G],
      conics: 0,
    }),
  },
  {
    category: 'triangle-orthocenter',
    build: ([A, B, C, H]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Xác định trực tâm ${H} của tam giác (giao điểm ba đường cao).`,
      pts: [A, B, C, H],
      conics: 0,
    }),
  },
  {
    category: 'triangle-circumcircle',
    build: ([A, B, C, O]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Vẽ đường tròn ngoại tiếp tam giác và xác định tâm ${O} của đường tròn đó.`,
      pts: [A, B, C, O],
      conics: 1,
    }),
  },
  {
    category: 'triangle-incircle',
    build: ([A, B, C, I]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Vẽ đường tròn nội tiếp tam giác và xác định tâm ${I} (giao điểm ba đường phân giác trong).`,
      pts: [A, B, C, I],
      conics: 1,
    }),
  },
  {
    category: 'triangle-midsegment',
    build: ([A, B, C, M, N]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Gọi ${M}, ${N} lần lượt là trung điểm của ${A}${B} và ${A}${C}. Vẽ đường trung bình ${M}${N}.`,
      pts: [A, B, C, M, N],
      conics: 0,
    }),
  },
  {
    category: 'triangle-perp-bisector',
    build: ([A, B, C, M]) => ({
      problem: `Cho tam giác ${A}${B}${C}. Gọi ${M} là trung điểm ${B}${C}. Vẽ đường trung trực của đoạn ${B}${C}.`,
      pts: [A, B, C, M],
      conics: 0,
    }),
  },
  {
    category: 'triangle-reflection',
    build: ([A, B, C, H, L]) => ({
      problem: `Cho tam giác ${A}${B}${C}, đường cao ${A}${H} (${H} thuộc ${B}${C}). Gọi ${L} là điểm đối xứng của ${H} qua đường thẳng ${A}${B}.`,
      pts: [A, B, C, H, L],
      conics: 0,
    }),
  },

  // ── Quadrilaterals ───────────────────────────────────────────────────────────
  {
    category: 'quad-square',
    build: ([A, B, C, D]) => ({
      problem: `Vẽ hình vuông ${A}${B}${C}${D}.`,
      pts: [A, B, C, D],
      conics: 0,
    }),
  },
  {
    category: 'quad-rectangle',
    build: ([A, B, C, D]) => ({
      problem: `Vẽ hình chữ nhật ${A}${B}${C}${D} với hai kích thước khác nhau.`,
      pts: [A, B, C, D],
      conics: 0,
    }),
  },
  {
    category: 'quad-parallelogram',
    build: ([A, B, C, D]) => ({
      problem: `Vẽ hình bình hành ${A}${B}${C}${D}.`,
      pts: [A, B, C, D],
      conics: 0,
    }),
  },
  {
    category: 'quad-diagonals',
    build: ([A, B, C, D, O]) => ({
      problem: `Vẽ hình bình hành ${A}${B}${C}${D}. Vẽ hai đường chéo ${A}${C} và ${B}${D}, chúng cắt nhau tại ${O}.`,
      pts: [A, B, C, D, O],
      conics: 0,
    }),
  },
  {
    category: 'quad-trapezoid',
    build: ([A, B, C, D]) => ({
      problem: `Vẽ hình thang ${A}${B}${C}${D} có ${A}${B} song song với ${C}${D}.`,
      pts: [A, B, C, D],
      conics: 0,
    }),
  },
  {
    category: 'quad-midpoints',
    build: ([A, B, C, D, M, N, P, Q]) => ({
      problem: `Cho tứ giác ${A}${B}${C}${D}. Gọi ${M}, ${N}, ${P}, ${Q} lần lượt là trung điểm các cạnh ${A}${B}, ${B}${C}, ${C}${D}, ${D}${A}.`,
      pts: [A, B, C, D, M, N, P, Q],
      conics: 0,
    }),
  },

  // ── Circles ──────────────────────────────────────────────────────────────────
  {
    category: 'circle-center-radius',
    build: ([O, A]) => ({
      problem: `Vẽ đường tròn tâm ${O} bán kính bằng độ dài ${O}${A}, trong đó ${A} là một điểm cho trước.`,
      pts: [O, A],
      conics: 1,
    }),
  },
  {
    category: 'circle-diameter',
    build: ([A, B, O]) => ({
      problem: `Cho đoạn thẳng ${A}${B}. Vẽ đường tròn đường kính ${A}${B} với tâm ${O} là trung điểm ${A}${B}.`,
      pts: [A, B, O],
      conics: 1,
    }),
  },
  {
    category: 'circle-chord',
    build: ([O, A, B]) => ({
      problem: `Cho đường tròn tâm ${O}. Lấy hai điểm ${A}, ${B} trên đường tròn và vẽ dây cung ${A}${B}.`,
      pts: [O, A, B],
      conics: 1,
    }),
  },
  {
    category: 'circle-two-intersect',
    build: ([O, P, A, B]) => ({
      problem: `Vẽ hai đường tròn tâm ${O} và tâm ${P} cắt nhau tại hai điểm ${A} và ${B}.`,
      pts: [O, P, A, B],
      conics: 2,
    }),
  },

  // ── Points, lines, transforms ────────────────────────────────────────────────
  {
    category: 'point-midpoint',
    build: ([A, B, M]) => ({
      problem: `Cho hai điểm ${A} và ${B}. Vẽ đoạn thẳng ${A}${B} và trung điểm ${M} của nó.`,
      pts: [A, B, M],
      conics: 0,
    }),
  },
  {
    category: 'line-parallel',
    build: ([A, B, C]) => ({
      problem: `Cho đoạn thẳng ${A}${B} và một điểm ${C} nằm ngoài ${A}${B}. Vẽ đường thẳng đi qua ${C} và song song với ${A}${B}.`,
      pts: [A, B, C],
      conics: 0,
    }),
  },
  {
    category: 'line-perpendicular',
    build: ([A, B, C, H]) => ({
      problem: `Cho đoạn thẳng ${A}${B} và điểm ${C} ngoài đường thẳng ${A}${B}. Vẽ đường thẳng qua ${C} vuông góc với ${A}${B}, cắt ${A}${B} tại ${H}.`,
      pts: [A, B, C, H],
      conics: 0,
    }),
  },
  {
    category: 'point-reflection-point',
    build: ([A, O, B]) => ({
      problem: `Cho điểm ${A} và điểm ${O}. Vẽ điểm ${B} đối xứng với ${A} qua ${O}.`,
      pts: [A, O, B],
      conics: 0,
    }),
  },
  {
    category: 'point-reflection-line',
    build: ([A, B, C, D]) => ({
      problem: `Cho đoạn thẳng ${A}${B} và điểm ${C}. Vẽ điểm ${D} đối xứng với ${C} qua đường thẳng ${A}${B}.`,
      pts: [A, B, C, D],
      conics: 0,
    }),
  },
  {
    category: 'line-intersection',
    build: ([A, B, C, D, I]) => ({
      problem: `Cho hai đoạn thẳng ${A}${B} và ${C}${D}. Vẽ giao điểm ${I} của hai đường thẳng ${A}${B} và ${C}${D}.`,
      pts: [A, B, C, D, I],
      conics: 0,
    }),
  },
  {
    category: 'triangle-tangent-circumcircle-diameter',
    build: ([A, B, C, O, D]) => ({
      problem: `Cho tam giác ${A}${B}${C} nội tiếp đường tròn tâm ${O}. Vẽ đường kính ${A}${D} của đường tròn ngoại tiếp.`,
      pts: [A, B, C, O, D],
      conics: 1,
    }),
  },
];

// ── Label pools: give each generated problem a distinct, sensible label-set ─────
const TRI = ['A', 'B', 'C'];
const EXTRA = ['D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];

// Deterministic label-set builder: fixed base labels + rotating extras so each
// instance of the same template gets fresh helper-point names.
function labelsFor(needed, salt) {
  // Start from A,B,C,D… but rotate the "extra" pool by salt for variety.
  const base = ['A', 'B', 'C', 'D', 'E', 'F'];
  const out = [];
  const usedExtra = [];
  let extraIdx = salt % EXTRA.length;
  for (let i = 0; i < needed; i++) {
    if (i < 3) {
      out.push(TRI[i]);
    } else {
      // pick next extra label not already used and not a base triangle label
      let label;
      let guard = 0;
      do {
        label = EXTRA[extraIdx % EXTRA.length];
        extraIdx++;
        guard++;
      } while ((out.includes(label) || usedExtra.includes(label)) && guard < 50);
      usedExtra.push(label);
      out.push(label);
    }
  }
  return out;
}

// How many labels each template consumes = max index it destructures. We infer by
// calling with a probe set of unique tokens and counting how many appear used.
function neededLabels(tpl) {
  // Call with 12 unique tokens, see how many the output references.
  const probe = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11'];
  const r = tpl.build(probe);
  // Count how many probe tokens appear either in pts or problem.
  let n = 0;
  for (let i = 0; i < probe.length; i++) {
    if (r.pts.includes(probe[i]) || r.problem.includes(probe[i])) n = i + 1;
  }
  return Math.max(n, r.pts.length);
}

function main() {
  const TARGET = 100;
  const problems = [];
  const perTemplateCount = {};
  let i = 0;
  while (problems.length < TARGET) {
    const tpl = TEMPLATES[i % TEMPLATES.length];
    const round = Math.floor(i / TEMPLATES.length);
    const need = neededLabels(tpl);
    const labels = labelsFor(need, round * 3 + (i % 7));
    const built = tpl.build(labels);
    const seq = (perTemplateCount[tpl.category] = (perTemplateCount[tpl.category] || 0) + 1);
    problems.push({
      id: `${tpl.category}-${String(seq).padStart(2, '0')}`,
      category: tpl.category,
      problem: built.problem,
      expectedPoints: built.pts,
      expectedConics: built.conics,
    });
    i++;
  }

  const OUT = resolve(here, 'problems.json');
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(problems, null, 2), 'utf8');

  const cats = [...new Set(problems.map((p) => p.category))];
  console.log(`Generated ${problems.length} problems across ${cats.length} categories → eval/problems.json`);
  console.log(`Categories: ${cats.join(', ')}`);
}

main();
