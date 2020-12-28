import { Display } from "./display.ts";
import { Keypad } from "./keypad.ts";

export const VF = 0xF;
export const WIDTH = 64;
export const HEIGHT = 32;
export const FONT_SET = new Uint8Array(
  [
    0b11110000,
    0b10010000,
    0b10010000,
    0b10010000,
    0b11110000,

    0b00100000,
    0b01100000,
    0b00100000,
    0b00100000,
    0b01110000,

    0b11110000,
    0b00010000,
    0b11110000,
    0b10000000,
    0b11110000,

    0b11110000,
    0b00010000,
    0b11110000,
    0b00010000,
    0b11110000,

    0b10010000,
    0b10010000,
    0b11110000,
    0b00010000,
    0b00010000,

    0b11110000,
    0b10000000,
    0b11110000,
    0b00010000,
    0b11110000,

    0b11110000,
    0b10000000,
    0b11110000,
    0b10010000,
    0b11110000,

    0b11110000,
    0b00010000,
    0b00100000,
    0b01000000,
    0b01000000,

    0b11110000,
    0b10010000,
    0b11110000,
    0b10010000,
    0b11110000,

    0b11110000,
    0b10010000,
    0b11110000,
    0b00010000,
    0b11110000,

    0b11110000,
    0b10010000,
    0b11110000,
    0b10010000,
    0b10010000,

    0b11100000,
    0b10010000,
    0b11100000,
    0b10010000,
    0b11100000,

    0b11110000,
    0b10000000,
    0b10000000,
    0b10000000,
    0b11110000,

    0b11100000,
    0b10010000,
    0b10010000,
    0b10010000,
    0b11100000,

    0b11110000,
    0b10000000,
    0b11110000,
    0b10000000,
    0b11110000,

    0b11110000,
    0b10000000,
    0b11110000,
    0b10000000,
    0b10000000,
  ],
);

export class CPU {
  #i_pc_sp_dt_st = new ArrayBuffer(2 + 2 + 1 + 1 + 1);
  #view = new DataView(this.#i_pc_sp_dt_st);

  /** index register */
  get i(): number {
    return this.#view.getUint16(0);
  }

  set i(i: number) {
    this.#view.setUint16(0, i);
  }

  /** program counter */
  get pc(): number {
    return this.#view.getUint16(2);
  }

  set pc(pc: number) {
    this.#view.setUint16(2, pc);
  }

  /** stack pointer */
  get sp(): number {
    return this.#view.getUint8(4);
  }

  set sp(sp: number) {
    this.#view.setUint8(4, sp);
  }

  /** delay timer */
  get dt(): number {
    return this.#view.getUint8(5);
  }

  set dt(dt: number) {
    this.#view.setUint8(5, dt);
  }

  /** sound timer */
  get st(): number {
    return this.#view.getUint8(6);
  }

  set st(st: number) {
    this.#view.setUint8(6, st);
  }

  /** memory */
  mem = new Uint8Array(4096);
  /** registers */
  v = new Uint8Array(16);
  /** stack */
  stack = new Uint16Array(16);

  /** the display */
  disp = new Display();
  /** the keypad */
  keyp = new Keypad();

  reset() {
    this.i = 0;
    this.pc = 0x200;
    this.mem.fill(0);
    this.v.fill(0);
    this.stack.fill(0);
    this.sp = 0;
    this.dt = 0;

    for (let i = 0; i < 80; i++) {
      this.mem[i] = FONT_SET[i];
    }
  }

  cycle() {
    const opcode = this.mem[this.pc] << 8 | this.mem[this.pc + 1] << 0;
    this.process(opcode);
  }

  step() {
    if (this.dt > 0) {
      this.dt -= 1;
    }
  }

