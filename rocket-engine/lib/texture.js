export class Texture {
  #image;

  constructor(imgUrl) {
    this.#image = this.#setImage(imgUrl);
  }

  getImage() {
    return this.#image;
  }

  #setImage(imgUrl) {
    const image = new Image();
    image.onload = () => {
      this.#image = image;
    }
    image.src = imgUrl;
  }
}