import { Texture } from './texture.js';

export class World {
  #MAP;
  #TILE_SIZE;
  #TILE_COLORS;
  #TILE_TEXTURES;

  constructor({ tileSize, tileColors, tileTextures }) {
    this.#TILE_SIZE = tileSize;
    this.#TILE_COLORS = tileColors;
    this.#TILE_TEXTURES = tileTextures;
  }

  addMap(map) {
    if(!Array.isArray(map) || (map.length && !Array.isArray(map[0]))) throw Error('Map should be two dimensional array');
    
    this.#MAP = map;
  }

  getMap() {
    return this.#MAP;
  }

  getTileSize() {
    return this.#TILE_SIZE;
  }

  renderWorld(canvas) {
    const ctx = canvas.getContext('2d');
    let mapOffsetX = 0;
    let mapOffsetY = 0;

    for (let row = 0; row < this.#MAP.length; row++) {
      for (let col = 0; col < this.#MAP[row].length; col++) {
        let texture = null;

        if (this.#TILE_TEXTURES[this.#MAP[row][col]] instanceof Texture) {
          texture = this.#TILE_TEXTURES[this.#MAP[row][col]].getImage();
        }

        if (texture) {
          ctx.drawImage(texture, mapOffsetX, mapOffsetY, this.#TILE_SIZE, this.#TILE_SIZE);
        } else {
          ctx.fillStyle = this.#TILE_COLORS[this.#MAP[row][col]];
          ctx.fillRect(mapOffsetX, mapOffsetY, this.#TILE_SIZE, this.#TILE_SIZE);
        }

        mapOffsetX += this.#TILE_SIZE;

        if (col + 1 === this.#MAP[row].length) {
          mapOffsetX = 0;
          mapOffsetY += this.#TILE_SIZE;
        }
      }
    }
  }
}