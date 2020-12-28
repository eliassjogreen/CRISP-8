import { assertEquals } from "./deps.ts";
import { CPU } from "../src/cpu.ts";

Deno.test({
  name: "opcode | JP",
  fn() {
    const cpu = new CPU();
    cpu.process(0x1A2A);

    assertEquals(cpu.pc, 0x0A2A);
  },
});

Deno.test({
  name: "opcode | CALL",
  fn() {
    const cpu = new CPU();
    const addr = 0x23;
    cpu.pc = addr;
    cpu.process(0x2ABC);

    assertEquals(cpu.pc, 0x0ABC);
    assertEquals(cpu.sp, 1);
    assertEquals(cpu.stack[0], addr + 2);
  },
});

Deno.test({
  name: "opcode | SE VX NN",
  fn() {
    const cpu = new CPU();
    cpu.v[1] = 0xFE;

    cpu.process(0x31FE);
    assertEquals(cpu.pc, 4);

    cpu.process(0x31FA);
    assertEquals(cpu.pc, 6);
  },
});

Deno.test({
  name: "opcode | SNE VX NN",
  fn() {
    const cpu = new CPU();
    cpu.v[1] = 0xFE;

    cpu.process(0x41FE);
    assertEquals(cpu.pc, 2);

    cpu.process(0x41FA);
    assertEquals(cpu.pc, 6);
  },
});

Deno.test({
  name: "opcode | SE VX VY",
  fn() {
    const cpu = new CPU();
    cpu.v[1] = 1;
    cpu.v[2] = 3;
    cpu.v[3] = 3;

    cpu.process(0x9230);
    assertEquals(cpu.pc, 2);

    cpu.process(0x9130);
    assertEquals(cpu.pc, 6);
  },
});

Deno.test({
  name: "opcode | ADD VX NNN",
  fn() {
    const cpu = new CPU();
    cpu.v[1] = 3;

    cpu.process(0x7101);
    assertEquals(cpu.v[1], 4);
  },
});

Deno.test({
  name: "opcode | LD VX VY",
  fn() {
    const cpu = new CPU();
    cpu.v[1] = 3;
    cpu.v[0] = 0;

    cpu.process(0x8010);
    assertEquals(cpu.v[0], 3);
  },
});

Deno.test({
  name: "opcode | OR VX VY",
  fn() {
    const cpu = new CPU();
    cpu.v[2] = 0b01101100;
    cpu.v[3] = 0b11001110;

    cpu.process(0x8231);
    assertEquals(cpu.v[2], 0b11101110);
  },
});

Deno.test({
  name: "opcode | AND VX VY",
  fn() {
    const cpu = new CPU();
    cpu.v[2] = 0b01101100;
    cpu.v[3] = 0b11001110;

    cpu.process(0x8232);
    assertEquals(cpu.v[2], 0b01001100);
  },
});

Deno.test({
  name: "opcode | XOR VX VY",
  fn() {
    const cpu = new CPU();
    cpu.v[2] = 0b01101100;
    cpu.v[3] = 0b11001110;

    cpu.process(0x8233);
    assertEquals(cpu.v[2], 0b10100010);
  },
});

Deno.test({
  name: "opcode | ADD VX VY",
  fn() {
    const cpu = new CPU();
    cpu.v[1] = 10;
    cpu.v[2] = 100;
    cpu.v[3] = 250;

    cpu.process(0x8124);
    assertEquals(cpu.v[1], 110);
    assertEquals(cpu.v[0xF], 0);

    cpu.process(0x8134);
    assertEquals(cpu.v[1], 0x68);
    assertEquals(cpu.v[0xF], 1);
  },
});

Deno.test({
  name: "opcode | LD I VX",
  fn() {
    const cpu = new CPU();
    cpu.v[0] = 5;
    cpu.v[1] = 4;
    cpu.v[2] = 3;
    cpu.v[3] = 2;
    cpu.i = 0x300;

    cpu.process(0xF255);
    assertEquals(cpu.mem[cpu.i], 5);
    assertEquals(cpu.mem[cpu.i + 1], 4);
    assertEquals(cpu.mem[cpu.i + 2], 3);
    assertEquals(cpu.mem[cpu.i + 3], 0);
  },
});

Deno.test({
  name: "opcode | LD B VX",
  fn() {
    const cpu = new CPU();
    cpu.i = 0x300;
    cpu.v[2] = 234;

    cpu.process(0xF233);
    assertEquals(cpu.mem[cpu.i], 2);
    assertEquals(cpu.mem[cpu.i + 1], 3);
    assertEquals(cpu.mem[cpu.i + 2], 4);
  },
});

Deno.test({
  name: "opcode | LD VX I",
  fn() {
    const cpu = new CPU();
    cpu.i = 0x300;
    cpu.mem[cpu.i] = 5;
    cpu.mem[cpu.i + 1] = 4;
    cpu.mem[cpu.i + 2] = 3;
    cpu.mem[cpu.i + 3] = 2;

    cpu.process(0xF265);
    assertEquals(cpu.v[0], 5);
    assertEquals(cpu.v[1], 4);
    assertEquals(cpu.v[2], 3);
    assertEquals(cpu.v[3], 0);
  },
});

Deno.test({
  name: "opcode | RET",
  fn() {
    const cpu = new CPU();
    const addr = 0x23;
    cpu.pc = addr;

    cpu.process(0x2ABC); 
    cpu.process(0x00EE);
    
    assertEquals(cpu.pc, 0x25);
    assertEquals(cpu.sp, 0);
  },
});

Deno.test({
  name: "opcode | LD VX NN",
  fn() {
    const cpu = new CPU();

    cpu.process(0x61AA);
    assertEquals(cpu.v[1], 0xAA);
    assertEquals(cpu.pc, 2);

    cpu.process(0x621A);
    assertEquals(cpu.v[2], 0x1A);
    assertEquals(cpu.pc, 4);

    cpu.process(0x6A15);
    assertEquals(cpu.v[10], 0x15);
    assertEquals(cpu.pc, 6);
  },
});

Deno.test({
  name: "opcode | LD I NNN",
  fn() {
    const cpu = new CPU();

    cpu.process(0x61AA);
    assertEquals(cpu.v[1], 0xAA);
    assertEquals(cpu.pc, 2);

    cpu.process(0x621A);
    assertEquals(cpu.v[2], 0x1A);
    assertEquals(cpu.pc, 4);

    cpu.process(0x6A15);
    assertEquals(cpu.v[10], 0x15);
    assertEquals(cpu.pc, 6);
  },
});
