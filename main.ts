import { dirname, EventLoop, fromFileUrl, Window } from "./deps.ts";

import { CPU, HEIGHT, WIDTH } from "./src/cpu.ts";

async function load(path: string) {
  const data = await Deno.readFile(path);

  const rom = new DataView(data.buffer, 0, data.byteLength);
  cpu.reset();
  for (let i = 0; i < rom.byteLength; i++) {
    cpu.mem[0x200 + i] = rom.getUint8(i);
  }
}

const CLOCK = 1000 / 60;            // 60Hz
const SCALE = 8;                    // Scale 8x
const COLOR = [255, 255, 255, 255]; // White
const SIZE = { logical: { width: WIDTH * SCALE, height: HEIGHT * SCALE } };

const cpu = new CPU();
const win = new Window(WIDTH, HEIGHT);

win.setInnerSize(SIZE);
win.setMinInnerSize(SIZE);
win.setMaxInnerSize(SIZE);
win.setTitle("CRISP8");

await load(
  Deno.args[0] ?? fromFileUrl(dirname(import.meta.url)) + "/roms/BRIX",
);

const interval = setInterval(() => {
  for (let i = 0; i < 10; i++) {
    cpu.cycle();
  }
  cpu.step();

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
        win.drawFrame(cpu.disp.toRGBA(...COLOR));
        win.renderFrame();
        win.requestRedraw();
        break;
    }
  }
}, CLOCK);
