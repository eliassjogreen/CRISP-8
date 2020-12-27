import { FONT_SET, IO } from "./io.ts";

const VF = 0xF;

function readWord(mem: Uint8Array, index: number): number {
  return mem[index] << 8 | mem[index + 1] << 0;
}

export class CPU {
  #i_pc_sp_dt = new ArrayBuffer(2 + 2 + 1 + 1);
  #view = new DataView(this.#i_pc_sp_dt);

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

  /** memory */
  mem = new Uint8Array(4096);
  /** registers */
  v = new Uint8Array(16);
  /** stack */
  stack = new Uint16Array(16);

  /** IO devices (display, keypad) */
  io = new IO();

  reset() {
    this.io.clear();
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

  executeCycle() {
    const opcode = readWord(this.mem, this.pc);
    this.processOpcode(opcode);
  }

  decrementTimers() {
    if (this.dt > 0) {
      this.dt -= 1;
    }
  }

  processOpcode(opcode: number) {
    const x = (opcode & 0x0F00) >> 8;
    const y = (opcode & 0x00F0) >> 4;
    const vx = this.v[x];
    const vy = this.v[y];

    const nnn = opcode & 0x0FFF;
    const nn = opcode & 0x00FF;
    const n = opcode & 0x000F;

    const op1 = (opcode & 0xF000) >> 12;
    const op2 = (opcode & 0x0F00) >> 8;
    const op3 = (opcode & 0x00F0) >> 4;
    const op4 = opcode & 0x000F;

    // console.log();
    // console.log(`  x: ${x.toString(16)}  y: ${y.toString(16)}`);
    // console.log(` vx: ${vx.toString(16)} vy: ${vy.toString(16)}`);
    // console.log(`nnn: ${nnn.toString(16)}`);
    // console.log(` nn: ${nn.toString(16)}`);
    // console.log(`  n: ${n.toString(16)}`);
    // console.log(`op1: ${op1.toString(16)}`);
    // console.log(`op2: ${op2.toString(16)}`);
    // console.log(`op3: ${op3.toString(16)}`);
    // console.log(`op4: ${op4.toString(16)}`);

    this.pc += 2;

    // CLR
    if (op1 === 0 && op2 === 0 && op3 === 0xE && op4 === 0) {
      this.io.clear();
    }
    // RET
    if (op1 === 0 && op2 === 0 && op3 === 0xE && op4 === 0xE) {
      this.sp -= 1;
      this.pc = this.stack[this.sp];
    }
    // JP NNN
    if (op1 === 0x1) {
      this.pc = nnn;
    }
    // CALL NNN
    if (op1 === 0x2) {
      this.stack[this.sp] = this.pc;
      this.sp += 1;
      this.pc = nnn;
    }
    // SE VX NN
    if (op1 === 0x3) {
      this.pc += vx === nn ? 2 : 0;
    }
    // SNE VX NN
    if (op1 === 0x4) {
      this.pc += vx !== nn ? 2 : 0;
    }
    // SE VX VY
    if (op1 === 0x5) {
      this.pc += vx === vy ? 2 : 0;
    }
    // LD VX NN
    if (op1 === 0x6) {
      this.v[x] = nn;
    }
    // ADD VX NN
    if (op1 === 0x7) {
      this.v[x] += nn;
    }
    // LD VX VY
    if (op1 === 0x8 && op4 === 0x0) {
      this.v[x] = vy;
    }
    // OR VX VY
    if (op1 === 0x8 && op4 === 0x1) {
      this.v[x] |= vy;
    }
    // AND VX VY
    if (op1 === 0x8 && op4 === 0x2) {
      this.v[x] &= vy;
    }
    // XOR VX VY
    if (op1 === 0x8 && op4 === 0x3) {
      this.v[x] ^= vy;
    }
    // ADD VX VY
    if (op1 === 0x8 && op4 === 0x4) {
      this.v[VF] = vx + vy > 0xFF ? 1 : 0;
      this.v[x] += vy;
    }
    // SUB VX VY
    if (op1 === 0x8 && op4 === 0x5) {
      this.v[VF] = vx > vy ? 1 : 0;
      this.v[x] -= vy;
    }
    // SHR VX
    if (op1 === 0x8 && op4 === 0x6) {
      this.v[VF] = vx & 0x1;
      this.v[x] >>= 1;
    }
    // SUBN VX VY
    if (op1 === 0x8 && op4 === 0x7) {
      this.v[VF] = vy > vx ? 1 : 0;
      this.v[x] = vy - vx;
    }
    // SHL VX VY
    if (op1 === 0x8 && op4 === 0xE) {
      this.v[VF] = vx & 0x80;
      this.v[x] <<= 1;
    }
    // SNE VX VY
    if (op1 === 0x9) {
      this.pc += vx !== vy ? 2 : 0;
    }
    // LD I NNN
    if (op1 === 0xA) {
      this.i = nnn;
    }
    // JP V0 NNN
    if (op1 === 0xB) {
      this.pc = nnn + this.v[0];
    }
    // RND VX NN
    if (op1 === 0xC) {
      this.v[x] = Math.floor(Math.random() * 0xFF) & nn;
    }
    // DRW VX VY N
    if (op1 === 0xD) {
      this.v[VF] = this.io.draw(vx, vy, this.mem.slice(this.i, this.i + n))
        ? 1
        : 0;
    }
    // SKP VX
    if (op1 === 0xE && op3 === 0x9 && op4 === 0xE) {
      this.pc += this.io.isDown(vx) ? 2 : 0;
    }
    // SKNP VX
    if (op1 === 0xE && op3 === 0xA && op4 === 0x1) {
      this.pc += this.io.isDown(vx) ? 0 : 2;
    }
    // LD VX DT
    if (op1 === 0xF && op3 === 0x0 && op4 === 0x7) {
      this.v[x] = this.dt;
    }
    // LD VX K
    if (op1 === 0xF && op3 === 0x0 && op4 === 0xA) {
      this.pc -= 2;

      for (const [k, d] of this.io.keys) {
        if (d) {
          this.v[x] = k;
          this.pc += 2;
        }
      }
    }
    // LD DT VX
    if (op1 === 0xF && op3 === 0x1 && op4 === 0x5) {
      this.dt = vx;
    }
    // ADD I VX
    if (op1 === 0xF && op3 === 0x1 && op4 === 0xE) {
      this.i += vx;
    }
    // LD F VX
    if (op1 === 0xF && op3 === 0x2 && op4 === 0x9) {
      this.i = vx * 5;
    }
    // LD B VX
    if (op1 === 0xF && op3 === 0x3 && op4 === 0x3) {
      this.mem[this.i] = vx / 100;
      this.mem[this.i + 1] = (vx / 10) % 10;
      this.mem[this.i + 2] = (vx % 100) % 10;
    }
    // LD I VX
    if (op1 === 0xF && op3 === 0x5 && op4 === 0x5) {
      for (let i = this.i, j = 0; j < x + 1; i++, j++) {
        this.mem[i] = this.v[j];
      }
    }
    // LD VX I
    if (op1 === 0xF && op3 === 0x6 && op4 === 0x5) {
      for (let i = this.i, j = 0; j < x + 1; i++, j++) {
        this.v[j] = this.mem[i];
      }
    }
  }
}
