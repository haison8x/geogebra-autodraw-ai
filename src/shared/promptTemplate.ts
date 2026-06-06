// Prompt generation — spec §6.3. {{PROBLEM}} + {{COMMANDS_CATALOG}}.

export const PROMPT_TEMPLATE = `You are a GeoGebra expert. Draw the figure for the following plane-geometry
problem using a list of GeoGebra commands (one command per line, NO explanations,
NO numbering, NO markdown).

PROBLEM:
<problem>
{{PROBLEM}}
</problem>

CONSTRAINTS:
- Use the geometry commands from the allowed catalog below. In addition you MAY use:
  ShowLabel( <Object>, <true|false> ) and SetVisibleInView( <Object>, 1, <true|false> ) for visibility;
  Reflect( <Object>, <Mirror> ) for reflection (Mirror = point, line, or segment).
- Command names MUST be in English (English command names), e.g. Polygon, Segment, Midpoint.
- Use ONLY commands from the ALLOWED COMMAND CATALOG. Do NOT invent commands not in the catalog.
  Common illegal commands that do NOT exist: ParallelLine, Circumcenter, PerpendicularSegment, MidSegment.
  Correct alternatives: parallel line through P to line l → Line(P, l);
  circumcenter of circle c → Midpoint(c); perpendicular through P to line l → PerpendicularLine(P, l).
- Define a free point with direct coordinate syntax: A = (-1, 6). Do NOT wrap in Point(): never A = Point((-1, 6)) and never A = Point({-1, 6}).
- Each line is one valid command runnable in the GeoGebra input bar.
- Name every object (A, B, C, a, h, H...) so it can be referenced afterwards.
- Return ONLY the command list, with no other text.
- ONLY draw the figure described by the problem. Do NOT solve the problem, do NOT reason about a solution
  strategy, and do NOT add any extra construction (auxiliary lines, points, etc.) that the problem did not
  ask to draw. Draw exactly what is stated — nothing more.

LITERAL CONSTRUCTION RULES (very important):
- Construct every object by the EXACT definition the problem gives, using GeoGebra's free/dependent-object
  tools — NOT by a theorem or property you could prove about it. Even if you know the object coincides with
  another point, you MUST build it the way the problem describes. The figure must stay correct if the
  triangle is dragged.
- "L đối xứng H qua BC" (L is the reflection of H over line BC) → L = Reflect(H, Line(B, C)).
  Do NOT compute L as the second intersection of line AH with the circumcircle, even though L provably
  lands there — that is a solution step, not the stated construction.
- "M là trung điểm BC" → M = Midpoint(B, C). "AD đường cao" → D = foot via PerpendicularLine(A, Line(B,C))
  then Intersect. "P = tia MH cắt (ABC)" → build ray/line MH, then Intersect with the circle.
- Rule of thumb: translate each phrase in the problem directly into the matching GeoGebra construction
  command. Never substitute an equivalent location derived by reasoning.

GENERAL POSITION RULES (very important):
- Draw the figure in GENERAL position. Do NOT add any property the problem did not state.
- A plain "triangle ABC" MUST be scalene: all three sides different, no right angle, no symmetry.
  Only make it isosceles / equilateral / right-angled if the problem explicitly says so.
- DEFAULT for a plain "triangle ABC" (no special property given): use A(-1, 6), B(-3, 0), C(7, 0).
- For any other plain polygon, pick irregular integer coordinates that look generic (no equal sides,
  no symmetry), within about -10..10 so the figure fits the view.

CLEAN FIGURE RULES (very important):
- VISIBILITY RULE: Every object EXPLICITLY MENTIONED in the problem (points, segments, lines, rays,
  altitudes, medians, circles, angles, etc.) MUST remain visible — do NOT call SetVisibleInView on it.
  Every object NOT mentioned in the problem (helper lines/circles/points used only to locate another
  object) MUST be hidden immediately after use: add SetVisibleInView( <name>, 1, false ) on the very
  next line after it is created.
- Draw sides/edges with Segment, NOT with the infinite Line — unless the problem explicitly asks for a line or ray.
- Hide the labels of every segment and line: add ShowLabel( <name>, false ). Keep labels ONLY on points.
- The final visible figure shows EXACTLY the objects the problem named — nothing more, nothing less.

CIRCLE RULES (very important):
- CENTER VISIBILITY: whenever you draw a circle, its center point MUST be visible. Never hide the center
  of any circle. Create the center as a named point and do NOT call SetVisibleInView on it.
- For a circumscribed circle (đường tròn ngoại tiếp) or an inscribed circle (đường tròn nội tiếp), ALWAYS draw the
  WHOLE circle, never just an arc. Do NOT use Arc / CircularArc / Sector for these.
- Circumscribed circle of triangle ABC: c = Circle(A, B, C). To get the circumcenter: O = Midpoint(c)
  (Midpoint(<Conic>) returns the center — do NOT use Circumcenter(), it is not a valid GeoGebra command).
- For a cyclic polygon ABCD…: draw c = Circle(A, B, C) then O = Midpoint(c).
- Inscribed circle of triangle ABC: I = Incenter(A, B, C) for the center, then draw the full circle with
  c = Circle(I, Distance(I, Line(B, C))) — radius = distance from incenter to a side. Hide any helper line used.
- When a ray starts from a point INSIDE the circle (e.g. a point on a chord such as a foot of altitude,
  midpoint of a side, centroid), the ray hits the circle at exactly ONE point in the forward direction.
  In that case: use Ray( <start>, <direction> ) and call Intersect( <circle>, <ray> ) with NO index.
  Example — "ray MH hits (ABC) at P" (M = midpoint of BC, inside circle): P = Intersect(omega, Ray(M, H)).
  Example — "ray DG hits (ABC) at Q" (D = foot of altitude on BC, inside circle): Q = Intersect(omega, Ray(D, G)).
- Do NOT convert the ray to a Line and use an initial point or a numeric index — both are unreliable because
  the "closer" intersection on the full line can be on the WRONG side of the start point.
- When a line passes through a known point A that is ALREADY ON the circle, all of these are WRONG:
    Intersect(circle, line)       — returns 2 points, ambiguous index
    Intersect(circle, line, A)    — returns A itself (closest = distance 0), not the other point
    Intersect(circle, ray_from_A) — still returns 2 points (A + D)
  Correct approach: ClosestPoint gives the midpoint of the chord; Reflect A across it gives D.
    O = Midpoint(omega)           # center (already computed earlier)
    M = ClosestPoint(lAD, O)      # foot of perp from O to chord = midpoint of chord
    SetVisibleInView(M, 1, false)
    D = Reflect(A, M)             # reflect A across midpoint → other endpoint D
  Example — "line through A (on circle) parallel to BC, intersects circle again at D":
    lBC = Line(B, C)
    SetVisibleInView(lBC, 1, false)
    lAD = Line(A, lBC)
    SetVisibleInView(lAD, 1, false)
    M_AD = ClosestPoint(lAD, O)
    SetVisibleInView(M_AD, 1, false)
    D = Reflect(A, M_AD)

EXAMPLE — "draw triangle ABC and the altitude from A" (plain triangle → use the default coordinates):
A = (-1, 6)
B = (-3, 0)
C = (7, 0)
a = Segment(B, C)
b = Segment(A, C)
c = Segment(A, B)
ShowLabel(a, false)
ShowLabel(b, false)
ShowLabel(c, false)
lBC = Line(B, C)
SetVisibleInView(lBC, 1, false)
h = PerpendicularLine(A, lBC)
SetVisibleInView(h, 1, false)
H = Intersect(lBC, h)
AH = Segment(A, H)
ShowLabel(AH, false)

ALLOWED COMMAND CATALOG:
{{COMMANDS_CATALOG}}`;

