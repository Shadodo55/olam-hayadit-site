"use client";

import { useTranslations } from "next-intl";
import {
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Variant } from "../product";
import type { SceneKind } from "../scene";
import { skuStore } from "./finish-store";

/**
 * In-place preview: the chosen variant drawn where it's used (kitchen
 * cabinet, door, bathroom wall…). Every scene is drawn in millimetres, so
 * sizes are true to scale against a standard cabinet, door or tile; the metal
 * takes the colour of the chosen finish. Size and colour changes animate.
 * The picture is decorative; the caption states the scale in words.
 */

/** Fallback metal colour when a finish has no swatch (brushed steel). */
const STEEL = "#a7abad";

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0.5;
  const h =
    m[1]!.length === 3
      ? [...m[1]!].map((c) => c + c).join("")
      : (m[1] as string);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

const px = (n: number) => `${n}px`;
const at = (x: number, y: number, extra = "") =>
  ({ transform: `translate(${px(x)}, ${px(y)}) ${extra}` }) as CSSProperties;

interface Metal {
  color: string;
}

/**
 * A bar pull seen from the front: a rounded bar of `length`, with the two
 * screw points `cc` apart. Built from transformed unit shapes so size changes
 * animate smoothly.
 */
function Bar({
  x,
  y,
  length,
  cc,
  thickness = 12,
  vertical = false,
  flanges = false,
  metal,
}: {
  x: number;
  y: number;
  length: number;
  cc: number | null;
  thickness?: number;
  vertical?: boolean;
  flanges?: boolean;
  metal: Metal;
}) {
  const t = thickness;
  const half = (length - t) / 2;
  const fill = { fill: metal.color } as CSSProperties;
  return (
    <g className="scene-move" style={at(x, y, vertical ? "rotate(90deg)" : "")}>
      <g className="scene-install">
        <rect
          x={-500}
          y={-t / 2}
          width={1000}
          height={t}
          className="scene-move scene-metal stroke-ink/25"
          strokeWidth={0}
          style={{ ...fill, transform: `scaleX(${(length - t) / 1000})` }}
        />
        {[-1, 1].map((side) => (
          <circle
            key={side}
            r={flanges ? t * 1.9 : t / 2}
            className="scene-move scene-metal stroke-ink/25"
            strokeWidth={1.5}
            style={{ ...fill, transform: `translateX(${px(side * half)})` }}
          />
        ))}
        <rect
          x={-500}
          y={-t / 2 + t * 0.18}
          width={1000}
          height={t * 0.2}
          className="scene-move fill-paper/45"
          style={{ transform: `scaleX(${Math.max(0, length - t * 2) / 1000})` }}
        />
        {cc !== null &&
          [-1, 1].map((side) => (
            <circle
              key={side}
              r={t * 0.22}
              className="scene-move fill-ink/30"
              style={{ transform: `translateX(${px((side * cc) / 2)})` }}
            />
          ))}
      </g>
    </g>
  );
}

/** A dimension line above a handle, like a technical drawing. */
function Dimension({
  x,
  y,
  length,
  label,
  onDark = false,
}: {
  x: number;
  y: number;
  length: number;
  label: string;
  /** Drawn over a navy front: use the light teal. */
  onDark?: boolean;
}) {
  const ink = onDark ? "fill-accent-on-band" : "fill-accent-ink";
  return (
    <g className="scene-move scene-dimension" style={at(x, y)}>
      <rect
        x={-500}
        y={-0.75}
        width={1000}
        height={1.5}
        className={`scene-move ${ink}`}
        style={{ transform: `scaleX(${length / 1000})` }}
      />
      {[-1, 1].map((side) => (
        <rect
          key={side}
          x={-0.75}
          y={-9}
          width={1.5}
          height={18}
          className={`scene-move ${ink}`}
          style={{ transform: `translateX(${px((side * length) / 2)})` }}
        />
      ))}
      <text
        y={-16}
        textAnchor="middle"
        className={`${ink} font-sans`}
        style={{ fontSize: 26, fontWeight: 600 }}
      >
        {label}
      </text>
    </g>
  );
}

