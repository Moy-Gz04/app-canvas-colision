// Obtener el elemento <canvas> y su contexto de dibujo 2D
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Definir el tamaño del canvas
const window_height = 400;
const window_width = 850;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#111"; 

// Lista para almacenar los círculos y partículas
let circles = [];
let particles = [];

// Función para reproducir sonido sin que se solapen las colisiones
function playCollisionSound() {
  const sound = new Audio("js/mouse-click-153941.mp3");
  sound.volume = 0.5;
  sound.play();
}

// Clase para los círculos animados
class Circle {
  constructor(x, y, radius, color, text, speedX, speedY) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.color = color;
    this.text = text;
    this.dx = speedX;
    this.dy = speedY;
  }

  draw(context) {
    context.beginPath();
    context.shadowColor = this.color;
    context.shadowBlur = 15; 
    context.fillStyle = this.color;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.fill();
    context.shadowBlur = 0;
    context.strokeStyle = "white";
    context.lineWidth = 3;
    context.stroke();
    context.closePath();
    
    // Dibujar número en el círculo
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 20px 'Poppins', sans-serif";
    context.fillText(this.text, this.posX, this.posY);
  }

  update(context) {
    this.draw(context);
    if (this.posX + this.radius >= window_width || this.posX - this.radius <= 0) {
      this.dx = -this.dx;
    }
    if (this.posY + this.radius >= window_height || this.posY - this.radius <= 0) {
      this.dy = -this.dy;
    }
    this.posX += this.dx;
    this.posY += this.dy;
  }
}

// Clase para efecto de partículas
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.alpha = 1;
  }

  draw(context) {
    context.globalAlpha = this.alpha;
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, 3, 0, Math.PI * 2);
    context.fill();
    context.closePath();
    context.globalAlpha = 1;
  }

  update() {
    this.alpha -= 0.02;
  }
}

// Función para generar partículas en colisión
function createParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// Función para evitar la generación de círculos superpuestos
function isOverlapping(newCircle) {
  return circles.some(circle => {
    let dx = newCircle.posX - circle.posX;
    let dy = newCircle.posY - circle.posY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    return distance < newCircle.radius + circle.radius + 5;
  });
}

// Mejor manejo de colisiones para evitar que los círculos se "peguen"
function separateCircles(circle1, circle2) {
  let dx = circle2.posX - circle1.posX;
  let dy = circle2.posY - circle1.posY;
  let distance = Math.sqrt(dx * dx + dy * dy);
  let overlap = circle1.radius + circle2.radius - distance;
  
  if (overlap > 0) {
    let adjustX = (dx / distance) * (overlap / 2);
    let adjustY = (dy / distance) * (overlap / 2);
    circle1.posX -= adjustX;
    circle1.posY -= adjustY;
    circle2.posX += adjustX;
    circle2.posY += adjustY;
  }
}

// Función para manejar colisión con efectos visuales
function handleCollision(circle1, circle2) {
  playCollisionSound();
  createParticles(circle1.posX, circle1.posY, circle1.color);
  createParticles(circle2.posX, circle2.posY, circle2.color);
  
  circle1.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
  circle2.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
  
  let tempDX = circle1.dx;
  let tempDY = circle1.dy;
  circle1.dx = circle2.dx;
  circle1.dy = circle2.dy;
  circle2.dx = tempDX;
  circle2.dy = tempDY;

  separateCircles(circle1, circle2);
}

// Función de animación
function updateCircles() {
  requestAnimationFrame(updateCircles);
  ctx.clearRect(0, 0, window_width, window_height);
  
  // Dibujar círculos
  circles.forEach((circle, index) => {
    circle.update(ctx);
    for (let j = index + 1; j < circles.length; j++) {
      if (Math.hypot(circle.posX - circles[j].posX, circle.posY - circles[j].posY) < circle.radius + circles[j].radius) {
        handleCollision(circle, circles[j]);
      }
    }
  });

  // Dibujar partículas
  particles.forEach((particle, index) => {
    if (particle.alpha > 0) {
      particle.update();
      particle.draw(ctx);
    } else {
      particles.splice(index, 1);
    }
  });
}

// Función para generar círculos aleatorios con prevención de superposición
function generateCircles(n, speed) {
  circles = [];
  for (let i = 0; i < n; i++) {
    let radius = Math.floor(Math.random() * 40) + 20;
    let x, y;
    let attempts = 0;
    do {
      x = Math.random() * (window_width - 2 * radius) + radius;
      y = Math.random() * (window_height - 2 * radius) + radius;
      attempts++;
      if (attempts > 100) break; // Evita bucles infinitos
    } while (isOverlapping(new Circle(x, y, radius, "", "", 0, 0)));
    
    let color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    let speedX = (Math.random() - 0.5) * speed;
    let speedY = (Math.random() - 0.5) * speed;
    circles.push(new Circle(x, y, radius, color, (i + 1).toString(), speedX, speedY));
  }
  updateCircles();
}

// Obtener elementos UI
document.getElementById("startButton").addEventListener("click", () => {
  let n = parseInt(document.getElementById("circleCount").value);
  let speed = parseFloat(document.getElementById("circleSpeed").value);
  if (n > 0 && speed > 0) {
    generateCircles(n, speed);
  }
});
