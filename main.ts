import { EventLoop, Window } from "./deps.ts";

import { CPU, HEIGHT, WIDTH } from "./src/cpu.ts";

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

const cpu = new CPU();
const win = new Window(WIDTH, HEIGHT);

win.setInnerSize(SIZE);
win.setMinInnerSize(SIZE);
win.setMaxInnerSize(SIZE);
win.setTitle("CRISP8");

await load("TETRIS");

const interval = setInterval(() => {
  for (let i = 0; i < 10; i++) {
    cpu.cycle();
  }
  cpu.decrement();

  for (const event of EventLoop.Step()) {
    switch (event.type) {
      case "windowEvent":
        switch (event.value.event.type) {
          case "closeRequested":
            clearInterval(interval);
            Deno.exit();
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
          cpu.keyp.handle(
            event.value.event.value.virtualKeycode!,
            //@ts-ignore
            event.value.event.value.state === "Pressed",
          );
        }
        break;
      case "redrawRequested":
        win.drawFrame(cpu.disp.toRGBA());
        win.renderFrame();
        win.requestRedraw();
        break;
    }
  }
}, 1000 / 60);
