/**
 * Data model for the rewritten Backend City renderer.
 *
 * This replaces the broken Tiled visual dependency with deliberate world
 * geometry. WorldScene should render from this file: grass/roads first,
 * then buildings/props/player/villains, with collisions and interactions
 * derived from the same coordinates.
 */

import type {
  BuildingAssetKey,
  PropAssetKey,
  TerrainAssetKey,
} from "@/game/assets/manifest";
import type { OverlayType, ProjectSlug, VillainId } from "@/game/types";

export type DistrictId =
  | "founder-quarter"
  | "systems-district"
  | "media-row"
  | "cloud-ridge"
  | "learning-grounds";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CityDistrict extends Rect {
  id: DistrictId;
  name: string;
}

export interface CityRoad extends Rect {
  id: string;
  sprite: TerrainAssetKey;
}

export interface CityProp {
  id: string;
  sprite: PropAssetKey;
  x: number;
  y: number;
  scale?: number;
  collision?: Rect;
}

export interface CityBuilding {
  id: string;
  name: string;
  slug: ProjectSlug;
  overlayType: Extract<OverlayType, "project" | "special">;
  sprite: BuildingAssetKey;
  x: number;
  y: number;
  scale: number;
  district: DistrictId;
  collision: Rect;
  interaction: Rect;
  entrance: { x: number; y: number };
}

export interface CityVillain {
  id: VillainId;
  name: string;
  x: number;
  y: number;
  district: DistrictId;
  interaction: Rect;
}

export interface CityLayout {
  world: {
    width: number;
    height: number;
    tileSize: number;
  };
  spawn: {
    x: number;
    y: number;
    facing: "down" | "up" | "left" | "right";
  };
  districts: CityDistrict[];
  roads: CityRoad[];
  buildings: CityBuilding[];
  props: CityProp[];
  villains: CityVillain[];
}

const TILE_SIZE = 32;

function building(
  id: string,
  name: string,
  slug: ProjectSlug,
  sprite: BuildingAssetKey,
  x: number,
  y: number,
  district: DistrictId,
  overlayType: Extract<OverlayType, "project" | "special"> = "project",
): CityBuilding {
  const width = 220;
  const height = 240;
  return {
    id,
    name,
    slug,
    overlayType,
    sprite,
    x,
    y,
    scale: 0.78,
    district,
    collision: {
      x: x + 18,
      y: y + 28,
      width: width - 36,
      height: height - 54,
    },
    interaction: {
      x: x + 42,
      y: y + height - 36,
      width: width - 84,
      height: 70,
    },
    entrance: {
      x: x + width / 2,
      y: y + height + 8,
    },
  };
}

