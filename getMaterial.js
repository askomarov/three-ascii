import * as THREE from "three/webgpu";
import { mx_noise_float, color, cross, dot, float, positionLocal, sign, step, Fn, uniform, varying, vec2, vec3,vec4, Loop, uv, texture, attribute, pow, mix, div, add, floor } from 'three/tsl';
// import portrait from "./artem.jpg?url";
import portrait from "./artem.png?url";

let pallete = [
  '#6923c2',
  '#9160e6',
  '#FF6347',
  '#FFA500',
  '#ffeb23',
];

export default function gerMaterial({
  asciiTexture,
  length
}) {
  let uTexture = new THREE.TextureLoader().load(portrait);

  let material = new THREE.NodeMaterial({
    wireframe: true
  });
  material.side = THREE.DoubleSide;
  const uColor1 = uniform(color(pallete[0]));
  const uColor2 = uniform(color(pallete[1]));
  const uColor3 = uniform(color(pallete[2]));
  const uColor4 = uniform(color(pallete[3]));
  const uColor5 = uniform(color(pallete[4]));

  const asciiCode = Fn(()=>{
    const textureColor = texture(uTexture, attribute('aPixelUV'));
    const brightness = pow(textureColor.r, 2.2).add(attribute('aRandom').mul(0.02));
    const asciiUV = vec2(
      uv().x.div(length).add(floor(brightness.mul(length)).div(length)),
      uv().y
    );
    const asciiCode = texture(asciiTexture, asciiUV);
    let finalColor = uColor1;
    finalColor = mix(finalColor, uColor2, step(0.2, brightness));
    finalColor = mix(finalColor, uColor3, step(0.4, brightness));
    finalColor = mix(finalColor, uColor4, step(0.6, brightness));
    finalColor = mix(finalColor, uColor5, step(0.8, brightness));
    // return vec4(attribute('aPixelUV').x, attribute('aPixelUV').y, 0.0, 0.0);
    // return vec4(1.0, 1.0, 0.0, 0.0);
    // return vec4(finalColor, 1.0);
    return asciiCode.mul(finalColor);
    // return textureColor;
  })

  material.colorNode = asciiCode();

  return material;
}
