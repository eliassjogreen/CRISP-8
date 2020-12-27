import { EventLoop, Window } from "./deps.ts";

import { CPU } from "./src/cpu.ts";
import { HEIGHT, WIDTH } from "./src/io.ts";

function toRGBA(arr: Uint8Array): Uint8Array {
  const rgba = new Uint8Array(arr.length * 4);
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 1) {
      rgba[i * 4] = COLOR[0];
      rgba[i * 4 + 1] = COLOR[1];
      rgba[i * 4 + 2] = COLOR[2];
      rgba[i * 4 + 3] = COLOR[3];
    }
  }
  return rgba;
}

function toKey(key?: string): number | undefined {
  switch(key) {
    case "Key1": case "Numpad1": return 0x1;
    case "Key2": case "Numpad2": return 0x2;
    case "Key3": case "Numpad3": return 0x3;
    case "Key4": case "Numpad4": return 0xC;
    case "Q": return 0x4;
    case "W": return 0x5;
    case "E": return 0x6;
    case "R": return 0xD;
    case "A": return 0x7;
    case "S": return 0x8;
    case "D": return 0x9;
    case "F": return 0xE;
    case "Z": return 0xA;
    case "X": return 0x0;
    case "C": return 0xB;
    case "V": return 0xF;
  }
}

async function load(name: string) {
  const data = await Deno.readFile(`roms/${name}`);
  const rom = new DataView(data.buffer, 0, data.byteLength);
  cpu.reset();
  for (let i = 0; i < rom.byteLength; i++) {
    cpu.mem[0x200 + i] = rom.getUint8(i);
  }
}

const SCALE = 8;
const SIZE = { logical: { width: WIDTH * SCALE, height: HEIGHT * SCALE } };
const COLOR = [255, 255, 255, 255];

const cpu = new CPU();
const win = new Window(WIDTH, HEIGHT);

win.setInnerSize(SIZE);
win.setMinInnerSize(SIZE);
win.setMaxInnerSize(SIZE);
win.setTitle("CRISP8");

await load("BLINKY");

const interval = setInterval(() => {
  for (let i = 0; i < 10; i++) {
    cpu.executeCycle();
  }
  cpu.decrementTimers();

  const disp = toRGBA(cpu.io.disp);

  for (const event of EventLoop.Step()) {
    switch (event.type) {
      case "windowEvent":
        switch (event.value.event.type) {
          case "closeRequested":
            clearInterval(interval);
            break;
          case "resized":
            win.resizeFrame(
              event.value.event.value.width,
              event.value.event.value.height,
            );
            break;
        }
        break;
      case "deviceEvent": 
        if (event.value.event.type === "key") {
          //@ts-ignore
          const down = event.value.event.value.state === "Pressed";
          const key = toKey(event.value.event.value.virtualKeycode);

          // console.log(down);

          if (key) {
            cpu.io.keys.set(key, down);
          }
        }
        break;
      case "redrawRequested":
        win.drawFrame(disp);
        win.renderFrame();
        win.requestRedraw();
        break;
    }
  }
}, 1000 / 60);