function TileWall({ width, height }: { width: number; height: number }) {
  const lines: ReactNode[] = [];
  for (let x = 300; x < width; x += 300)
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} />);
  for (let y = 300; y < height; y += 600)
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} />);
  return (
    <g>
      <rect width={width} height={height} className="fill-paper" />
      <g className="stroke-line" strokeWidth={3}>
        {lines}
      </g>
    </g>
  );
}

/**
 * Cabinet/door surfaces contrast with the metal: navy for light metals,
 * pale teal for dark ones. `lines` is the colour of mouldings on it.
 */
function surfaceFor(metal: Metal) {
  return luminance(metal.color) < 0.12
    ? { fill: "fill-accent/20 stroke-accent/60", lines: "stroke-ink/15" }
    : { fill: "fill-band stroke-band", lines: "stroke-on-band/20" };
}

function KitchenScene({
  metal,
  length,
  cc,
  knobs,
  mm,
}: {
  metal: Metal;
  length: number;
  cc: number | null;
  knobs?: number;
  mm: (n: number) => string;
}) {
  const front = surfaceFor(metal);
  const fronts = knobs
    ? [
        [374, 180],
        [558, 190],
        [752, 196],
      ]
    : [
        [374, 170],
        [548, 400],
      ];
  return (
    <svg viewBox="0 0 800 1000" className="size-full">
      <rect width={800} height={1000} className="fill-surface" />
      <g className="stroke-line" strokeWidth={2}>
        {[80, 160, 240].map((y) => (
          <line key={y} x1={0} y1={y} x2={800} y2={y} />
        ))}
      </g>
      <rect x={60} y={330} width={680} height={40} className="fill-ink/85" />
      <rect x={110} y={952} width={580} height={48} className="fill-ink/15" />
      {fronts.map(([y, h]) => (
        <rect
          key={y}
          x={104}
          y={y}
          width={592}
          height={h! - 4}
          strokeWidth={2}
          className={`scene-surface ${front.fill}`}
        />
      ))}
      {knobs
        ? fronts.map(([y, h]) => (
            <g key={y} className="scene-move" style={at(400, y! + h! / 2 - 2)}>
              <g className="scene-install">
                <circle
                  r={100}
                  className="scene-move scene-metal stroke-ink/25"
                  strokeWidth={5}
                  style={{
                    fill: metal.color,
                    transform: `scale(${knobs / 200})`,
                  }}
                />
                <circle
                  r={100}
                  className="scene-move fill-paper/40"
                  style={{
                    transform: `translate(${px(-knobs / 8)}, ${px(-knobs / 8)}) scale(${knobs / 600})`,
                  }}
                />
              </g>
            </g>
          ))
        : fronts.map(([y]) => (
            <Bar
              key={y}
              x={400}
              y={y! + 60}
              length={length}
              cc={cc}
              metal={metal}
            />
          ))}
      {!knobs && cc !== null && (
        <Dimension
          x={400}
          y={410}
          length={cc}
          label={mm(cc)}
          onDark={luminance(metal.color) >= 0.12}
        />
      )}
    </svg>
  );
}

