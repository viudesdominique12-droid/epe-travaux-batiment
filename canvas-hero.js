/* ========================================
   Canvas Hero — Paint Particle System
   ======================================== */

class PaintParticle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = Math.random() * 45 + 15;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.25;
    this.opacity = Math.random() * 0.14 + 0.04;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.004;
    this.color = this.pickColor();
    this.blobPoints = this.generateBlobPoints();
    this.phase = Math.random() * Math.PI * 2;
    if (initial) {
      this.targetOpacity = this.opacity;
      this.opacity = 0;
      this.fadeIn = true;
      this.fadeDelay = Math.random() * 2000;
    }
  }

  pickColor() {
    const colors = [
      [46, 90, 110],
      [212, 132, 90],
      [201, 168, 76],
      [58, 122, 148],
      [232, 168, 124],
      [30, 62, 78],
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  generateBlobPoints() {
    const points = [];
    const numPoints = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radius = 0.7 + Math.random() * 0.5;
      points.push({ angle, radius });
    }
    return points;
  }

  drawBlob(ctx) {
    ctx.beginPath();
    for (let i = 0; i <= this.blobPoints.length; i++) {
      const point = this.blobPoints[i % this.blobPoints.length];
      const nextPoint = this.blobPoints[(i + 1) % this.blobPoints.length];
      const r = this.size * point.radius;
      const px = Math.cos(point.angle) * r;
      const py = Math.sin(point.angle) * r;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        const nr = this.size * nextPoint.radius;
        const npx = Math.cos(nextPoint.angle) * nr;
        const npy = Math.sin(nextPoint.angle) * nr;
        const cpx = (px + npx) / 2;
        const cpy = (py + npy) / 2;
        ctx.quadraticCurveTo(px, py, cpx, cpy);
      }
    }
    ctx.closePath();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    const [r, g, b] = this.color;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    this.drawBlob(ctx);
    ctx.fill();

    ctx.restore();
  }

  update(mouseX, mouseY, time) {
    if (this.fadeIn) {
      if (time > this.fadeDelay) {
        this.opacity += 0.002;
        if (this.opacity >= this.targetOpacity) {
          this.opacity = this.targetOpacity;
          this.fadeIn = false;
        }
      }
    }

    this.x += this.speedX + Math.sin(time * 0.0008 + this.phase) * 0.25;
    this.y += this.speedY + Math.cos(time * 0.0006 + this.phase) * 0.2;
    this.rotation += this.rotationSpeed;

    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const force = ((180 - dist) / 180) * 1.2;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }
    }

    const margin = this.size;
    if (this.x < -margin) this.x = this.canvas.width + margin;
    if (this.x > this.canvas.width + margin) this.x = -margin;
    if (this.y < -margin) this.y = this.canvas.height + margin;
    if (this.y > this.canvas.height + margin) this.y = -margin;
  }
}

export function initHeroCanvas() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.classList.add('hero__canvas');
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  let mouseX = null;
  let mouseY = null;
  let particles = [];
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const PARTICLE_COUNT = isMobile ? 25 : 55;

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new PaintParticle(canvas));
    }
  }

  let startTime = null;
  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const time = timestamp - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update(mouseX, mouseY, time);
      p.draw(ctx);
    });
    requestAnimationFrame(animate);
  }

  if (!isMobile) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', () => {
      mouseX = null;
      mouseY = null;
    });
  }

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  requestAnimationFrame(animate);
}