  process(opcode: number) {
    const x = (opcode & 0x0F00) >> 8;
    const y = (opcode & 0x00F0) >> 4;
    const vx = this.v[x];
    const vy = this.v[y];

    const nnn = opcode & 0x0FFF;
    const nn = opcode & 0x00FF;
    const n = opcode & 0x000F;

    this.pc += 2;

    // CLR
    if (opcode === 0x00E0) {
      this.disp.clr();
    }
    // RET
    if (opcode === 0x00EE) {
      this.sp -= 1;
      this.pc = this.stack[this.sp];
    }

    switch ((opcode & 0xF000) >> 12) {
      // JP NNN
      case 0x1:
        this.pc = nnn;
        break;

      // CALL NNN

      case 0x2:
        this.stack[this.sp] = this.pc;
        this.sp += 1;
        this.pc = nnn;
        break;

      // SE VX NN

      case 0x3:
        this.pc += vx === nn ? 2 : 0;
        break;

      // SNE VX NN

      case 0x4:
        this.pc += vx !== nn ? 2 : 0;
        break;

      // SE VX VY

      case 0x5:
        this.pc += vx === vy ? 2 : 0;
        break;

      // LD VX NN

      case 0x6:
        this.v[x] = nn;
        break;

      // ADD VX NN

      case 0x7:
        this.v[x] += nn;
        break;

      case 0x8:
        switch (n) {
          // LD VX VY
          case 0x0:
            this.v[x] = vy;
            break;

          // OR VX VY

          case 0x1:
            this.v[x] |= vy;
            break;

          // AND VX VY

          case 0x2:
            this.v[x] &= vy;
            break;

          // XOR VX VY

          case 0x3:
            this.v[x] ^= vy;
            break;

          // ADD VX VY

          case 0x4:
            this.v[VF] = vx + vy > 0xFF ? 1 : 0;
            this.v[x] += vy;
            break;

          // SUB VX VY

          case 0x5:
            this.v[VF] = vx > vy ? 1 : 0;
            this.v[x] -= vy;
            break;

          // SHR VX

          case 0x6:
            this.v[VF] = vx & 0x1;
            this.v[x] >>= 1;
            break;

          // SUBN VX VY

          case 0x7:
            this.v[VF] = vy > vx ? 1 : 0;
            this.v[x] = vy - vx;
            break;

            // SHL VX VY

          case 0xE:
            this.v[VF] = vx & 0x80;
            this.v[x] <<= 1;
            break;
        }
        break;

      // SNE VX VY

      case 0x9:
        this.pc += vx !== vy ? 2 : 0;
        break;

      // LD I NNN

      case 0xA:
        this.i = nnn;
        break;

      // JP V0 NNN

      case 0xB:
        this.pc = nnn + this.v[0];
        break;

      // RND VX NN

      case 0xC:
        this.v[x] = Math.floor(Math.random() * 0xFF) & nn;
        break;

      // DRW VX VY N

      case 0xD:
        this.v[VF] = this.disp.drw(vx, vy, this.mem.slice(this.i, this.i + n))
          ? 1
          : 0;
        break;

      case 0xE:
        // SKP VX
        if (nn === 0x9E) {
          this.pc += this.keyp.keys[vx] ? 2 : 0;
        }

        // SKNP VX
        if (nn === 0xA1) {
          this.pc += this.keyp.keys[vx] ? 0 : 2;
        }
        break;
      case 0xF:
        // LD VX DT
        if (nn === 0x07) {
          this.v[x] = this.dt;
        }

        // LD VX K
        if (nn === 0x0A) {
          this.pc -= 2;

          for (let k = 0; k < this.keyp.keys.length; k++) {
            if (this.keyp.keys[k]) {
              this.v[x] = k;
              this.pc += 2;
            }
          }
        }

        // LD DT VX
        if (nn === 0x15) {
          this.dt = vx;
        }

        // LD ST VX
        if (nn === 0x18) {
          this.st = vx;
        }

        // ADD I VX
        if (nn === 0x1E) {
          this.i += vx;
        }

        // LD F VX
        if (nn === 0x29) {
          this.i = vx * 5;
        }

        // LD B VX
        if (nn === 0x33) {
          this.mem[this.i] = vx / 100;
          this.mem[this.i + 1] = (vx / 10) % 10;
          this.mem[this.i + 2] = (vx % 100) % 10;
        }

        // LD I VX
        if (nn === 0x55) {
          for (let i = 0; i <= x; i++) {
            this.mem[this.i + i] = this.v[i];
          }
        }

        // LD VX I
        if (nn === 0x65) {
          for (let i = 0; i <= x; i++) {
            this.v[i] = this.mem[this.i + i];
          }
        }
        break;
    }
  }
}