export function buildPrompt(problem: string, commandsCatalog: string): string {
  return PROMPT_TEMPLATE.replace('{{PROBLEM}}', problem.trim()).replace(
    '{{COMMANDS_CATALOG}}',
    commandsCatalog,
  );
}

// ── Advanced mode: Prompt 1 — ask AI for a natural-language construction plan ──

export const PROMPT_TEMPLATE_1 = `You are a plane-geometry construction expert. Given the problem below,
produce a step-by-step CONSTRUCTION PLAN that describes exactly which geometric objects to build
and in which order. Do NOT write any GeoGebra commands — describe each step in plain language.

PROBLEM:
<problem>
{{PROBLEM}}
</problem>

OUTPUT FORMAT (one step per line, no numbering, no markdown):
- For each free point: state its name and suggested coordinates.
- For each dependent object: state its type, its name, and how it is defined
  (e.g. "segment AB connecting A and B", "foot H = perpendicular from A to line BC").
- VISIBILITY: mark each object with exactly one of:
    "(visible)"       — the object is EXPLICITLY MENTIONED in the problem; it must appear in the final figure.
    "(hide after use)" — the object is a helper used only to locate another object; it must be hidden once used.
  Every object must carry one of these two markers. No object may be left unmarked.
  CIRCLE CENTER RULE: the center of every circle is ALWAYS "(visible)", even if not named in the problem.
- Mark segments or lines whose label should be hidden with "(hide label)" — add this alongside the visibility marker.
- Return ONLY the construction plan — no proofs, no GeoGebra syntax, no solution steps.

GENERAL POSITION RULES (very important):
- Draw in GENERAL position. Do NOT add any property the problem did not state.
- A plain "triangle ABC" MUST be scalene (all sides different, no right angle, no symmetry).
  Default coordinates: A(-1, 6), B(-3, 0), C(7, 0).
- Other plain polygons: irregular integer coordinates within roughly -10..10.
- Draw ONLY objects the problem explicitly asks for — do NOT add anything extra.`;

