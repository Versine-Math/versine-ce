---
id: stack-spacing-built-in
namespace: ui
kind: design
modality: must
status: active
provenance:
    type: dialogue
created_at: 2026-11-18T15:46:40.191856494Z
---

Vertical spacing comes from the UI kit, never from each screen: .stack spaces its children 14px apart and .stack--sm 8px, and either class works alone. A bare .stack--sm used to set only a gap, which does nothing outside a flex box, so fields, buttons and text inside it touched in some forty places. In a stack, buttons keep their own width (.btn--block for full width) and follow the stack's alignment, paragraphs drop their own margins, and an empty slot such as an error line with nothing to say yet cancels its gap and reserved height while staying in the page, so a live region still announces what is later written into it. The practice screen's answer line (.feedback with role=status) keeps its height so the screen doesn't jump. Chosen on 2026-11-18 after Versine's owner found fields touching their buttons.