function DoorScene({ metal, lever }: { metal: Metal; lever: number }) {
  const leaf = surfaceFor(metal);
  const fill = { fill: metal.color } as CSSProperties;
  return (
    <svg viewBox="-500 -120 1800 2250" className="size-full">
      <rect
        x={-500}
        y={-120}
        width={1800}
        height={2250}
        className="fill-surface"
      />
      <rect x={-500} y={2000} width={1800} height={130} className="fill-line" />
      <rect
        x={-500}
        y={1930}
        width={1800}
        height={70}
        className="fill-paper stroke-line"
        strokeWidth={2}
      />
      <rect
        x={-70}
        y={-70}
        width={940}
        height={2070}
        className="fill-paper stroke-line-strong"
        strokeWidth={2}
      />
      <rect
        x={0}
        y={0}
        width={800}
        height={2000}
        strokeWidth={2}
        className={`scene-surface ${leaf.fill}`}
      />
      <g className={`scene-surface ${leaf.lines}`} strokeWidth={4} fill="none">
        <rect x={110} y={130} width={580} height={700} />
        <rect x={110} y={1110} width={580} height={760} />
      </g>
      <g className="scene-install">
        {/* Lever on its rosette, pointing towards the hinge side */}
        <g className="scene-move" style={at(735, 950)}>
          <rect
            x={-500}
            y={-9}
            width={1000}
            height={18}
            rx={0}
            className="scene-move scene-metal"
            style={{
              ...fill,
              transform: `translateX(${px(-lever / 2)}) scaleX(${lever / 1000})`,
            }}
          />
          <circle
            r={9}
            className="scene-move scene-metal"
            style={{ ...fill, transform: `translateX(${px(-lever)})` }}
          />
          <circle
            r={26}
            className="scene-metal stroke-ink/25"
            strokeWidth={1.5}
            style={fill}
          />
          <circle r={14} className="fill-paper/30" />
        </g>
        <g style={at(735, 1035)}>
          <circle
            r={18}
            className="scene-metal stroke-ink/25"
            strokeWidth={1.5}
            style={fill}
          />
          <path
            d="M0 -8a4 4 0 0 1 2.5 7.2L4 9H-4l1.5-9.8A4 4 0 0 1 0-8Z"
            className="fill-ink/70"
          />
        </g>
      </g>
    </svg>
  );
}

function FridgeScene({
  metal,
  length,
  cc,
}: {
  metal: Metal;
  length: number;
  cc: number | null;
}) {
  return (
    <svg viewBox="0 0 1000 1250" className="size-full">
      <rect width={1000} height={1250} className="fill-surface" />
      <rect
        x={200}
        y={-10}
        width={600}
        height={1300}
        className="fill-paper stroke-line-strong"
        strokeWidth={2}
      />
      <line
        x1={200}
        y1={420}
        x2={800}
        y2={420}
        className="stroke-line-strong"
        strokeWidth={3}
      />
      <Bar
        x={755}
        y={830}
        length={length}
        cc={cc}
        thickness={16}
        vertical
        metal={metal}
      />
      <Bar
        x={755}
        y={230}
        length={Math.min(length, 300)}
        cc={null}
        thickness={16}
        vertical
        metal={metal}
      />
    </svg>
  );
}

function BathScene({
  metal,
  length,
  hook,
}: {
  metal: Metal;
  length: number;
  hook?: boolean;
}) {
  const towel = luminance(metal.color) < 0.12 ? "fill-accent" : "fill-band";
  const fill = { fill: metal.color } as CSSProperties;
  if (hook)
    return (
      <svg viewBox="0 0 1000 1250" className="size-full">
        <TileWall width={1000} height={1250} />
        <g className="scene-install">
          <path
            d="M400 520Q400 470 450 470H550Q600 470 600 520V1010H400Z"
            className={`scene-surface ${towel}`}
          />
          <g className="stroke-paper/25" strokeWidth={6}>
            <line x1={400} y1={960} x2={600} y2={960} />
            <line x1={400} y1={980} x2={600} y2={980} />
          </g>
          <circle
            cx={500}
            cy={440}
            r={24}
            className="scene-metal stroke-ink/25"
            strokeWidth={1.5}
            style={fill}
          />
          <rect
            x={491}
            y={440}
            width={18}
            height={62}
            rx={9}
            className="scene-metal stroke-ink/25"
            strokeWidth={1.5}
            style={fill}
          />
        </g>
      </svg>
    );
  const towelWidth = Math.min(length * 0.62, 560);
  return (
    <svg viewBox="0 0 1200 1500" className="size-full">
      <TileWall width={1200} height={1500} />
      <Bar
        x={600}
        y={600}
        length={length}
        cc={null}
        thickness={16}
        flanges
        metal={metal}
      />
      <g className="scene-move" style={at(600, 0)}>
        <g className="scene-install">
          <rect
            x={-500}
            y={588}
            width={1000}
            height={470}
            rx={0}
            className={`scene-move scene-surface ${towel}`}
            style={{ transform: `scaleX(${towelWidth / 1000})` }}
          />
          <rect
            x={-500}
            y={1000}
            width={1000}
            height={8}
            className="scene-move fill-paper/25"
            style={{ transform: `scaleX(${towelWidth / 1000})` }}
          />
          <rect
            x={-500}
            y={1020}
            width={1000}
            height={8}
            className="scene-move fill-paper/25"
            style={{ transform: `scaleX(${towelWidth / 1000})` }}
          />
        </g>
      </g>
    </svg>
  );
}

