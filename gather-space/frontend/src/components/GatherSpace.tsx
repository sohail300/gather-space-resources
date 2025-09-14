import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const GatherSpace: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createMainScene = (): Phaser.Scene => {
      return class MainScene extends Phaser.Scene {
        private player!: Phaser.Physics.Arcade.Sprite;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private playerName!: Phaser.GameObjects.Text;

        constructor() {
          super({ key: "MainScene" });
        }

        preload() {
          this.load.tilemapTiledJSON("map", "assets/mapv1.json");
          this.load.image("sky", "assets/sky.png");
          this.load.image("tiles1", "assets/tiles1.png");
          this.load.image("tiles2", "assets/tiles2.png");

          this.load.spritesheet("character", "assets/character.png", {
            frameWidth: 16, // Adjust this to match your sprite width
            frameHeight: 16,
          });
        }

        create() {
          const map = this.make.tilemap({ key: "map" });
          console.log(map);

          const tileset1 = map.addTilesetImage("tiles1", "tiles1");
          const tileset2 = map.addTilesetImage("tiles2", "tiles2");

          // Create layers with the loaded tilesets
          const layerNames = [
            "Grass, Pond",
            "Trees",
            "windows",
            "floor",
            "Boundary",
            "tables",
            "stairs",
            "upper trees",
          ];

          layerNames.forEach((layerName) => {
            map.createLayer(layerName, [tileset1, tileset2], 0, 0);
          });

          // Player
          this.player = this.physics.add.sprite(560, 760, "character");
          this.player.setBounce(0.2);
          this.player.setCollideWorldBounds(true);

          // Add player name above character
          this.playerName = this.add.text(0, 0, "Player 1", {
            fontSize: "14px",
            backgroundColor: "#00000080",
            padding: { x: 3, y: 1 },
            color: "#ffffff",
          });

          // Animations
          this.anims.create({
            key: "walk-down",
            frames: this.anims.generateFrameNumbers("character", {
              start: 0,
              end: 7,
            }),
            frameRate: 8,
            repeat: -1,
          });

          this.anims.create({
            key: "walk-up",
            frames: this.anims.generateFrameNumbers("character", {
              start: 8,
              end: 15,
            }),
            frameRate: 8,
            repeat: -1,
          });

          this.anims.create({
            key: "walk-left",
            frames: this.anims.generateFrameNumbers("character", {
              start: 24,
              end: 31,
            }),
            frameRate: 8,
            repeat: -1,
          });

          this.anims.create({
            key: "walk-right",
            frames: this.anims.generateFrameNumbers("character", {
              start: 16,
              end: 23,
            }),
            frameRate: 8,
            repeat: -1,
          });

          // Set up idle frames
          this.anims.create({
            key: "idle-down",
            frames: [{ key: "character", frame: 0 }],
            frameRate: 1,
          });

          this.anims.create({
            key: "idle-up",
            frames: [{ key: "character", frame: 8 }],
            frameRate: 1,
          });

          this.anims.create({
            key: "idle-left",
            frames: [{ key: "character", frame: 24 }],
            frameRate: 1,
          });

          this.anims.create({
            key: "idle-right",
            frames: [{ key: "character", frame: 16 }],
            frameRate: 1,
          });

          // Input
          this.cursors = this.input.keyboard.createCursorKeys();

          // Set up camera to follow player
          this.cameras.main.startFollow(this.player);
          this.cameras.main.setZoom(1.25); // Adjust zoom level as needed
        }

        update() {
          const speed = 175;
          let velocityX = 0;
          let velocityY = 0;
          let animation = "idle-down";

          // Handle movement
          if (this.cursors.left.isDown) {
            velocityX = -speed;
            animation = "walk-left";
          } else if (this.cursors.right.isDown) {
            velocityX = speed;
            animation = "walk-right";
          }

          if (this.cursors.up.isDown) {
            velocityY = -speed;
            animation = velocityX === 0 ? "walk-up" : animation;
          } else if (this.cursors.down.isDown) {
            velocityY = speed;
            animation = velocityX === 0 ? "walk-down" : animation;
          }

          // Apply movement
          this.player.setVelocity(velocityX, velocityY);

          // Normalize diagonal movement
          if (velocityX !== 0 && velocityY !== 0) {
            const normalizedVelocity = new Phaser.Math.Vector2(
              velocityX,
              velocityY
            )
              .normalize()
              .scale(speed);
            this.player.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
          }

          // Play appropriate animation
          if (velocityX === 0 && velocityY === 0) {
            // If not moving, play idle animation based on last direction
            const currentAnim = this.player.anims.currentAnim;
            if (currentAnim) {
              const direction = currentAnim.key.split("-")[1];
              this.player.play(`idle-${direction}`, true);
            }
          } else {
            this.player.play(animation, true);
          }

          // Update player name position
          this.playerName.setPosition(
            this.player.x - this.playerName.width / 2,
            this.player.y - this.player.height / 2 - 20
          );
        }
      };
    };

    // Phaser configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 960,
      height: 1056,
      parent: parentEl.current!,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: createMainScene(),
    };

    // Create game instance
    gameRef.current = new Phaser.Game(config);

    // Cleanup
    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <div
      ref={parentEl}
      style={{
        width: "100%",
        height: "100%",
        margin: "0 auto",
        padding: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
};

export default GatherSpace;
