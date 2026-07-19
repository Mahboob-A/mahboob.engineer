/**
 * Manifest for the rewritten Backend City asset pipeline.
 *
 * Source assets are extracted by `scripts/extract-game-assets.py`.
 * Phaser scenes should load these named sprites instead of reading the
 * labeled ChatGPT concept sheet directly.
 */

export const GAME_ASSETS = {
  buildings: {
    serverFarm: "/assets/game/buildings/server-farm.png",
    studio: "/assets/game/buildings/studio.png",
    lab: "/assets/game/buildings/lab.png",
    newspaperHq: "/assets/game/buildings/newspaper-hq.png",
    officeTower: "/assets/game/buildings/office-tower.png",
    exchange: "/assets/game/buildings/exchange.png",
  },
  terrain: {
    grassPlain: "/assets/game/terrain/grass-plain.png",
    grassDetail: "/assets/game/terrain/grass-detail.png",
    grassFlower: "/assets/game/terrain/grass-flower.png",
    roadVertical: "/assets/game/terrain/road-vertical.png",
    roadVerticalAlt: "/assets/game/terrain/road-vertical-alt.png",
    roadIntersection: "/assets/game/terrain/road-intersection.png",
    roadHorizontal: "/assets/game/terrain/road-horizontal.png",
    roadCorner: "/assets/game/terrain/road-corner.png",
    sidewalkPlain: "/assets/game/terrain/sidewalk-plain.png",
    sidewalkDetail: "/assets/game/terrain/sidewalk-detail.png",
    sidewalkCorner: "/assets/game/terrain/sidewalk-corner.png",
  },
  props: {
    treeSmall: "/assets/game/props/tree-small.png",
    treeRound: "/assets/game/props/tree-round.png",
    treePine: "/assets/game/props/tree-pine.png",
    lamp: "/assets/game/props/lamp.png",
    sign: "/assets/game/props/sign.png",
  },
  player: {
    developerSheet: "/assets/game/player/developer-sheet.png",
    frameWidth: 96,
    frameHeight: 144,
  },
} as const;

export type BuildingAssetKey = keyof typeof GAME_ASSETS.buildings;
export type TerrainAssetKey = keyof typeof GAME_ASSETS.terrain;
export type PropAssetKey = keyof typeof GAME_ASSETS.props;
