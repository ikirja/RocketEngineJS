import { World } from '/rocket-engine/lib/world.js';
import { Player } from '/rocket-engine/lib/player.js';

export { World, Player };

export class RocketEngine {
  #canvas;
  #world;
  #player;
  #previousRenderDelta;
  #FPS;
  #FPS_INTERVAL;
  #FPS_TOLERANCE;
  
  constructor() {
    this.#canvas = {
      width: 0,
      height: 0,
      node: null
    }
    this.#previousRenderDelta = 0;
    this.#FPS = 60;
    this.#FPS_INTERVAL = 1000 / this.#FPS;
    this.#FPS_TOLERANCE = 0.01;
  }

  setScreenDimensions({ width, height }) {
    if (!width || !height || width < 0 || height < 0) throw Error('Canvas width or height can\'t be 0 or below');

    this.#canvas.width = width;
    this.#canvas.height = height;
  }

  createScreen() {
    if (!this.#canvas.width || !this.#canvas.height || this.#canvas.width < 0 || this.#canvas.height < 0) throw Error('Canvas width or height can\'t be 0 or below');

    const body = document.querySelector('body');
    const canvas = document.createElement('canvas');
    canvas.width = this.#canvas.width;
    canvas.height = this.#canvas.height;

    body.appendChild(canvas);

    this.#canvas.node = canvas;
  }

  getCanvas() {
    return this.#canvas.node;
  }

  addWorld(world) {
    if (!(world instanceof World)) throw Error('Provided world should be an instance of class World');

    this.#world = world;
  }

  addPlayer(player) {
    if (!(player instanceof Player)) throw Error('Provided player should be an instance of class Player');

    player.setPlayerCenter(this.#world.getTileSize());

    this.#player = player;
  }

  updateController(typeOfController, typeOfEvent, event) {
    this.#player.updateController(this.#canvas.node, typeOfController, typeOfEvent, event);
  }

  render(currentDelta = 0) {
    window.requestAnimationFrame(this.render.bind(this));

    const renderDelta = currentDelta - this.#previousRenderDelta;
    if (this.#FPS && renderDelta < this.#FPS_INTERVAL - this.#FPS_TOLERANCE) return;

    const canvas = this.#canvas.node;
    const MAP = this.#world.getMap();
    const TILE_SIZE = this.#world.getTileSize();

    this.#clearScreen();
    this.#world.renderWorld(canvas);
    this.#player.renderPlayer(canvas, MAP, TILE_SIZE);

    this.#previousRenderDelta = currentDelta;
  }

  #clearScreen() {
    const ctx = this.#canvas.node.getContext('2d');
    ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
}