import "../kaplay.js";

export function overshoot(t) {
  const amp = 0.7;
  const freq = 2;
  const decay = 4;

  return 1 + (amp * Math.sin(t * freq * Math.PI * 2)) / Math.exp(t * decay);
}

export function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5);
}
export function addParticles(name, path, x, y) {
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

export function addTextBubble({
  message = "",
  x = center().x,
  y = center().y - 200,
} = {}) {
  if (!isDead) {
    play("beep", {
      volume: 1, // set the volume to 50%
    });

    var newMessage = "";
    const maxCharPerLine = 25;
    var lineStart = 0;

    while (lineStart < message.length) {
      // Find the next cutoff point
      let cutoff = lineStart + maxCharPerLine;
      if (cutoff >= message.length) {
        newMessage += message.substring(lineStart);
        break;
      }
      // Find the last space before cutoff
      let lastSpace = message.lastIndexOf(" ", cutoff);
      if (lastSpace <= lineStart) lastSpace = cutoff; // No space found, hard break
      newMessage += message.substring(lineStart, lastSpace) + "\n";
      lineStart = lastSpace + 1;
    }

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
      text(newMessage, {
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
        bubbleText.destroy();
      }
    });
  }
}

const hexScale = 250;

export const hexPoints = [
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

export function getOffscreenPosition(side = null) {
  const margin = 100;
  const chosenSide = side !== null ? side : randi(0, 4);

  switch (chosenSide) {
    case 0:
      return vec2(rand(0, width()), -margin); // top
    case 1:
      return vec2(rand(0, width()), height() + margin); // bottom
    case 2:
      return vec2(-margin, rand(0, height())); // left
    case 3:
      return vec2(width() + margin, rand(0, height())); // right
  }
}

export function explodeParticles(name, path, x, y) {
  loadSprite(name, path).then((data) => {
    // Fun fact: the data parameter passed from the promise is the same as getSprite().data
    let loadedSpriteData = getSprite(name).data;

    let particleEmitter = add([
      pos(x, y),
      particles(
        {
          max: 20, // the max amount of particles generated from this emitter at one time
          lifeTime: [2, 5], // how long the particles last before being destroyed
          speed: [200, 500], // how fast the particles are moving
          acceleration: [vec2(0), vec2(0, -10)], // changes the speed of the particle over its lifetime
          damping: [0, 0.5], // slows down the particle over its lifetime
          angle: [0, 40], // the rotation of each particle
          angularVelocity: [-20, -20], // how fast each particle should be rotating
          scales: [0.3, 0.2, 0.1], // how large the particle is over its lifetime
          opacities: [1.0, 0.0], // the opacity of the particle over its lifetime
          texture: loadedSpriteData.tex, // texture of the sprite
          quads: loadedSpriteData.frames, // to tell whe emitter what frames of the sprite to use
        },
        {
          shape: new Rect(vec2(0), 32, 32), // the area where particles should be emitted from (can be empty)
          lifetime: 0.5, // how long the emitter should last
          rate: 5, // the rate at which particles are emitted
          direction: -90, // the direction where particles should be traveling
          spread: 360, // variance in the direction where particles should be traveling
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

export let isDead = false;
export function setIsDead(val) {
  isDead = val;
}

export let munny = 0;

export function setMunny(val) {
  munny = val;
}

export function updateMunnyBubbleText() {
  const munnyBubble = add([
    pos(10, 10),
    rect(400, 100, { radius: 8 }),
    outline(4, BLACK),
    scale(0.5),
    opacity(1),
    {
      time: 0,
      scaleTime: 0,
    },
  ]);
  munnyBubble.add([
    pos(10, 10),
    scale(2),
    text(`munny: ${munny}`, {
      size: 26,
      opacity: 1,
    }),
    color(BLACK),
  ]);
}

export const shopItems = [
  { name: "guy", price: 50, sprite: "logo", bought: false },
  { name: "werm", price: 100, sprite: "werm", bought: false },
  { name: "eye", price: 200, sprite: "eye", bought: false },
];

export var petType = "nublin";
export function setPetType(type) {
  petType = type;
}
