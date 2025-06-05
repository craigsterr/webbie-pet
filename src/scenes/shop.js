import "../kaplay.js";
import {
  munny,
  setMunny,
  updateMunnyBubbleText,
  addTextBubble,
  shopItems,
  setPetType,
} from "../utils/globalFunctions.js";

scene("shop", () => {
  onDraw(() => {
    drawSprite({
      sprite: "bg_day",
      pos: center(),
      anchor: "center",
    });
  });

  const wizard = add([
    pos(center()),
    sprite("wizard"),
    anchor("center"),
    area(),
    scale(0.5),
    animate(),
    "wizard",
  ]);

  var itemsExist = false;

  shopItems.forEach((item, index) => {
    if (!item.bought) {
      itemsExist = true;
      const rectWidth = 200;
      const rectHeight = 50;

      var buttonColor = item.price <= munny ? YELLOW : RED;

      const bubble = add([
        color(buttonColor),
        anchor("center"),
        pos(rectWidth / 2 + 10, height() - index * 60 - rectHeight / 2 - 10),
        rect(rectWidth, rectHeight, { radius: 8 }),
        outline(4, BLACK),
        scale(1),
        opacity(1),
        area(),
        item,
        {
          time: 0,
          scaleTime: 0,
        },
        "shopItem",
      ]);

      bubble.add([
        anchor("center"),
        color(BLACK),
        text(`${item.name} - $${item.price}`, { size: 24 }),
        layer("ui"),
        area(),
      ]);

      add([
        anchor("center"),
        color(BLACK),
        text("add munny +10"),
        layer("ui"),
        area(),
        item,
        "addMunny",
      ]);
    }

    if (!itemsExist) {
      addTextBubble({ message: "my items are gone youve ruined me" });
    } else {
      addTextBubble({ message: "welcome to my shop!" });
    }
  });

  onClick("shopItem", (item) => {
    if (munny >= item.price) {
      setMunny(munny - item.price);
      addTextBubble({ message: `here's your ${item.name}!` });
      play("buy", { volume: 0.3 });
      updateMunnyBubbleText();
      item.destroy();
      item.bought = true;
      setPetType(item.name);
    } else {
      const randInt = randi(0, 10);

      switch (randInt) {
        case 0:
          addTextBubble({
            // message: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            message: "come back when you're a little... ermmmm. richerrrr!",
          });
          break;
        case 1:
          addTextBubble({ message: "you dont have enough munny!" });
          break;
        case 2:
          addTextBubble({ message: "get lost brokie..." });
          break;
      }
      play("hurt");
    }
  });

  onClick("addMunny", (item) => {
    setMunny(munny + 10);
    addTextBubble({ message: `You added 10 munny!` });
    play("click");
    updateMunnyBubbleText();
  });

  const buttonShop = add([
    pos(width() - 100, 60),
    sprite("button_exit"),
    anchor("center"),
    area(),
    scale(0.7),
    {
      time: 0,
    },
    "button_exit",
  ]);

  onClick("button_exit", () => {
    play("click");
    buttonShop.sprite = "button_exit_pushed";

    wait(0.2, () => {
      buttonShop.sprite = "button_exit";
      go("main");
    });
  });

  updateMunnyBubbleText();
});
