/**
 * Main entry — Countries Marble Race
 * Game 2D HTML5 với Phaser 3
 */
import Phaser from "phaser";
import { registerSW, setupInstallPrompt } from "./pwa-setup";
import BootScene from "@/scenes/BootScene";
import MenuScene from "@/scenes/MenuScene";
import SelectScene from "@/scenes/SelectScene";
import RaceScene from "@/scenes/RaceScene";
import ResultScene from "@/scenes/ResultScene";
import TournamentScene from "@/scenes/TournamentScene";
import ProgressionScene from "@/scenes/ProgressionScene";
import ReplayScene from "@/scenes/ReplayScene";

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 1280,
  height: 720,
  backgroundColor: "#0f172a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 1.5 },
      debug: false,
      enableSleeping: true,
    },
  },
  scene: [BootScene, MenuScene, SelectScene, RaceScene, ResultScene, TournamentScene, ProgressionScene, ReplayScene],
  input: {
    keyboard: true,
    touch: true,
    mouse: true,
  },
  render: {
    pixelArt: false,
    antialias: true,
    transparent: false,
  },
  audio: {
    disableWebAudio: false,
  },
};

// Khởi tạo game
const game = new Phaser.Game(config);

// PWA
registerSW();
setupInstallPrompt();

// SoundManager được khởi tạo trong BootScene.create()
// và lưu vào game.registry để các scene khác dùng chung

// Update loading bar
game.events.on("progress", (value: number) => {
  const fill = document.getElementById("loading-bar-fill");
  if (fill) fill.style.width = `${value * 100}%`;
});

game.events.on("ready", () => {
  const loading = document.getElementById("loading");
  const text = document.getElementById("loading-text");
  if (text) text.textContent = "Sẵn sàng!";
  setTimeout(() => {
    if (loading) loading.classList.add("hide");
  }, 500);
});

// Handle resize
window.addEventListener("resize", () => {
  game.scale.refresh();
});

// Prevent context menu on long press
document.addEventListener("contextmenu", (e) => e.preventDefault());

export default game;
