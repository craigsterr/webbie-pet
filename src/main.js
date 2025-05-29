import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the k. prefix

kaplay({
  width: 1280,
  height: 720,
  canvas: document.querySelector("#mycanvas"),
  letterbox: true,
});
loadRoot("./"); // A good idea for Itch.io publishing later
loadSprite("nublin", "/sprites/pets/nublin.png");
loadSprite("werm", "/sprites/pets/werm.png");
loadSprite("eye", "/sprites/pets/eye.png");
loadSprite("bg_day", "/sprites/backgrounds/morning_bg.png");
loadSprite("button_feed", "/sprites/buttons/button_feed.png");
loadSprite("button_feed_pressed", "/sprites/buttons/button_feed_pushed.png");
loadSprite("button_kill", "/sprites/buttons/button_kill.png");
loadSprite("button_kill_pressed", "/sprites/buttons/button_kill_pushed.png");
loadSprite("button_play", "/sprites/buttons/button_play.png");
loadSprite("button_play_pressed", "/sprites/buttons/button_play_pushed.png");
loadSprite("apple", "/sprites/objects/apple.png");
loadSprite("grave", "/sprites/objects/grave.png");
loadSprite("poop", "/sprites/objects/poop.png");
loadSprite("poison", "/sprites/objects/effect_poison.png");
loadSound("beep", "/sounds/beep.mp3");
loadSound("click", "/sounds/click.mp3");
loadSound("eat", "/sounds/eat.mp3");
loadSound("meow", "/sounds/meow.wav");
loadSound("bell", "/sounds/bell.mp3");
loadSound("fart", "/sounds/fart.mp3");

function overshoot(t) {
  const amp = 0.7;
  const freq = 2;
  const decay = 4;

  return 1 + (amp * Math.sin(t * freq * Math.PI * 2)) / Math.exp(t * decay);
}

function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5);
}
function addParticles(name, path, x, y) {
  loadSprite(name, path).then((data) => {
    // Fun fact: the data parameter passed from the promise is the same as getSprite().data
    let loadedSpriteData = getSprite(name).data;

    let particleEmitter = add([
      pos(x, y),
      particles(
        {
          max: 20, // the max amount of particles generated from this emitter at one time
          lifeTime: [2, 5], // how long the particles last before being destroyed
          speed: [50, 200], // how fast the particles are moving
          acceleration: [vec2(0), vec2(0, -10)], // changes the speed of the particle over its lifetime
          damping: [0, 0.5], // slows down the particle over its lifetime
          angle: [0, 40], // the rotation of each particle
          angularVelocity: [-20, -20], // how fast each particle should be rotating
          scales: [0.1], // how large the particle is over its lifetime
          opacities: [1.0, 0.0], // the opacity of the particle over its lifetime
          texture: loadedSpriteData.tex, // texture of the sprite
          quads: loadedSpriteData.frames, // to tell whe emitter what frames of the sprite to use
        },
        {
          shape: new Rect(vec2(0), 32, 32), // the area where particles should be emitted from (can be empty)
          lifetime: 5, // how long the emitter should last
          rate: 5, // the rate at which particles are emitted
          direction: -90, // the direction where particles should be traveling
          spread: 20, // variance in the direction where particles should be traveling
        }
      ),
    ]);

    // .onEnd is called when the emitter's lifetime (in this example 5 seconds), has expired.
    particleEmitter.onEnd(() => {
      destroy(particleEmitter);
    });

    // Emit Particles at runtime
    particleEmitter.emit(5);
  });
}

function addTextBubble({
  message = "",
  x = center().x,
  y = center().y - 200,
} = {}) {
  play("beep", {
    volume: 1, // set the volume to 50%
  });

  const bubble = add([
    anchor("center"),
    pos(x, y),
    rect(400, 100, { radius: 8 }),
    outline(4, BLACK),
    scale(0.1),
    opacity(1),
    {
      time: 0,
      scaleTime: 0,
    },
  ]);

  const bubbleText = bubble.add([
    anchor("center"),
    text(message, {
      size: 26,
      opacity: 1,
    }),
    color(BLACK),
  ]);

  bubble.onUpdate(() => {
    bubble.time += dt();

    bubble.scaleTo(overshoot(bubble.time * 2));

    if (bubble.time > 2) {
      bubble.opacity -= dt();
      bubbleText.opacity -= dt() / 2;
    }
  });
}

