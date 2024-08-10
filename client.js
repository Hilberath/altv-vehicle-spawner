import * as alt from "alt";
import * as native from "natives";

let loaded = false;
let opened = false;

//#########################################################
//Verlinkung zu der HTML Index Datei
//#########################################################
const view = new alt.WebView("http://resource/html/index.html");

function menu(toggle) {
  opened = toggle;

  alt.showCursor(toggle);
  alt.toggleGameControls(!toggle);

  if (toggle) {
    view.focus();
  } else {
    view.unfocus();
  }

  view.emit("menu", toggle);
}

function promisify(callback) {
  return new Promise((resolve, reject) => {
    let loader = alt.setInterval(() => {
      if (callback() == true) {
        resolve(true);
        alt.clearInterval(loader);
      }
    }, 80);
  });
}

view.on("ready", () => {
  loaded = true;
});

view.on("menu", (toggle) => {
  menu(toggle);
});

view.on("select", (model) => {
  alt.emitServer("playerSpawnVehicle", model);
  menu(false);
});

//#########################################################
//Tastenbelgung für das Öffnen und Schließen das Menüs
//#########################################################
alt.on("keyup", (key) => {
  if (!loaded) return;

  if (key === 0x69) {
    // Numpad 9 Taste
    menu(!opened);
  } else if (opened && key === 0x1b) {
    // Escape-Taste
    menu(false);
  }
});

alt.onServer("setPedIntoVehicle", async (vehicle) => {
  const player = alt.Player.local;
  await promisify(() => {
    if (player.vehicle) return true;
    native.setPedIntoVehicle(player.scriptID, vehicle.scriptID, -1);
  });
});

alt.log("[HVS] Client-Side Loaded.");