function LegScene({ metal, height }: { metal: Metal; height: number }) {
  const body = surfaceFor(metal);
  const floor = 1000;
  return (
    <svg viewBox="0 0 1000 1250" className="size-full">
      <rect width={1000} height={1250} className="fill-surface" />
      <rect y={floor} width={1000} height={250} className="fill-line" />
      <g className="scene-move" style={at(0, floor - height)}>
        <rect
          x={50}
          y={-480}
          width={900}
          height={480}
          strokeWidth={2}
          className={`scene-surface ${body.fill}`}
        />
        <g className={`scene-surface ${body.lines}`} strokeWidth={3}>
          <line x1={350} y1={-470} x2={350} y2={-10} />
          <line x1={650} y1={-470} x2={650} y2={-10} />
        </g>
      </g>
      {[110, 890].map((x) => (
        <polygon
          key={x}
          points="-22,-1000 22,-1000 14,0 -14,0"
          className="scene-move scene-metal stroke-ink/25"
          strokeWidth={0}
          style={{
            fill: metal.color,
            transform: `translate(${px(x)}, ${px(floor)}) scaleY(${height / 1000})`,
          }}
        />
      ))}
    </svg>
  );
}

export function ProductScene({
  kind,
  variants,
}: {
  kind: SceneKind;
  variants: readonly Variant[];
}) {
  const t = useTranslations("product");
  const sku = useSyncExternalStore(
    skuStore.subscribe,
    skuStore.get,
    () => null,
  );
  const variant = variants.find((v) => v.sku === sku) ?? variants[0];
  const metal = { color: variant?.finish?.swatch ?? STEEL };
  const cc = variant?.holeToHoleMm ?? null;
  const length = variant?.lengthMm ?? (cc ? cc + 36 : null);
  const mm = (value: number) => t("mmValue", { value });

  const scene = (() => {
    switch (kind) {
      case "kitchenBar":
        return (
          <KitchenScene metal={metal} length={length ?? 164} cc={cc} mm={mm} />
        );
      case "kitchenKnob":
        return (
          <KitchenScene
            metal={metal}
            length={0}
            cc={null}
            knobs={variant?.lengthMm ?? 32}
            mm={mm}
          />
        );
      case "doorLever":
        return <DoorScene metal={metal} lever={variant?.lengthMm ?? 135} />;
      case "fridgeBar":
        return <FridgeScene metal={metal} length={length ?? 400} cc={cc} />;
      case "towelBar":
        return <BathScene metal={metal} length={length ?? 600} />;
      case "wallHook":
        return <BathScene metal={metal} length={0} hook />;
      case "furnitureLeg":
        return <LegScene metal={metal} height={variant?.lengthMm ?? 150} />;
    }
  })();

  return (
    <figure className="flex size-full flex-col">
      <div
        aria-hidden="true"
        className="product-scene min-h-0 flex-1"
        data-scene={kind}
        data-length={length ?? undefined}
        data-color={metal.color}
      >
        {scene}
      </div>
      <figcaption className="bg-paper px-4 py-3 text-sm text-ink-muted">
        {t("sceneCaption", { context: t(`sceneContext.${kind}`) })}
      </figcaption>
    </figure>
  );
}
