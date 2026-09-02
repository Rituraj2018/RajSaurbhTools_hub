# A4 Photo Group Positioning — Passport Photo Studio

## Summary

The current `generatePrintSheetCanvas` always centers the photo group on the A4 page by computing `startX`/`startY` as the centered offset. We need to allow the user to shift that starting offset (i.e., add a `positionOffset: {x, y}`) so the whole group renders at a user-chosen location — and then apply that same offset to the downloaded/exported canvas so it matches the preview exactly.

## Architecture Analysis

| Component | Role |
|---|---|
| `passportProcessor.ts` | Core canvas engine — `generatePrintSheetCanvas` computes `startX`/`startY` from centering math |
| `PassportPhotoStudioPage.tsx` | Top-level state holder; orchestrates re-processing |
| `PrintLayout.tsx` | Left-panel controls for paper size, copies, guides, border |
| `PassportPreview.tsx` | Right-panel live preview + download buttons |
| `SheetOptions` interface | Data contract for all print options |

## Proposed Changes

---

### 1. `passportProcessor.ts` — Add `photoPosition` to `SheetOptions`

#### [MODIFY] [`passportProcessor.ts`](file:///c:/RajTools/frontend/src/utils/passportProcessor.ts)

- Add optional `photoPosition?: { x: number; y: number }` field to `SheetOptions`.
- In `generatePrintSheetCanvas`, add the `photoPosition` offset to the computed `startX`/`startY` (already centered default = `{x:0, y:0}`).
- Clamp so the group never exceeds the sheet boundaries (handled by the parent, but double-clamped here too).

---

### 2. `PassportPhotoStudioPage.tsx` — Add `photoPosition` state, pass to pipeline

#### [MODIFY] [`PassportPhotoStudioPage.tsx`](file:///c:/RajTools/frontend/src/pages/PassportPhotoStudioPage.tsx)

- Add `const [photoPosition, setPhotoPosition] = useState<{x:number; y:number}>({x:0, y:0})`.
- Include `photoPosition` in the `sheetOptions` that go to `generatePrintSheetCanvas` (passed as part of `SheetOptions`).
- Reset `photoPosition` to `{x:0, y:0}` only when paper size or copy count changes (optional, not required).
- Pass `photoPosition`, `setPhotoPosition`, `sheetOptions` down to `PrintLayout`.

---

### 3. `PrintLayout.tsx` — Add "Photo Position" UI section

#### [MODIFY] [`PrintLayout.tsx`](file:///c:/RajTools/frontend/src/components/passport/PrintLayout.tsx)

New props:
```ts
photoPosition: { x: number; y: number };
onPhotoPositionChange: (pos: { x: number; y: number }) => void;
sheetOptions: SheetOptions;
```

UI to add below existing controls:

```
── PHOTO POSITION ──────────────────────────────
              [ ▲ UP ]
[ ◀ LEFT ] [ ⊙ CENTER ] [ ▶ RIGHT ]
              [ ▼ DOWN ]

[ ↺ Reset Position ]
```

**Boundary clamping logic (in `PrintLayout.tsx`):**
- Import `calculatePrintGrid` from `passportProcessor`.
- On each directional click, compute the new `x`/`y` and clamp:
  ```
  minX = -(startX)   maxX = +(startX)
  minY = -(startY)   maxY = +(startY)
  ```
  where `startX`/`startY` come from `calculatePrintGrid`.
- Step size: `50px` per button click (~4mm at 300 DPI).

**Drag-and-drop** is handled in the preview panel (see below), not here.

---

### 4. `PassportPreview.tsx` — Add drag-and-drop to the sheet preview

#### [MODIFY] [`PassportPreview.tsx`](file:///c:/RajTools/frontend/src/components/passport/PassportPreview.tsx)

New props:
```ts
photoPosition: { x: number; y: number };
onPhotoPositionChange: (pos: { x: number; y: number }) => void;
sheetOptions: SheetOptions;
```

**Drag logic (using React Pointer Events):**
- Wrap the sheet `<img>` in a draggable `<div>` with `onPointerDown`, `onPointerMove`, `onPointerUp`.
- On drag start: capture pointer + record `startPointerX`, `startPointerY`, `startPosX`, `startPosY`.
- On drag move: compute `delta = (currentPointer - startPointer) / scaleRatio`.
- `scaleRatio` = displayed image width / canvas width (accounts for CSS scaling).
- Clamp delta using grid boundary math (identical to `PrintLayout` logic).
- Call `onPhotoPositionChange` with the new clamped position.
- Release pointer on `pointerUp`/`pointerCancel`.

---

## Data Flow

```
photoPosition state (PassportPhotoStudioPage)
        │
        ├──► sheetOptions.photoPosition ──► generatePrintSheetCanvas (canvas engine)
        │         ↑ produces printSheetCanvas
        │
        ├──► PrintLayout (directional buttons + reset)
        │         └── onPhotoPositionChange → setPhotoPosition
        │
        └──► PassportPreview (drag-and-drop on preview image)
                  └── onPhotoPositionChange → setPhotoPosition
```

## Files Modified

| File | Change |
|---|---|
| `src/utils/passportProcessor.ts` | Add `photoPosition` to `SheetOptions`; apply offset in `generatePrintSheetCanvas` |
| `src/pages/PassportPhotoStudioPage.tsx` | Add `photoPosition` state; pass to `PrintLayout` and `PassportPreview` |
| `src/components/passport/PrintLayout.tsx` | Add "Photo Position" section with 5 directional buttons + Reset |
| `src/components/passport/PassportPreview.tsx` | Add drag-and-drop pointer events on the sheet preview |

**No other files are modified.**

## Verification Plan

1. Upload photo → Select A4 → 4 copies → photos appear centered ✓
2. Drag photo group → all 4 move together ✓
3. Directional buttons: L / R / U / D ✓
4. Center button re-centers ✓
5. Reset Position returns to `{x:0, y:0}` ✓
6. Drag outside A4 → clamped ✓
7. Cutting guides move with group ✓
8. Outline border moves with group ✓
9. Download/export matches preview exactly ✓
10. Changing copy count → layout still movable ✓
