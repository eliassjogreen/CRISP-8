export class Keypad {
  keys = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  handle(key: string, state: boolean) {
    let k = undefined;

    switch (key) {
      case "Key1":
        k = 0x1;
        break;
      case "Key2":
        k = 0x2;
        break;
      case "Key3":
        k = 0x3;
        break;
      case "Key4":
        k = 0xC;
        break;
      case "Q":
        k = 0x4;
        break;
      case "W":
        k = 0x5;
        break;
      case "E":
        k = 0x6;
        break;
      case "R":
        k = 0xD;
        break;
      case "A":
        k = 0x7;
        break;
      case "S":
        k = 0x8;
        break;
      case "D":
        k = 0x9;
        break;
      case "F":
        k = 0xE;
        break;
      case "Z":
        k = 0xA;
        break;
      case "X":
        k = 0x0;
        break;
      case "C":
        k = 0xB;
        break;
      case "V":
        k = 0xF;
        break;
    }

    if (k !== undefined) {
      this.keys[k] = state;
    }
  }
}
