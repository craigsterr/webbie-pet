import "../kaplay.js";
import {
  getOffscreenPosition,
  explodeParticles,
  addTextBubble,
  hexPoints,
} from "../utils/globalFunctions.js";

scene("play", () => {
  const music = play("night_song", { volume: 0.15 });
  onDraw(() => {
    drawSprite({
      sprite: "bg_night",
      pos: center(),
      anchor: "center",
    });
  });

  function spawnEnemy() {
    const pos1 = getOffscreenPosition();
    const enemy = add([
      pos(pos1),
      sprite("enemy"),
      anchor("center"),
      area({ shape: new Polygon(hexPoints) }),
      scale(0.2),
      rotate(0),

      animate(),
      {
        time: 0,
        prevPos: center().clone(),
      },
      "enemy",
      "destructable",
    ]);

    onUpdate(() => {
      enemy.pos = enemy.pos.lerp(pet.pos, difficulty / 8000);
    });

    wait(rand(0, 4 - difficulty / 100), () => {
      spawnEnemy();
    });
  }
  function spawnEnemy2() {
    const pos2 = getOffscreenPosition();

    const petTarget = pet.pos.clone();
    const direction = petTarget
      .sub(pos2)
      .unit()
      .scale(difficulty * 5);

    const enemy2 = add([
      pos(pos2),
      sprite("enemy2"),
      anchor("center"),
      area({ shape: new Polygon(hexPoints) }),
      scale(0.2),
      rotate(0),

      animate(),
      {
        time: 0,
        velocity: direction, // Save velocity
      },
      "enemy",
      "destructable",
    ]);

    onUpdate(() => {
      enemy2.move(enemy2.velocity);
    });

    debug.log(4 - difficulty / 100);

    wait(rand(0, 4 - difficulty / 100), () => {
      spawnEnemy2();
    });
  }

  function spawnEnemyProjectile() {
    const side1 = randi(0, 4);
    let side2 = randi(0, 4);
    while (side2 === side1) {
      side2 = randi(0, 4);
    }

    const pos1 = getOffscreenPosition(side1);
    const pos2 = getOffscreenPosition(side2);

    play("warning", { volume: 0.2 });
    const predictor = add([
      opacity(0.5),
      {
        time: 0,
        blinkCount: 0,
        visible: true,
        draw() {
          if (this.visible) {
            drawLine({
              p1: pos1,
              p2: pos2,
              width: 70,
              color: rgb(255, 255, 255),
            });
          }
        },
        update() {
          this.time += dt();

          // Blink every 0.3 seconds
          if (this.time >= 0.1) {
            this.visible = !this.visible; // toggle visibility
            this.time = 0;

            if (!this.visible) {
              this.blinkCount++;
            }

            // After blinking twice (two off states), destroy predictor
            if (this.blinkCount >= 4) {
              destroy(this);
            }
          }
        },
      },
    ]);

    // const pos2 = getOffscreenPosition();

    // const petTarget = pet.pos.clone();
    // const direction = petTarget
    //   .sub(pos2)
    //   .unit()
    //   .scale(difficulty * 5);

    const dir = pos2.sub(pos1).unit(); // Ensure dir has length 1
    const speed = 2000; // units per second
    const velocity = dir.scale(speed);

    // 2. Add projectile with manual movement
    wait(0.5, () => {
      const enemyProjectile = add([
        pos(pos1),
        sprite("sword"),
        anchor("center"),
        area({ shape: new Polygon(hexPoints) }),
        scale(0.05),
        rotate(),
        {
          update() {
            this.move(velocity);
            this.angle += dt() * 1000;
          },
        },
        "enemy",
      ]);
    });

    // debug.log(4 - difficulty / 100);

    wait(rand(0, 4 - difficulty / 100), () => {
      spawnEnemyProjectile();
    });
  }
  var difficulty = 0;
  var ammoCount = 10;
  var reloadCountdown = 0.9;
  var isReloading = false;
  var reloadPosition;
  var playerLives = 3;
  var isAlive = true;

  const pet = add([
    pos(center()),
    sprite("nublin"),
    anchor("center"),
    area(),
    scale(0.2),
    rotate(0), // Enable rotation
    animate(),
    {
      time: 0,
      prevPos: center().clone(),
    },
    "pet",
  ]);

  spawnEnemy();
  spawnEnemy2();
  spawnEnemyProjectile();

  onUpdate(() => {
    difficulty += dt();
    if (!isReloading) {
      const target = mousePos();
      const direction = target.sub(pet.pos).unit();
      const stopDist = 100;
      const adjustedTarget = target.sub(direction.scale(stopDist));

      pet.pos = pet.pos.lerp(adjustedTarget, 0.1);

      const angle = Math.atan2(direction.y, direction.x);
      pet.angle = rad2deg(angle);

      pet.prevPos = pet.pos.clone();
    } else {
      pet.pos = pet.pos.lerp(reloadPosition, 0.1);
    }
  });

  if (isAlive) {
    onClick(() => {
      if (ammoCount > 0 && !isReloading) {
        play("bullet", { volume: 0.2 });
        const flame = add([
          pos(pet.pos),
          sprite("flame"),
          anchor("center"),
          area(),
          scale(0.3),
          rotate(0),
          move(pet.angle, 1200),
          "flame",
        ]);

        wait(3, () => {
          flame.destroy();
        });

        ammoCount--;
      }
    });
  }

  pet.onUpdate(() => {
    if (isReloading) {
      reloadCountdown -= dt();
      if (reloadCountdown <= 0) {
        isReloading = false;
        reloadCountdown = 0.9;
        ammoCount = 10;
      }
    }
  });

  onKeyPress("r", () => {
    if (!isReloading) {
      reloadPosition = mousePos();
      isReloading = true;
      play("reload");
    }
  });

  var comboCountdown = 0.2;
  var comboCount = 0;

  onCollide("pet", "enemy", () => {
    play("hurt");
    shake();
    playerLives--;
    if (playerLives <= 0) {
      music.paused = true;
      addTextBubble({
        message: "u dun killt me 💀",
        x: pet.pos.x,
        y: pet.pos.y,
      });
      pet.destroy();
      isAlive = false;
    } else {
      addTextBubble({ message: "yowch!", x: pet.pos.x, y: pet.pos.y });
    }
  });

  onCollide("destructable", "flame", (f, e) => {
    f.destroy();
    e.destroy();
    play("punch", { volume: 0.2 });
    wait(0.4, () => {
      play("bell", { volume: 0.4 });
    });

    explodeParticles(
      "hit",
      "/sprites/particles/effect_hit.png",
      f.pos.x,
      f.pos.y
    );
    shake();

    comboCount++;
    comboCountdown = 0.5;

    switch (comboCount) {
      case 1:
        debug.log("play1");
        play("combo1");
        break;
      case 2:
        debug.log("play2");
        play("combo2");

        break;
      case 3:
        debug.log("play3");
        play("combo3");
        break;
      case 4:
        debug.log("play4");
        play("combo4");
        break;
      case 5:
        debug.log("play5");
        play("combo5");
        break;
    }
  });

  onUpdate(() => {
    if (comboCount > 0) {
      comboCountdown -= dt();
      if (comboCountdown <= 0) {
        comboCount = 0;
        comboCountdown = 0.5;
      }
    }
  });

  // FOR DEBUGGING
  onKeyPress("p", () => {
    music.stop();
    go("play");
  });

  onKeyPress("escape", () => {
    music.stop("night_song");
    go("main");
  });
});
