// Prompt generation — spec §6.3. {{PROBLEM}} + {{COMMANDS_CATALOG}}.

export const PROMPT_TEMPLATE = `You are a GeoGebra expert. Draw the figure for the following plane-geometry
problem using a list of GeoGebra commands (one command per line, NO explanations,
NO numbering, NO markdown).

PROBLEM:
{{PROBLEM}}

CONSTRAINTS:
- Use the geometry commands from the allowed catalog below. In addition you MAY use these
  visibility commands to keep the figure clean: ShowLabel( <Object>, <true|false> ) and
  SetVisibleInView( <Object>, 1, <true|false> ).
- Command names MUST be in English (English command names), e.g. Polygon, Segment, Midpoint.
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
- Draw sides/edges with Segment, NOT with the infinite Line — unless the problem explicitly asks for a line or ray.
- Any helper object used only to locate a point (infinite lines, perpendiculars, parallels, bisectors,
  helper circles for intersection) MUST be hidden right after use: add SetVisibleInView( <name>, 1, false ).
- Hide the labels of every segment and line: add ShowLabel( <name>, false ). Keep labels ONLY on points.
- The final visible figure must show only the required points and segments — no construction clutter, no stray labels.

CIRCLE RULES (very important):
- For a circumscribed circle (đường tròn ngoại tiếp) or an inscribed circle (đường tròn nội tiếp), ALWAYS draw the
  WHOLE circle, never just an arc. Do NOT use Arc / CircularArc / Sector for these.
- Circumscribed circle of triangle ABC: c = Circle(A, B, C). Or get its center O = Circumcenter(A, B, C) then c = Circle(O, A).
- Inscribed circle of triangle ABC: I = Incenter(A, B, C) for the center, then draw the full circle with
  c = Circle(I, Distance(I, Line(B, C))) — radius = distance from incenter to a side. Hide any helper line used.
- When a ray starts from a point INSIDE the circle (e.g. a point on a chord such as a foot of altitude,
  midpoint of a side, centroid), the ray hits the circle at exactly ONE point in the forward direction.
  In that case: use Ray( <start>, <direction> ) and call Intersect( <circle>, <ray> ) with NO index.
  Example — "ray MH hits (ABC) at P" (M = midpoint of BC, inside circle): P = Intersect(omega, Ray(M, H)).
  Example — "ray DG hits (ABC) at Q" (D = foot of altitude on BC, inside circle): Q = Intersect(omega, Ray(D, G)).
- Do NOT convert the ray to a Line and use an initial point or a numeric index — both are unreliable because
  the "closer" intersection on the full line can be on the WRONG side of the start point.

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