scene("main", () => {
  function spawnRandomPoop() {
    if (!isDead) {
      wait(rand(0, 40), () => {
        const poop = add([
          pos(center().x + rand(0, 600), center().y + rand(0, 200)),
          sprite("poop"),
          anchor("center"),
          area(),
          scale(0.5),
          {
            time: 0,
          },
          "poop",
        ]);

        poopCount++;

        poop.onClick(() => {
          var randInt = randi(0, 10);
          if (randInt == 1) {
            addTextBubble({
              message: "u betta wash ya hands\n b4 u feed me nasty :p",
            });
          }

          play("beep");
          addParticles(
            "heal",
            "/sprites/particles/effect_heal.png",
            mousePos().x,
            mousePos().y
          );

          poop.destroy();

          poopCount--;
        });

        // Repeat the poop spawning
        spawnRandomPoop();
      });
    }
  }
  // Constants
  const followVal = 0.1;
  const clickCooldown = 0.5;
  const petArray = ["nublin", "werm", "eye"];

  // Variables
  let lastClickTime = 1;
  let foodMeter = 40;
  let foodLimit = 100;
  let petIterator = 0;
  let appleIsOut = false;
  let hasBeenFed = false;
  let shrinkCountdown = 1;
  let beginShrinkTimer = false;
  let isStarving = false;
  let isDead = false;
  let isIdle = true;
  let poopCount = 0;
  let loveMeter = 0;

  // Objects

  onDraw(() => {
    drawSprite({
      sprite: "bg_day",
      pos: center(),
      anchor: "center",
    });
  });

  const pet = add([
    pos(center()),
    sprite("nublin"),
    anchor("center"),
    area(),
    scale(0.5),
    animate(),
    {
      time: 0,
    },
    "pet",
  ]);

  // Menu button objects

  const buttonFeed = add([
    pos(center().x, center().y + 280),
    sprite("button_feed"),
    anchor("center"),
    area(),
    scale(1),
    {
      time: 0,
    },
    "button_feed",
  ]);

  const buttonKill = add([
    pos(center().x + 250, center().y + 280),
    sprite("button_kill"),
    anchor("center"),
    area(),
    scale(1),
    {
      time: 0,
    },
    "button_kill",
  ]);

  const buttonPlay = add([
    pos(center().x - 250, center().y + 280),
    sprite("button_play"),
    anchor("center"),
    area(),
    scale(1),
    {
      time: 0,
    },
    "button_play",
  ]);

  wait(lastClickTime - 0.5, () => {
    addTextBubble({ message: "heh... ima pet!\ntakea good care of me >:3 " });
  });

  wait(lastClickTime - 0.5, () => {
    addTextBubble({ message: "heh... ima pet!\ntakea good care of me >:3 " });
  });

  pet.onUpdate(() => {
    if (isIdle) {
      pet.pos = pet.pos.lerp(
        vec2(
          center().x + (mousePos().x - center().x) * followVal,
          center().y + (mousePos().y - center().y) * followVal
        ),
        0.04
      );

      pet.time += dt();
      pet.pos.y += Math.sin(pet.time * 4);

      foodMeter -= dt();

      if (hasBeenFed) {
        shrinkCountdown -= dt();
        if (shrinkCountdown <= 0 && foodMeter < foodLimit) {
          shrinkCountdown = 2;
          hasBeenFed = false;
          beginShrinkTimer = true;
        }
      }
    }

    if (beginShrinkTimer && foodMeter < foodLimit) {
      pet.scaleBy(0.99);
      if (pet.scale <= vec2(0.5, 0.5)) beginShrinkTimer = false;
    }

    if (foodMeter < 20 && !isStarving) {
      addTextBubble({ message: "mannnn.....\n im hungy...." });
      isStarving = true;
    } else if (foodMeter > 20 && isStarving) {
      isStarving = false;
    }

    if (isDead || (foodMeter <= 0 && !isDead)) {
      shake();
      addTextBubble({ message: "im dead asl 💀" });
      isDead = true;
      pet.destroy();
      const grave = add([
        pos(center()),
        sprite("grave"),
        anchor("center"),
        area(),
        scale(2),
        animate(),
        {
          time: 0,
        },
        "grave",
      ]);

      play("bell", {
        volume: 0.3,
      });
    }
  });

  spawnRandomPoop();

  pet.onClick(() => {
    if (appleIsOut) {
      if (time() - lastClickTime >= clickCooldown) {
        if (!poopCount && foodMeter < foodLimit) {
          var randInt = randi(0, 10);
          if (randInt == 1) {
            addTextBubble({ message: "yyummerzz >:3" });
          }

          addParticles(
            "heal",
            "/sprites/particles/effect_heal.png",
            mousePos().x,
            mousePos().y
          );

          play("eat", {
            volume: 0.3, // set the volume to 50%
          });

          pet.scaleBy(1.05);

          appleIsOut = false;

          shrinkCountdown = 5;
          hasBeenFed = true;

          if (!isDead) {
            foodMeter += 20;
          }
        } else if (poopCount > 0 && foodMeter >= foodLimit) {
          addParticles(
            "poison",
            "/sprites/particles/effect_poison.png",
            mousePos().x,
            mousePos().y
          );
          addTextBubble({
            message: "im seriously gonna throw up\n get that away from mee",
          });
          if (loveMeter > 0) {
            loveMeter--;
          }
        } else if (poopCount > 0) {
          var randInt = randi(0, 2);
          if (randInt == 1) {
            addTextBubble({
              message: "theres like.. poop\n right there. nasty",
            });
          }
          lastClickTime = time();
        } else {
          var randInt = randi(0, 3);
          if (randInt == 1) {
            addTextBubble({ message: "im fucken fullll bro." });
          }
          lastClickTime = time();
        }
      }
    } else {
      if (time() - lastClickTime >= clickCooldown) {
        // addTextBubble({ message: "ya clickt me...\nwat a nicee click >:3" });
        lastClickTime = time();

        loveMeter++;

        addParticles(
          "heart",
          "/sprites/particles/effect_heart.png",
          mousePos().x,
          mousePos().y
        );

        play("meow", {
          volume: 1, // set the volume to 50%
        });
      }
    }
  });

  onKeyPress("a", () => {
    petIterator = (petIterator - 1 + petArray.length) % petArray.length;
    pet.sprite = petArray[petIterator];
  });
  onKeyPress("d", () => {
    petIterator = (petIterator + 1) % 3;
    pet.sprite = petArray[petIterator];
  });

  // Button event handlers

  onClick("button_feed", () => {
    const apple = add([
      pos(mousePos()),
      sprite("apple"),
      anchor("center"),
      area(),
      scale(0.5),
      {
        time: 0,
      },
      "apple",
    ]);

    buttonFeed.sprite = "button_feed_pressed";

    play("click", {
      volume: 0.3,
    });

    appleIsOut = !appleIsOut;

    onUpdate(() => {
      apple.pos = mousePos();
      if (!appleIsOut) {
        apple.destroy();
        buttonFeed.sprite = "button_feed";
      }
    });
  });

  onMousePress("right", () => {
    appleIsOut = false;
  });

  onClick("button_kill", () => {
    isDead = true;
    buttonKill.sprite = "button_kill_pressed";
    wait(0.2, () => {
      buttonKill.sprite = "button_kill";
    });
  });

  onClick("button_play", () => {
    buttonPlay.sprite = "button_play_pressed";

    wait(0.2, () => {
      buttonPlay.sprite = "button_play";
    });

    go("play");
  });
});

