import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gerMaterial from "./getMaterial";

class Sketch {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // Основные параметры
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.controls = this.addOrbitControls();
    this.cube = this.createCube();
    this.clock;

    this.mousePos = new THREE.Vector2(0, 0);
    // Запускаем инициализацию
    this.init();
  }

  createASCIITexture() {
    let dict = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
    this.length = dict.length;
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d')
    // document.body.appendChild(canvas);
    canvas.width = this.length*64;
    canvas.height = 64;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';

    for (let i = 0; i < this.length; i++) {
      ctx.fillText(dict[i], 32 + i*64, 45);
    }

    let asciiTexture = new THREE.Texture(canvas);
    asciiTexture.needsUpdate = true;
    return asciiTexture;
  }

  async init() {
    this.clock = new THREE.Clock();
    // Добавляем объекты на сцену
    this.addObjects();

    // Обработчики событий
    this.addEventListeners();

    // Добавляем освещение
    this.addLight();

    // Запуск анимации
    this.animate();
  }

  // Создание сцены
  createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    return scene;
  }

  // Создание камеры
  createCamera() {
    const fov = 70;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 4);
    return camera;
  }

  // Создание рендера
  createRenderer() {
    const renderer = new THREE.WebGPURenderer();
    renderer.setSize(this.width, this.height);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    if (this.container) {
      this.container.appendChild(renderer.domElement);
    } else {
      console.error(`Элемент с id "${this.containerId}" не найден.`);
    }

    return renderer;
  }

  addLight() {
    const hemiLight = new THREE.HemisphereLight(0x099ff, 0xaa5500);
    this.scene.add(hemiLight);

    // this.scene.fog = new THREE.FogExp2(0x000000, 0.3);
  }

  createCube() {
    const geo = new THREE.BoxGeometry(1, 1, 1);

    this.material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geo, this.material);
    mesh.position.set(0,0,0)
    return mesh;
  }

  // Добавление OrbitControls
  addOrbitControls() {
    return new OrbitControls(this.camera, this.renderer.domElement);
  }

  addObjects() {
    // this.scene.add(this.cube);
    this.material = gerMaterial({
      asciiTexture: this.createASCIITexture(),
      length: this.length,
    });
    let rows = 50;
    let columns = 50;
    let instances = rows * columns;
    let size = 0.1;

    this.geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    this.positions = new Float32Array(instances * 3);
    this.colors = new Float32Array(instances * 3);
    let uv = new Float32Array(instances * 2);
    let random = new Float32Array(instances);
    this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, instances);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        let index = (i * columns) + j;
        uv[index * 2] = i / (rows - 1);
        uv[index * 2 + 1] = j / (columns - 1);
        random[index] = Math.random();
        this.positions[index * 3] = i * size - size*(rows - 1) / 2;
        this.positions[index * 3 + 1] = j * size - size*(columns - 1) / 2;
        this.positions[index * 3+ 2] = 0;
        let m = new THREE.Matrix4();
        m.setPosition(this.positions[index*3], this.positions[index*3 + 1], this.positions[index * 3 + 2]);
        this.instancedMesh.setMatrixAt(index, m);
        index++;
      }
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.geometry.setAttribute('aPixelUV', new THREE.InstancedBufferAttribute(uv, 2));
    this.geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(random, 1));

    this.scene.add(this.instancedMesh);
  }

  // Обработчик изменения размеров окна
  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  onMouseMove(evt) {
    this.mousePos.x = (evt.clientX / this.width) * 2 - 1;
    this.mousePos.y = -(evt.clientY / this.height) * 2 + 1;
  }

  // Добавление обработчиков событий
  addEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this));

    window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
  }

  // Анимация
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    this.cube.rotation.z += delta;
    this.cube.rotation.y += delta;
    this.controls.update();
    this.renderer.renderAsync(this.scene, this.camera);
  }
}

export default Sketch;
