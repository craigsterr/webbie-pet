import "../kaplay.js";
import {
  addParticles,
  addTextBubble,
  munny,
  setMunny,
  updateMunnyBubbleText,
} from "../utils/globalFunctions.js";

scene("play", () => {
  const music = play("night_song", { volume: 0.15 });
  onDraw(() => {
    drawSprite({
      sprite: "bg_day",
      pos: center(),
      anchor: "center",
    });
  });

  var difficulty = 0;
  var playerLives = 3;

  function spawnApple() {
    const apple = add([
      pos(rand(0, width()), -30),
      sprite("apple"),
      anchor("center"),
      area(),
      scale(0.2),
      move(DOWN, 200),
      "apple",
    ]);

    wait(rand(0, 3 - difficulty), spawnApple);
  }

  const pet = add([
    pos(center().x, height() - 100),
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

  onUpdate(() => {
    const target = mousePos();
    const directionX = target.x - pet.pos.x;
    const stopDist = 0;

    const adjustedTargetX =
      target.x -
      Math.sign(directionX) * Math.min(Math.abs(directionX), stopDist);

    pet.pos.x = pet.pos.x + (adjustedTargetX - pet.pos.x) * 0.1;

    pet.angle = directionX / 20;

    pet.prevPos = pet.pos.clone();
  });

  var healthArray = [];

  function updateHealthBar() {
    for (const h of healthArray) {
      h.destroy();
    }
    healthArray = [];

    for (var i = 0; i < playerLives; i++) {
      const health = add([
        pos(width() - 100 - i * 70, 20),
        sprite("heart"),
        scale(0.2),
        opacity(1),
      ]);

      healthArray[i] = health;
    }
  }
  var score = 0;
  var scorePos = vec2(240, 10);
  var scoreBubbleText;
  var munnyEarned = 0;

  onCollide("apple", "pet", (a, p) => {
    a.destroy();

    score += 10;

    play("eat");

    addParticles("hit", "/sprites/particles/effect_heal.png", a.pos.x, a.pos.y);
    shake();

    if (scoreBubbleText) {
      scoreBubbleText.destroy();
    }
    scoreBubbleText = scoreBubble.add([
      pos(10, 10),
      scale(2),
      text(`score: ${score}`, {
        size: 26,
        opacity: 1,
      }),
      color(BLACK),
    ]);

    if (score % 100 === 0) {
      wait(0.5, () => {
        play("bell");
        setMunny(munny + 5);
        updateMunnyBubbleText();
        munnyEarned += 5;
      });
    }
  });

  onUpdate("apple", (a) => {
    if (a.pos.y > height() + 30) {
      a.destroy();

      playerLives -= 1;
      updateHealthBar();

      // Optional: play a sound or shake
      play("hurt");
      shake();

      // Optional: end game if out of lives
      if (playerLives <= 0) {
        pet.destroy();
        music.stop();
        const deathBubble = add([
          anchor("center"),
          pos(center()),
          rect(700, 300, { radius: 8 }),
          outline(4, BLACK),
          scale(0.5),
          opacity(1),
          {
            time: 0,
            scaleTime: 0,
          },
        ]);

        const deathBubbleText = deathBubble.add([
          anchor("center"),
          scale(2),
          text(`game over\nur score: ${score}\nmunny earned: ${munnyEarned}`, {
            size: 26,
            opacity: 1,
          }),
          color(BLACK),
        ]);

        wait(2, () => {
          go("main"); // or any other scene you want to go to
        });
      }
    }
  });

  onUpdate(() => {
    difficulty += dt() * 0.04;
    difficulty = Math.min(difficulty, 2.5);
  });

  // Score bubble
  const scoreBubble = add([
    pos(scorePos),
    rect(400, 100, { radius: 8 }),
    outline(4, BLACK),
    scale(0.5),
    opacity(1),
    {
      time: 0,
      scaleTime: 0,
    },
  ]);

  scoreBubbleText = scoreBubble.add([
    pos(10, 10),
    scale(2),
    text(`Score: ${score}`, {
      size: 26,
      opacity: 1,
    }),
    color(BLACK),
  ]);

  updateHealthBar();
  spawnApple();
  updateMunnyBubbleText();

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