loadSprite("flame", "/sprites/particles/effect_flame.png");
loadSprite("enemy", "/sprites/objects/enemy.png");
loadSprite("enemy2", "/sprites/objects/enemy2.png");
loadSound("bullet", "/sounds/bullet.wav");
loadSound("reload", "/sounds/reload.mp3");
loadSprite("bg_night", "/sprites/backgrounds/night_bg.png");

const hexScale = 250;

const hexPoints = [
  vec2(Math.cos(0), Math.sin(0)).scale(hexScale),
  vec2(Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)).scale(hexScale),
  vec2(Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3)).scale(
    hexScale
  ),
  vec2(Math.cos(Math.PI), Math.sin(Math.PI)).scale(hexScale),
  vec2(Math.cos((4 * Math.PI) / 3), Math.sin((4 * Math.PI) / 3)).scale(
    hexScale
  ),
  vec2(Math.cos((5 * Math.PI) / 3), Math.sin((5 * Math.PI) / 3)).scale(
    hexScale
  ),
];

function getOffscreenPosition() {
  const margin = 100; // how far offscreen to spawn
  const side = randi(0, 4); // 0=top, 1=bottom, 2=left, 3=right

  switch (side) {
    case 0:
      return vec2(rand(0, width()), -margin);
    case 1:
      return vec2(rand(0, width()), height() + margin);
    case 2:
      return vec2(-margin, rand(0, height()));
    case 3:
      return vec2(width() + margin, rand(0, height()));
  }
}

scene("play", () => {
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
      scale(0.3),
      rotate(0),

      animate(),
      {
        time: 0,
        prevPos: center().clone(),
      },
      "enemy",
    ]);

    onUpdate(() => {
      enemy.pos = enemy.pos.lerp(pet.pos, 0.01);
    });

    wait(rand(0, 5), () => {
      spawnEnemy();
    });
  }
  function spawnEnemy2() {
    const pos2 = getOffscreenPosition();

    const petTarget = pet.pos.clone();
    const direction = petTarget.sub(pos2).unit().scale(400);

    const enemy2 = add([
      pos(pos2),
      sprite("enemy2"),
      anchor("center"),
      area({ shape: new Polygon(hexPoints) }),
      scale(0.3),
      rotate(0),

      animate(),
      {
        time: 0,
        velocity: direction, // Save velocity
      },
      "enemy",
    ]);

    onUpdate(() => {
      enemy2.move(enemy2.velocity);
    });

    wait(rand(0, 5), () => {
      spawnEnemy2();
    });
  }

  var ammoCount = 10;
  var reloadCountdown = 1.5;
  var isReloading = false;
  var reloadPosition;
  var playerLives = 3;
  var isAlive = true;

  const pet = add([
    pos(center()),
    sprite("nublin"),
    anchor("center"),
    area(),
    scale(0.3),
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

  onUpdate(() => {
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
        reloadCountdown = 1.5;
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

  onCollide("pet", "enemy", () => {
    shake();
    playerLives--;
    if (playerLives <= 0) {
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

  onCollide("enemy", "flame", (f, e) => {
    f.destroy();
    e.destroy();
    shake();
  });
});

go("main");
