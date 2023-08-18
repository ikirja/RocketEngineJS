import { Texture } from './texture.js';

export class Player {
  #sprite;
  #size;
  #startPosition;
  #playerCenter;
  #viewAngle;
  #moveX;
  #moveY;
  #moveAngle;
  #isMoving;
  #velocity;
  #maxSpeed;
  #controller;

  constructor({ sprite, playerSize, playerStartPosition, velocity, maxSpeed }) {
    this.#sprite = sprite;
    this.#size = playerSize;
    this.#startPosition = playerStartPosition;
    this.#playerCenter = [ 0, 0 ];
    this.#viewAngle = Math.PI;
    this.#moveX = 0;
    this.#moveY = 0;
    this.#moveAngle = 0;
    this.#isMoving = false;
    this.#velocity = velocity;
    this.#maxSpeed = maxSpeed;
    this.#controller = {
      mouse: {
        cursorPosition: [ 0, 0 ]
      }
    };
  }

  setPlayerCenter(TILE_SIZE) {
    const x = this.#startPosition[1] * TILE_SIZE - TILE_SIZE / 2;
    const y = this.#startPosition[0] * TILE_SIZE + TILE_SIZE / 2;

    this.#playerCenter = [ x, y ];
  }

  isMoving(bool) {
    this.#isMoving = bool ? true : false;
  }

  updateController(canvas, typeOfController, typeOfEvent, event) {
    if (typeOfController === 'mouse' && typeOfEvent === 'move') {
      this.#updateControllerPosition(canvas, typeOfController, event);
    }

    if (typeOfController === 'mouse' && typeOfEvent === 'pressed') {
      this.isMoving(true);
    }

    if (typeOfController === 'mouse' && typeOfEvent === 'released') {
      this.isMoving(false);
    }
  }

  renderPlayer(canvas, MAP, TILE_SIZE) {
    if (this.#isMoving) {
      this.#moveX += this.#velocity;
      this.#moveY += this.#velocity;
  
      if (this.#moveX > this.#maxSpeed) this.#moveX = this.#maxSpeed;
      if (this.#moveY > this.#maxSpeed) this.#moveY = this.#maxSpeed;
  
      const rotateDirection = this.#getRotateDirection();
  
      if (rotateDirection === 'none') this.#moveAngle = 0;
      if (rotateDirection === 'left') this.#moveAngle = 2;
      if (rotateDirection === 'right') this.#moveAngle = -2;
    } else {
      this.#moveX -= this.#velocity;
      this.#moveY -= this.#velocity;
      this.#moveAngle = 0;
  
      if (this.#moveX < 0) this.#moveX = 0;
      if (this.#moveY < 0) this.#moveY = 0;
    }
  
    let playerOffsetX = Math.sin(this.#viewAngle); 
    let playerOffsetY = Math.cos(this.#viewAngle);
    let mapTargetX = Math.floor((this.#playerCenter[0] + playerOffsetX * this.#moveX + playerOffsetX * this.#size[0] / 2) / TILE_SIZE);
    let mapTargetY = Math.floor((this.#playerCenter[1] + playerOffsetY * this.#moveY + playerOffsetY * this.#size[1] / 2) / TILE_SIZE);
  
    if (this.#moveX && MAP[mapTargetY][mapTargetX] == 0) this.#playerCenter[0] = this.#playerCenter[0] + playerOffsetX * this.#moveX;
    if (this.#moveY && MAP[mapTargetY][mapTargetX] == 0) this.#playerCenter[1] = this.#playerCenter[1] + playerOffsetY * this.#moveY;
    if (this.#moveAngle) this.#viewAngle = this.#viewAngle + 0.03 * this.#moveAngle;
  
    this.#drawPlayer(canvas);

    // DEBUG VIEW
    const queryParams = new URLSearchParams(window.location.search);

    if (queryParams.get('debug')) {
      this.#drawViewLine(canvas);
      this.#drawLineToMouseCursor(canvas);
    }
  }

  #getRotateDirection() {
    let angleMouse = Math.atan2(this.#controller.mouse.cursorPosition[1] - this.#playerCenter[1], this.#controller.mouse.cursorPosition[0] - this.#playerCenter[0]) * 180 / Math.PI + 180;
    let angleViewLine = Math.atan2(this.#playerCenter[1] + Math.cos(this.#viewAngle) - this.#playerCenter[1], this.#playerCenter[0] + Math.sin(this.#viewAngle) - this.#playerCenter[0]) * 180 / Math.PI + 180;
    angleMouse = Math.round(angleMouse);
    angleViewLine = Math.round(angleViewLine);
  
    let deadZone = angleMouse - angleViewLine;
  
    let degreeToAdjustViewLine = 360 - angleMouse;
    angleViewLine = angleViewLine + degreeToAdjustViewLine;
    if (angleViewLine > 360) angleViewLine = angleViewLine - 360;
  
    if (angleMouse === angleViewLine || (deadZone > -2 && deadZone < 2)) return 'none';
    if (0 <= angleViewLine && angleViewLine < 180) return 'left';
    if (180 <= angleViewLine && angleViewLine < 360) return 'right'; 
  }

  #drawPlayer(canvas) {
    const ctx = canvas.getContext('2d');
    let sprite = null;
    
    if (this.#sprite instanceof Texture) sprite = this.#sprite.getImage();

    if (sprite) {
      ctx.save();
      ctx.translate(this.#playerCenter[0], this.#playerCenter[1]);
      ctx.rotate(Math.sin(this.#viewAngle));
      ctx.translate(-this.#playerCenter[0], -this.#playerCenter[1]);
      ctx.drawImage(sprite, this.#playerCenter[0] - this.#size[0] / 2, this.#playerCenter[1] - this.#size[1] / 2, this.#size[0], this.#size[1]);
      ctx.restore();
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.#playerCenter[0] - this.#size[0] / 2, this.#playerCenter[1] - this.#size[1] / 2, this.#size[0], this.#size[1]);
    }
  }

  #drawViewLine(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(this.#playerCenter[0], this.#playerCenter[1]);
    ctx.lineTo(this.#playerCenter[0] + Math.sin(this.#viewAngle) * 100, this.#playerCenter[1] + Math.cos(this.#viewAngle) * 100);
    ctx.stroke();
  }

  #drawLineToMouseCursor(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(this.#playerCenter[0], this.#playerCenter[1]);
    ctx.lineTo(this.#controller.mouse.cursorPosition[0], this.#controller.mouse.cursorPosition[1]);
    ctx.stroke();
  }

  #updateControllerPosition(canvas, typeOfController, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.#controller[typeOfController].cursorPosition = [ x, y ];
  }
}