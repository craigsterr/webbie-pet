import "../kaplay.js";
import {
  addParticles,
  addTextBubble,
  isDead,
  setIsDead,
  updateMunnyBubbleText,
  petType,
  setMunny,
  setPetType,
  shopItems,
} from "../utils/globalFunctions.js";

const randomMessages = [
  "wah wah wah!!",
  "u listen to da strokes?",
  "*sniff* *sniff* did u shower?",
  "i shure hope craig getshired lol",
  "meow",
  "i love u",
  "heh hehhhhh...",
  "im on my evil grind",
  "im just chillen!",
];

function addRandomMessage() {
  wait(rand(10, 30), () => {
    if (!isDead) {
      const message = randomMessages[randi(0, randomMessages.length - 1)];
      addTextBubble({ message: message });
    }
    addRandomMessage();
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
              message: "u betta wash ya hands b4 u feed me nasty :p",
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
    sprite(petType),
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

  const buttonShop = add([
    pos(width() - 100, 60),
    sprite("button_shop"),
    anchor("center"),
    area(),
    scale(0.7),
    {
      time: 0,
    },
    "button_shop",
  ]);

  updateMunnyBubbleText();

  wait(lastClickTime - 0.5, () => {
    addTextBubble({ message: "heh... ima pet!takea good care of me >:3 " });
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
      addTextBubble({ message: "mannnn..... im hungy...." });
      isStarving = true;
    } else if (foodMeter > 20 && isStarving) {
      isStarving = false;
    }

    if (isDead || (foodMeter <= 0 && !isDead)) {
      shake();
      addTextBubble({ message: "im dead asl 💀" });
      setIsDead(true);
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

      play("bong", {
        volume: 0.3,
      });
    }
  });

  spawnRandomPoop();
  addRandomMessage();

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
            message: "im seriously gonna throw up get that away from mee",
          });
          if (loveMeter > 0) {
            loveMeter--;
          }
        } else if (poopCount > 0) {
          addTextBubble({
            message: "theres like.. poop right there. nasty",
          });
          lastClickTime = time();
        } else {
          addTextBubble({ message: "im rly fullll bro." });
          lastClickTime = time();
        }
      }
    } else {
      if (time() - lastClickTime >= clickCooldown) {
        // addTextBubble({ message: "ya clickt me...wat a nicee click >:3" });
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

  // onKeyPress("a", () => {
  //   petIterator = (petIterator - 1 + petArray.length) % petArray.length;
  //   pet.sprite = petArray[petIterator];
  // });
  // onKeyPress("d", () => {
  //   petIterator = (petIterator + 1) % 3;
  //   pet.sprite = petArray[petIterator];
  // });

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

    play("click", {});

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
    addTextBubble({ message: "why did u do that\n(PRESS R TO RESET)" });
    setIsDead(true);
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
    if (!isDead) {
      go("play");
    }
  });

  onKeyPress("r", () => {
    setMunny(0);
    setIsDead(false);
    setPetType("nublin");
    shopItems.forEach((item) => (item.bought = false));
    // Reset other state here if needed
    go("main");
  });
  onClick("button_shop", () => {
    buttonShop.sprite = "button_shop_pressed";
    play("click");
    wait(0.2, () => {
      buttonShop.sprite = "button_shop";

      if (!isDead) {
        go("shop");
      }
    });
  });
});
