// Sample problems the user can load into the Problem box to try the extension.
// Problem texts are kept in English (they are math-competition statements and the
// prompt works best in English). Each sample is attributed to its source.
//
// Olympiad samples describe the GIVEN configuration to DRAW (not the "prove" goal).
// Verified drawable on real GeoGebra by the eval harness (see eval/). Note that some
// harder configurations rely on a chosen intersection branch and may not be correct
// for every triangle — see the in-app note.

export type Sample = {
  id: string;
  group: string; // shown as an <optgroup> label (the competition / source)
  label: string; // shown as the <option> label
  problem: string;
};

export const SAMPLES: Sample[] = [
  // ── Basic examples ──────────────────────────────────────────────────────────
  {
    id: 'basic-median',
    group: 'Basic examples',
    label: 'Triangle + median',
    problem: 'Draw triangle ABC. Mark the midpoint M of side BC and draw the median AM.',
  },
  {
    id: 'basic-circumcircle',
    group: 'Basic examples',
    label: 'Circumscribed circle',
    problem: 'Draw triangle ABC, its circumscribed circle, and mark the center O of that circle.',
  },
  {
    id: 'basic-incircle',
    group: 'Basic examples',
    label: 'Inscribed circle',
    problem: 'Draw triangle ABC, its inscribed circle, and mark the incenter I.',
  },

  // ── IMO (International Mathematical Olympiad) ────────────────────────────────
  {
    id: 'imo-2015-p3',
    group: 'IMO — International Mathematical Olympiad',
    label: 'IMO 2015 Problem 3',
    problem:
      'Let ABC be an acute triangle with AB > AC, and let Gamma be its circumcircle. Let H, M, and F be the orthocenter of the triangle, the midpoint of BC, and the foot of the altitude from A, respectively. Let Q and K be the two points on Gamma that satisfy angle AQH = 90 degrees and angle QKH = 90 degrees. Draw the figure (triangle, circumcircle, and points H, M, F, Q, K).',
  },
  {
    id: 'imo-2017-p4',
    group: 'IMO — International Mathematical Olympiad',
    label: 'IMO 2017 Problem 4',
    problem:
      'Let R and S be different points on a circle Omega such that RS is not a diameter. Let l be the tangent line to Omega at R. Point T is such that S is the midpoint of RT. Point J is chosen on the minor arc RS of Omega so that the circumcircle Gamma of triangle JST intersects l at two distinct points. Let A be the common point of Gamma and l that is closer to R. Line AJ meets Omega again at K. Draw the figure (both circles and points R, S, T, J, A, K).',
  },
  {
    id: 'imo-2018-p1',
    group: 'IMO — International Mathematical Olympiad',
    label: 'IMO 2018 Problem 1',
    problem:
      'Let Gamma be the circumcircle of acute triangle ABC. Points D and E are on segments AB and AC respectively such that AD = AE. The perpendicular bisectors of BD and CE intersect minor arcs AB and AC of Gamma at points F and G respectively. Draw the figure (triangle, circumcircle, and points D, E, F, G).',
  },
  {
    id: 'imo-2023-p2',
    group: 'IMO — International Mathematical Olympiad',
    label: 'IMO 2023 Problem 2',
    problem:
      'Let ABC be an acute-angled triangle with AB < AC. Denote its circumcircle by Omega and denote the midpoint of arc CAB by S. Let the perpendicular from A to BC meet BS and Omega at D and E (E not equal A) respectively. Let the line through D parallel to BC meet line BE at L and denote the circumcircle of triangle BDL by omega. Let omega meet Omega again at P (P not equal B). Draw the figure (both circles and points S, D, E, L, P).',
  },
  {
    id: 'imo-2024-p4',
    group: 'IMO — International Mathematical Olympiad',
    label: 'IMO 2024 Problem 4',
    problem:
      'Let ABC be a triangle with AB < AC < BC. Let the incentre and incircle of triangle ABC be I and omega respectively. Let X be the point on line BC different from C such that the line through X parallel to AC is tangent to omega. Similarly, let Y be the point on line BC different from B such that the line through Y parallel to AB is tangent to omega. Let AI meet the circumcircle of triangle ABC again at P (P not equal A). Let K and L be the midpoints of AC and AB respectively. Draw the figure (incircle, circumcircle, and points I, X, Y, P, K, L).',
  },

  // ── IGO (Iranian Geometry Olympiad) ─────────────────────────────────────────
  {
    id: 'igo-2023-int-p3',
    group: 'IGO — Iranian Geometry Olympiad',
    label: 'IGO 2023 Intermediate P3',
    problem:
      'Let Omega be the circumcircle of triangle ABC with angle B = 3 * angle C. The internal angle bisector of A intersects Omega and BC at M and D respectively. Point E lies on the extension of line MC from M such that ME equals the radius of Omega. Draw the figure (circumcircle, points M, D, E, and the circumcircles of triangles ACE and BDM).',
  },
  {
    id: 'igo-2023-int-p4',
    group: 'IGO — Iranian Geometry Olympiad',
    label: 'IGO 2023 Intermediate P4',
    problem:
      'Let ABC be a triangle and P be the midpoint of arc BAC of the circumcircle of triangle ABC, with orthocenter H. Let Q, S be points such that HAPQ and SACQ are parallelograms. Let T be the midpoint of AQ, and R be the intersection point of the lines SQ and PB. Draw the figure (points P, H, Q, S, T, R).',
  },
  {
    id: 'igo-2024-int-p3',
    group: 'IGO — Iranian Geometry Olympiad',
    label: 'IGO 2024 Intermediate P3',
    problem:
      'Let ABC be an acute triangle with a point D on side BC. Let J be a point on side AC such that angle BAD = 2 * angle ADJ, and omega be the circumcircle of triangle CDJ. The line AD intersects omega again at a point P, and Q is the foot of the altitude from J to AB. Draw the figure (point J, circle omega, points P and Q).',
  },
  {
    id: 'igo-2025-int-p2',
    group: 'IGO — Iranian Geometry Olympiad',
    label: 'IGO 2025 Intermediate P2',
    problem:
      'A square ABCD is given. Point E is the midpoint of side BC and F lies on the side AB such that DE is perpendicular to EF. Point G lies inside the square such that GF = EF and GF is perpendicular to EF. Lines AC and DE intersect at point X. Draw the figure (points E, F, G, X).',
  },
  {
    id: 'igo-2025-int-p3',
    group: 'IGO — Iranian Geometry Olympiad',
    label: 'IGO 2025 Intermediate P3',
    problem:
      'Triangle ABC and its circumcircle Omega are given. Point T is the midpoint of arc BC of Omega (the arc that does not include A). Line BT intersects the external angle bisector of angle BAC at point P. H is the foot of the perpendicular from A onto the line tangent to Omega at T, and M is the midpoint of segment AP. Draw the figure (point T, point P, point H, point M).',
  },
  {
    id: 'igo-2025-elem-p5',
    group: 'IGO — Iranian Geometry Olympiad',
    label: 'IGO 2025 Elementary P5',
    problem:
      'In triangle ABC with angle CAB = 15 degrees and angle CBA = 30 degrees, points X and Y lie inside the angle BCA such that angle BCX = angle ACY = 45 degrees and BC = CY, AC = CX. Let the line XY meet AB at point Z. Draw the figure (points X, Y, Z).',
  },
];

// Grouped, preserving first-seen group order — convenient for rendering <optgroup>s.
export function samplesByGroup(): { group: string; items: Sample[] }[] {
  const order: string[] = [];
  const map = new Map<string, Sample[]>();
  for (const s of SAMPLES) {
    if (!map.has(s.group)) {
      map.set(s.group, []);
      order.push(s.group);
    }
    map.get(s.group)!.push(s);
  }
  return order.map((group) => ({ group, items: map.get(group)! }));
}