export const CITY_LAYOUT: CityLayout = {
  world: {
    width: 1920,
    height: 1600,
    tileSize: TILE_SIZE,
  },
  spawn: {
    x: 960,
    y: 880,
    facing: "down",
  },
  districts: [
    {
      id: "founder-quarter",
      name: "Founder Quarter",
      x: 160,
      y: 120,
      width: 620,
      height: 560,
    },
    {
      id: "systems-district",
      name: "Systems District",
      x: 820,
      y: 120,
      width: 760,
      height: 560,
    },
    {
      id: "media-row",
      name: "Media Row",
      x: 160,
      y: 760,
      width: 620,
      height: 560,
    },
    {
      id: "cloud-ridge",
      name: "Cloud Ridge",
      x: 820,
      y: 760,
      width: 760,
      height: 420,
    },
    {
      id: "learning-grounds",
      name: "Learning Grounds",
      x: 600,
      y: 1220,
      width: 760,
      height: 300,
    },
  ],
  roads: [
    { id: "main-east-west", sprite: "roadHorizontal", x: 150, y: 704, width: 1500, height: 112 },
    { id: "main-north-south", sprite: "roadVertical", x: 900, y: 140, width: 120, height: 1220 },
    { id: "west-loop-top", sprite: "roadHorizontal", x: 250, y: 360, width: 520, height: 96 },
    { id: "west-loop-bottom", sprite: "roadHorizontal", x: 250, y: 1020, width: 520, height: 96 },
    { id: "east-loop-top", sprite: "roadHorizontal", x: 1050, y: 360, width: 520, height: 96 },
    { id: "east-loop-bottom", sprite: "roadHorizontal", x: 1050, y: 1020, width: 520, height: 96 },
    { id: "west-spine", sprite: "roadVerticalAlt", x: 430, y: 360, width: 112, height: 760 },
    { id: "east-spine", sprite: "roadVerticalAlt", x: 1320, y: 360, width: 112, height: 760 },
    { id: "learning-path", sprite: "roadHorizontal", x: 620, y: 1370, width: 700, height: 96 },
  ],
  buildings: [
    building("taply", "Taply HQ", "taply", "exchange", 250, 145, "founder-quarter"),
    building("unthink", "UnThink Labs", "unthink", "lab", 520, 150, "founder-quarter"),
    building("algocode", "Algocode Server Farm", "algocode", "serverFarm", 1050, 145, "systems-district"),
    building("datalineage-doctor", "DataLineage Doctor HQ", "datalineage-doctor", "lab", 1320, 145, "systems-district"),
    building("movio", "Movio Studios", "movio", "studio", 225, 810, "media-row"),
    building("cutetube", "CuteTube Studio", "cutetube", "studio", 500, 810, "media-row"),
    building("drishti-ai", "DrishtiAI Vision Lab", "drishti-ai", "lab", 1120, 800, "cloud-ridge"),
    building("airpass", "AirPass Exchange", "airpass", "exchange", 1390, 800, "cloud-ridge"),
    building("pulumi-infra", "Pulumi Cloud Towers", "pulumi-infra", "officeTower", 1070, 470, "systems-district"),
    building("imgtwist", "ImgTwist Gallery", "imgtwist", "newspaperHq", 250, 470, "media-row"),
    building("load-balancer", "LB Junction", "load-balancer", "serverFarm", 700, 470, "systems-district"),
    building("prostream", "ProStream Studio", "prostream", "studio", 1390, 470, "cloud-ridge"),
    building("writing-hq", "Backend Diaries HQ", "writing-hq", "newspaperHq", 700, 1180, "learning-grounds", "special"),
    building("skills-academy", "Skills Academy", "skills-academy", "officeTower", 970, 1180, "learning-grounds", "special"),
    building("contact-bureau", "Contact Bureau", "contact-bureau", "exchange", 1240, 1180, "learning-grounds", "special"),
  ],
  props: [
    { id: "tree-founder-1", sprite: "treeSmall", x: 205, y: 420, scale: 0.8 },
    { id: "tree-founder-2", sprite: "treeRound", x: 745, y: 420, scale: 0.8 },
    { id: "lamp-spawn-left", sprite: "lamp", x: 815, y: 835, scale: 0.7 },
    { id: "lamp-spawn-right", sprite: "lamp", x: 1055, y: 835, scale: 0.7 },
    { id: "sign-center", sprite: "sign", x: 980, y: 830, scale: 0.8 },
    { id: "tree-learning-1", sprite: "treePine", x: 620, y: 1320, scale: 0.8 },
    { id: "tree-learning-2", sprite: "treePine", x: 1345, y: 1320, scale: 0.8 },
  ],
  villains: [
    {
      id: "gopher-king",
      name: "The Gopher King",
      x: 720,
      y: 1450,
      district: "learning-grounds",
      interaction: { x: 680, y: 1410, width: 80, height: 80 },
    },
    {
      id: "terraform-titan",
      name: "Terraform Titan",
      x: 960,
      y: 1450,
      district: "learning-grounds",
      interaction: { x: 920, y: 1410, width: 80, height: 80 },
    },
    {
      id: "ebpf-phantom",
      name: "eBPF Phantom",
      x: 1200,
      y: 1450,
      district: "learning-grounds",
      interaction: { x: 1160, y: 1410, width: 80, height: 80 },
    },
  ],
} as const satisfies CityLayout;

export function districtForPoint(x: number, y: number): CityDistrict | undefined {
  return CITY_LAYOUT.districts.find(
    (district) =>
      x >= district.x &&
      x <= district.x + district.width &&
      y >= district.y &&
      y <= district.y + district.height,
  );
}
