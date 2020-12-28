import { HEIGHT, WIDTH } from "./cpu.ts";

export class Display {
  #buf = new Uint8Array(WIDTH * HEIGHT);

  clr() {
    this.#buf.fill(0);
  }

  drw(x: number, y: number, sprite: Uint8Array): boolean {
    const rows = sprite.length;
    let col = false;

    for (let j = 0; j < rows; j++) {
      const row = sprite[j];

      for (let i = 0; i < 8; i++) {
        const newVal = row >> (7 - i) & 0x01;
        if (newVal === 1) {
          const idx = ((x + i) % WIDTH) + ((y + j) % HEIGHT) * WIDTH;
          
          if (this.#buf[idx] === 1) {
            col = true;
          }

          this.#buf[idx] = this.#buf[idx] !== 1 ? 1 : 0;
        }
      }
    }

    return col;
  }

  toRGBA(r = 255, g = 255, b = 255, a = 255): Uint8Array {
    const rgba = new Uint8Array(this.#buf.length * 4);
    for (let i = 0; i < this.#buf.length; i++) {
      if (this.#buf[i] === 1) {
        rgba[i * 4] = r;
        rgba[i * 4 + 1] = g;
        rgba[i * 4 + 2] = b;
        rgba[i * 4 + 3] = a;
      }
    }
    return rgba;
  }
}