export function buildPrompt1(problem: string): string {
  return PROMPT_TEMPLATE_1.replace('{{PROBLEM}}', problem.trim());
}

// ── Advanced mode: Prompt 2 — translate construction plan → GeoGebra commands ──

export const PROMPT_TEMPLATE_2 = `You are a GeoGebra expert. Translate the construction plan below into
a list of GeoGebra commands (one command per line, NO explanations, NO numbering, NO markdown).

CONSTRUCTION PLAN:
<plan>
{{INTERPRETATION}}
</plan>

CONSTRAINTS:
- Use the geometry commands from the allowed catalog below. In addition you MAY use:
  ShowLabel( <Object>, <true|false> ) and SetVisibleInView( <Object>, 1, <true|false> ) for visibility;
  Reflect( <Object>, <Mirror> ) for reflection (Mirror = point, line, or segment).
- Command names MUST be in English (English command names), e.g. Polygon, Segment, Midpoint.
- Use ONLY commands from the ALLOWED COMMAND CATALOG. Do NOT invent commands not in the catalog.
  Common illegal commands that do NOT exist: ParallelLine, Circumcenter, PerpendicularSegment, MidSegment.
  Correct alternatives: parallel line through P to line l → Line(P, l);
  circumcenter of circle c → Midpoint(c); perpendicular through P to line l → PerpendicularLine(P, l).
- Define a free point with direct coordinate syntax: A = (-1, 6). Do NOT wrap in Point(): never A = Point((-1, 6)) and never A = Point({-1, 6}).
- Each line is one valid command runnable in the GeoGebra input bar.
- Name every object (A, B, C, a, h, H...) so it can be referenced afterwards.
- Return ONLY the command list, with no other text.
- ONLY draw the figure described by the construction plan. Do NOT solve the problem, do NOT reason
  about a solution strategy, and do NOT add any extra construction the plan did not specify.

LITERAL CONSTRUCTION RULES (very important):
- Construct every object by the EXACT definition the plan gives, using GeoGebra's free/dependent-object
  tools — NOT by a theorem or property you could prove about it. Even if you know the object coincides with
  another point, you MUST build it the way the plan describes. The figure must stay correct if dragged.
- "L đối xứng H qua BC" (L is the reflection of H over line BC) → L = Reflect(H, Line(B, C)).
  Do NOT compute L as the second intersection of line AH with the circumcircle, even though L provably
  lands there — that is a solution step, not the stated construction.
- "M là trung điểm BC" → M = Midpoint(B, C). "AD đường cao" → D = foot via PerpendicularLine(A, Line(B,C))
  then Intersect. "P = tia MH cắt (ABC)" → build ray/line MH, then Intersect with the circle.
- Rule of thumb: translate each phrase in the plan directly into the matching GeoGebra construction
  command. Never substitute an equivalent location derived by reasoning.

GENERAL POSITION RULES (very important):
- Draw the figure in GENERAL position. Do NOT add any property the plan did not state.
- A plain "triangle ABC" MUST be scalene: all three sides different, no right angle, no symmetry.
  Only make it isosceles / equilateral / right-angled if the plan explicitly says so.
- DEFAULT for a plain "triangle ABC" (no special property given): use A(-1, 6), B(-3, 0), C(7, 0).
- For any other plain polygon, pick irregular integer coordinates that look generic (no equal sides,
  no symmetry), within about -10..10 so the figure fits the view.

CLEAN FIGURE RULES (very important):
- VISIBILITY RULE: Every object marked "(visible)" in the construction plan MUST remain visible — do NOT
  call SetVisibleInView on it. Every object marked "(hide after use)" MUST be hidden immediately after use:
  add SetVisibleInView( <name>, 1, false ) on the very next line after it is created.
  If the plan has no visibility markers, apply the same logic from the original problem: objects explicitly
  mentioned → visible; helper/intermediate objects → hidden.
- Draw sides/edges with Segment, NOT with the infinite Line — unless the plan explicitly asks for a line or ray.
- Hide the labels of every segment and line: add ShowLabel( <name>, false ). Keep labels ONLY on points.
- The final visible figure shows EXACTLY the objects the problem named — nothing more, nothing less.

CIRCLE RULES (very important):
- CENTER VISIBILITY: whenever you draw a circle, its center point MUST be visible. Never hide the center
  of any circle. Create the center as a named point and do NOT call SetVisibleInView on it.
- For a circumscribed circle (đường tròn ngoại tiếp) or an inscribed circle (đường tròn nội tiếp), ALWAYS draw the
  WHOLE circle, never just an arc. Do NOT use Arc / CircularArc / Sector for these.
- Circumscribed circle of triangle ABC: c = Circle(A, B, C). To get the circumcenter: O = Midpoint(c)
  (Midpoint(<Conic>) returns the center — do NOT use Circumcenter(), it is not a valid GeoGebra command).
- For a cyclic polygon ABCD…: draw c = Circle(A, B, C) then O = Midpoint(c).
- Inscribed circle of triangle ABC: I = Incenter(A, B, C) for the center, then draw the full circle with
  c = Circle(I, Distance(I, Line(B, C))) — radius = distance from incenter to a side. Hide any helper line used.
- When a ray starts from a point INSIDE the circle (e.g. a point on a chord such as a foot of altitude,
  midpoint of a side, centroid), the ray hits the circle at exactly ONE point in the forward direction.
  In that case: use Ray( <start>, <direction> ) and call Intersect( <circle>, <ray> ) with NO index.
  Example — "ray MH hits (ABC) at P" (M = midpoint of BC, inside circle): P = Intersect(omega, Ray(M, H)).
- Do NOT convert the ray to a Line and use an initial point or a numeric index — both are unreliable.
- When a line passes through a known point A that is ALREADY ON the circle, use ClosestPoint + Reflect:
    M = ClosestPoint(lAD, O)           # foot of perp from center O to chord = midpoint of chord
    SetVisibleInView(M, 1, false)
    D = Reflect(A, M)                  # reflect A across midpoint → other endpoint D

ALLOWED COMMAND CATALOG:
{{COMMANDS_CATALOG}}`;

export function buildPrompt2(interpretation: string, commandsCatalog: string): string {
  return PROMPT_TEMPLATE_2.replace('{{INTERPRETATION}}', interpretation.trim()).replace(
    '{{COMMANDS_CATALOG}}',
    commandsCatalog,
  );
}
