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
- Each line is one valid command runnable in the GeoGebra input bar.
- Name every object (A, B, C, a, h, H...) so it can be referenced afterwards.
- Return ONLY the command list, with no other text.

CLEAN FIGURE RULES (very important):
- Draw sides/edges with Segment, NOT with the infinite Line — unless the problem explicitly asks for a line or ray.
- Any helper object used only to locate a point (infinite lines, perpendiculars, parallels, bisectors,
  helper circles for intersection) MUST be hidden right after use: add SetVisibleInView( <name>, 1, false ).
- Hide the labels of every segment and line: add ShowLabel( <name>, false ). Keep labels ONLY on points.
- The final visible figure must show only the required points and segments — no construction clutter, no stray labels.

EXAMPLE — "draw triangle ABC and the altitude from A":
A = Point({0, 3})
B = Point({-2, 0})
C = Point({4, 0})
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
