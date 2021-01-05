import { dirname, fromFileUrl, Pane } from "./deps.ts";

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
const pane = new Pane(WIDTH, HEIGHT);

pane.setInnerSize(SIZE);
pane.setMinInnerSize(SIZE);
pane.setMaxInnerSize(SIZE);
pane.setTitle("CRISP-8");

await load(
  Deno.args[0] ?? fromFileUrl(dirname(import.meta.url)) + "/roms/BRIX",
);

const interval = setInterval(() => {
  for (let i = 0; i < 10; i++) {
    cpu.cycle();
  }
  cpu.step();

  for (const event of Pane.Step()) {
    switch (event.type) {
      case "windowEvent":
        switch (event.value.event.type) {
          case "closeRequested":
            clearInterval(interval);
            Deno.exit();
            break;
          case "resized":
            pane.resizeFrame(
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
            event.value.event.value.state === "pressed",
          );
        }
        break;
      case "redrawRequested":
        pane.drawFrame(cpu.disp.toRGBA(...COLOR));
        pane.renderFrame();
        pane.requestRedraw();
        break;
    }
  }
}, CLOCK);
