export const WIDTH = 64;
export const HEIGHT = 32;
export const FONT_SET = new Uint8Array([
  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80  // F
]);

export class IO {
  disp = new Uint8Array(WIDTH * HEIGHT);
  keys: Map<number, boolean> = new Map([
    [0x0, false],
    [0x1, false],
    [0x2, false],
    [0x3, false],
    [0x4, false],
    [0x5, false],
    [0x6, false],
    [0x7, false],
    [0x8, false],
    [0x9, false],
    [0xA, false],
    [0xB, false],
    [0xC, false],
    [0xD, false],
    [0xE, false],
    [0xF, false],
  ]);

  draw(x: number, y: number, sprite: Uint8Array): boolean {
    const rows = sprite.length;
    let col = false;

    for (let j = 0; j < rows; j++) {
      const row = sprite[j];

      for (let i = 0; i < 8; i++) {
        const newVal = row >> (7 - i) & 0x01;
        if (newVal === 1) {
          const xi = (x + i) % WIDTH;
          const yj = (y + j) % HEIGHT;
          const oldVal = this.getPixel(xi, yj);
          if (oldVal) {
            col = true;
          }
          this.setPixel(xi, yj, !oldVal);
        }
      }
    }
    
    return col;
  }

  getPixel(x: number, y: number): boolean {
    return this.disp[x + y * WIDTH] === 1;
  }

  setPixel(x: number, y: number, on: boolean) {
    this.disp[x + y * WIDTH] = on ? 1 : 0;
  }

  clear() {
    this.disp.fill(0);
  }

  isDown(key: number): boolean {
    return this.keys.get(key)!;
  }
}
