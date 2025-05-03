class Component {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.rotation = 0;
    this.isSelected = false;
    this.connectedWires = [];
    this.connectionPoints = [];
    this.isPowered = false; // Status komponen dialiri listrik
    this.isOn = type === "battery"; // Battery selalu ON sebagai sumber listrik
    this.createConnectionPoints();

    // Tambah properti khusus untuk switch
    if (type === "switch") {
      this.switchState = false; // Status ON/OFF
      this.buttonOffset = 0;
    }
    this.originalRotation = 0; // Tambah tracking rotasi asli
    this.totalRotation = 0; // Tambah tracking total rotasi

    // Tambah properti khusus untuk directionSwitch
    if (type === "directionSwitch") {
      this.selectedDirection = "none";
      // Pisahkan posisi tombol dari connection points
      this.buttons = [
        { label: "L", x: -25, y: -12, direction: "left" },
        { label: "C", x: 0, y: -12, direction: "center" },
        { label: "R", x: 25, y: -12, direction: "right" },
      ];
      this.isOn = false;
    }

    if (type === "flasher") {
      this.isFlashing = false;
      this.flashInterval = null;
      this.flashState = false;
      this.flashSpeed = 500; // 500ms interval kedip
    }

    // Tambah visual feedback saat hover
    this.isHovered = false;
  }

  createConnectionPoints() {
    if (this.type === "directionSwitch") {
      // Pisahkan posisi connection points dari tombol
      this.connectionPoints = [
        { originalX: -35, originalY: 10, index: 0 }, // Input (belakang)
        { originalX: -25, originalY: 10, index: 1 }, // Left output
        { originalX: 0, originalY: 10, index: 2 }, // Center output
        { originalX: 25, originalY: 10, index: 3 }, // Right output
      ].map((point) => ({
        ...point,
        x: this.x + point.originalX,
        y: this.y + point.originalY,
        isPowered: false,
      }));
    } else {
      let points = [];

      switch (this.type) {
        case "battery":
          points = [
            { originalX: -25, originalY: 0, index: 0 },
            { originalX: 25, originalY: 0, index: 1 },
          ];
          break;
        case "switch":
          points = [
            { originalX: -25, originalY: 0, index: 0 },
            { originalX: 25, originalY: 0, index: 1 },
          ];
          break;
        case "directionSwitch":
          // 1 input di belakang, 3 output sesuai tombol
          points = [
            { originalX: -35, originalY: 0, index: 0 }, // Input (belakang)
            { originalX: -25, originalY: 0, index: 1 }, // Left output
            { originalX: 0, originalY: 0, index: 2 }, // Center output
            { originalX: 25, originalY: 0, index: 3 }, // Right output
          ];
          break;
        default:
          points = [
            { originalX: -25, originalY: 0, index: 0 },
            { originalX: 25, originalY: 0, index: 1 },
            { originalX: 0, originalY: -25, index: 2 },
            { originalX: 0, originalY: 25, index: 3 },
          ];
      }

      this.connectionPoints = points.map((point) => ({
        ...point,
        x: this.x + point.originalX,
        y: this.y + point.originalY,
        isPowered: false,
      }));
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.translate(-this.x, -this.y);

    // Efek bayangan untuk semua komponen
    if (this.isSelected) {
      ctx.shadowColor = "rgba(0, 102, 255, 0.5)";
      ctx.shadowBlur = 10;
    }

    // Tambah visual feedback saat hover
    if (this.isHovered) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    switch (this.type) {
      case "battery":
        this.drawBattery(ctx);
        break;
      case "switch":
        this.drawSwitch(ctx);
        break;
      case "flasher":
        this.drawFlasher(ctx);
        break;
      case "directionSwitch":
        this.drawDirectionSwitch(ctx);
        break;
      case "lamp":
        this.drawLamp(ctx);
        break;
    }

    ctx.restore();

    // Gambar connection points
    this.drawConnectionPoints(ctx);
  }

  drawBattery(ctx) {
    // Body baterai
    const gradient = ctx.createLinearGradient(
      this.x - 25,
      this.y,
      this.x + 25,
      this.y
    );
    gradient.addColorStop(0, "#4a4a4a");
    gradient.addColorStop(1, "#2d2d2d");

    ctx.fillStyle = gradient;
    ctx.strokeStyle = this.isSelected ? "#0066ff" : "#000";
    ctx.lineWidth = this.isSelected ? 3 : 2;

    // Body utama
    ctx.beginPath();
    ctx.roundRect(this.x - 25, this.y - 20, 50, 40, 5);
    ctx.fill();
    ctx.stroke();

    // Terminal positif/negatif
    ctx.fillStyle = "#ddd";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("+", this.x + 15, this.y + 5);
    ctx.fillText("-", this.x - 15, this.y + 5);

    // Efek metalik
    const metalGradient = ctx.createLinearGradient(
      this.x,
      this.y - 20,
      this.x,
      this.y + 20
    );
    metalGradient.addColorStop(0, "rgba(255,255,255,0.1)");
    metalGradient.addColorStop(0.5, "rgba(255,255,255,0)");
    metalGradient.addColorStop(1, "rgba(255,255,255,0.1)");
    ctx.fillStyle = metalGradient;
    ctx.fill();
  }

  drawSwitch(ctx) {
    // Body switch
    const bodyGradient = ctx.createLinearGradient(
      this.x - 25,
      this.y - 15,
      this.x + 25,
      this.y + 15
    );
    bodyGradient.addColorStop(0, "#e0e0e0");
    bodyGradient.addColorStop(1, "#b0b0b0");

    ctx.fillStyle = bodyGradient;
    ctx.strokeStyle = this.isSelected ? "#0066ff" : "#333";
    ctx.lineWidth = this.isSelected ? 3 : 2;

    // Body dengan sudut rounded
    ctx.beginPath();
    ctx.roundRect(this.x - 25, this.y - 15, 50, 30, 5);
    ctx.fill();
    ctx.stroke();

    // Tombol switch
    const buttonX = this.switchState ? this.x + 10 : this.x - 10;
    const buttonGradient = ctx.createRadialGradient(
      buttonX,
      this.y - 2,
      0,
      buttonX,
      this.y - 2,
      12
    );
    buttonGradient.addColorStop(
      0,
      this.isPowered && this.switchState ? "#ffeb3b" : "#fff"
    );
    buttonGradient.addColorStop(
      1,
      this.isPowered && this.switchState ? "#ffd700" : "#ddd"
    );

    ctx.fillStyle = buttonGradient;
    ctx.beginPath();
    ctx.arc(buttonX, this.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Label ON/OFF dengan efek emboss
    ctx.fillStyle = "#666";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.switchState ? "ON" : "OFF", this.x, this.y + 20);
  }

  drawFlasher(ctx) {
    // Body flasher dengan gradien
    const bodyGradient = ctx.createLinearGradient(
      this.x - 25,
      this.y - 15,
      this.x + 25,
      this.y + 15
    );
    bodyGradient.addColorStop(0, "#3d3d3d");
    bodyGradient.addColorStop(1, "#1a1a1a");

    ctx.fillStyle = bodyGradient;
    ctx.strokeStyle = this.isSelected ? "#0066ff" : "#000";
    ctx.lineWidth = this.isSelected ? 3 : 2;

    // Body dengan sudut rounded
    ctx.beginPath();
    ctx.roundRect(this.x - 25, this.y - 15, 50, 30, 5);
    ctx.fill();
    ctx.stroke();

    // Simbol petir
    ctx.beginPath();
    ctx.moveTo(this.x - 10, this.y - 8);
    ctx.lineTo(this.x + 2, this.y - 8);
    ctx.lineTo(this.x - 3, this.y);
    ctx.lineTo(this.x + 10, this.y);
    ctx.lineTo(this.x - 2, this.y + 8);
    ctx.lineTo(this.x - 7, this.y + 8);
    ctx.lineTo(this.x - 10, this.y);
    ctx.closePath();

    // Gradien untuk simbol petir
    const boltGradient = ctx.createLinearGradient(
      this.x - 10,
      this.y,
      this.x + 10,
      this.y
    );
    boltGradient.addColorStop(0, this.flashState ? "#ffeb3b" : "#666");
    boltGradient.addColorStop(1, this.flashState ? "#ffd700" : "#999");

    ctx.fillStyle = boltGradient;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Indikator status
    ctx.fillStyle = this.flashState ? "#ffeb3b" : "#666";
    ctx.beginPath();
    ctx.arc(this.x + 15, this.y - 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDirectionSwitch(ctx) {
    // Body switch arah
    const bodyGradient = ctx.createLinearGradient(
      this.x - 35,
      this.y - 25,
      this.x + 35,
      this.y + 25
    );
    bodyGradient.addColorStop(0, "#4a4a4a");
    bodyGradient.addColorStop(1, "#2d2d2d");

    ctx.fillStyle = bodyGradient;
    ctx.strokeStyle = this.isSelected ? "#0066ff" : "#000";
    ctx.lineWidth = this.isSelected ? 3 : 2;

    // Body dengan sudut rounded
    ctx.beginPath();
    ctx.roundRect(this.x - 35, this.y - 25, 70, 50, 8);
    ctx.fill();
    ctx.stroke();

    // Gambar tombol-tombol
    this.buttons.forEach((button) => {
      const buttonX = this.x + button.x;
      const buttonY = this.y + button.y;

      // Gradien untuk tombol
      const buttonGradient = ctx.createRadialGradient(
        buttonX,
        buttonY - 2,
        0,
        buttonX,
        buttonY - 2,
        8
      );

      if (this.selectedDirection === button.direction && this.isOn) {
        buttonGradient.addColorStop(0, "#ffeb3b");
        buttonGradient.addColorStop(1, "#ffd700");
      } else {
        buttonGradient.addColorStop(0, "#fff");
        buttonGradient.addColorStop(1, "#ddd");
      }

      ctx.fillStyle = buttonGradient;
      ctx.beginPath();
      ctx.arc(buttonX, buttonY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label tombol dengan efek emboss
      ctx.fillStyle = "#000";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(button.label, buttonX, buttonY);
    });

    // Status ON/OFF
    ctx.fillStyle = "#fff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.isOn ? "ON" : "OFF", this.x, this.y + 20);
  }

  drawLamp(ctx) {
    // Base bulb gradient
    const bulbGradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      20
    );

    if (this.isPowered && (!this.isFlashing || this.flashState)) {
      bulbGradient.addColorStop(0, "rgba(255, 255, 200, 0.9)");
      bulbGradient.addColorStop(0.7, "rgba(255, 235, 59, 0.8)");
      bulbGradient.addColorStop(1, "rgba(255, 235, 59, 0.2)");
    } else {
      bulbGradient.addColorStop(0, "#fff");
      bulbGradient.addColorStop(1, "#e0e0e0");
    }

    // Gambar bola lampu
    ctx.beginPath();
    ctx.fillStyle = bulbGradient;
    ctx.strokeStyle = this.isSelected ? "#0066ff" : "#000";
    ctx.lineWidth = this.isSelected ? 3 : 2;
    ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Base lampu
    ctx.beginPath();
    ctx.fillStyle = "#666";
    ctx.rect(this.x - 8, this.y + 20, 16, 5);
    ctx.fill();

    // Efek cahaya ketika menyala
    if (this.isPowered && (!this.isFlashing || this.flashState)) {
      const glowGradient = ctx.createRadialGradient(
        this.x,
        this.y,
        15,
        this.x,
        this.y,
        40
      );
      glowGradient.addColorStop(0, "rgba(255, 235, 59, 0.3)");
      glowGradient.addColorStop(1, "rgba(255, 235, 59, 0)");

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 40, 0, Math.PI * 2);
      ctx.fill();

      // Efek filamen
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 200, 0, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.moveTo(this.x - 10, this.y);
      ctx.quadraticCurveTo(this.x, this.y - 10, this.x + 10, this.y);
      ctx.stroke();
    }
  }

  drawConnectionPoints(ctx) {
    this.connectionPoints.forEach((point, index) => {
      // Gradient untuk connection point
      const pointGradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        5
      );

      if (point.isPowered) {
        pointGradient.addColorStop(0, "rgba(255, 235, 59, 1)");
        pointGradient.addColorStop(1, "rgba(255, 235, 59, 0.5)");
      } else {
        pointGradient.addColorStop(0, "rgba(0, 120, 255, 0.8)");
        pointGradient.addColorStop(1, "rgba(0, 120, 255, 0.3)");
      }

      ctx.beginPath();
      ctx.fillStyle = pointGradient;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  updateRotation(newAngle) {
    // Hitung perubahan rotasi
    let deltaRotation = newAngle - this.rotation;

    // Normalisasi delta ke range -PI sampai PI
    if (deltaRotation > Math.PI) deltaRotation -= Math.PI * 2;
    if (deltaRotation < -Math.PI) deltaRotation += Math.PI * 2;

    // Update total rotasi
    this.totalRotation += deltaRotation;
    this.rotation = newAngle;

    // Normalisasi rotasi ke range 0-2PI
    while (this.rotation < 0) this.rotation += Math.PI * 2;
    while (this.rotation >= Math.PI * 2) this.rotation -= Math.PI * 2;

    // Update connection points
    this.updateConnectionPoints();

    // Update connected wires
    this.connectedWires.forEach((wire) => {
      if (wire.start.component === this) {
        const point = this.connectionPoints[wire.start.originalIndex];
        wire.start.x = point.x;
        wire.start.y = point.y;
      }
      if (wire.end.component === this) {
        const point = this.connectionPoints[wire.end.originalIndex];
        wire.end.x = point.x;
        wire.end.y = point.y;
      }
    });
  }

  updatePosition(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.updateConnectionPoints();

    // Update semua kabel yang terhubung
    this.connectedWires.forEach((wire) => {
      // Update posisi kabel untuk komponen ini
      if (wire.start.component === this) {
        const point = this.connectionPoints[wire.start.originalIndex];
        wire.start.x = point.x;
        wire.start.y = point.y;
      }
      if (wire.end.component === this) {
        const point = this.connectionPoints[wire.end.originalIndex];
        wire.end.x = point.x;
        wire.end.y = point.y;
      }

      // Update posisi kabel untuk komponen yang terhubung
      const otherComponent =
        wire.start.component === this
          ? wire.end.component
          : wire.start.component;

      if (otherComponent) {
        const otherPoint =
          otherComponent.connectionPoints[
            wire.start.component === this
              ? wire.end.originalIndex
              : wire.start.originalIndex
          ];

        if (wire.start.component === otherComponent) {
          wire.start.x = otherPoint.x;
          wire.start.y = otherPoint.y;
        } else {
          wire.end.x = otherPoint.x;
          wire.end.y = otherPoint.y;
        }
      }
    });
  }

  updateConnectedWires() {
    this.connectedWires.forEach((wire) => {
      if (wire.start.component === this) {
        const point = this.connectionPoints[wire.start.originalIndex];
        if (point) {
          wire.start.x = point.x;
          wire.start.y = point.y;
        }
      }
      if (wire.end.component === this) {
        const point = this.connectionPoints[wire.end.originalIndex];
        if (point) {
          wire.end.x = point.x;
          wire.end.y = point.y;
        }
      }
    });
  }

  updateConnectionPoints() {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    this.connectionPoints.forEach((point) => {
      // Rotasi relatif terhadap pusat komponen
      point.x = this.x + (point.originalX * cos - point.originalY * sin);
      point.y = this.y + (point.originalX * sin + point.originalY * cos);
    });
  }

  isPointInside(x, y) {
    if (this.type === "directionSwitch") {
      // Transform coordinates
      const dx = x - this.x;
      const dy = y - this.y;
      const cos = Math.cos(-this.rotation);
      const sin = Math.sin(-this.rotation);
      const rotatedX = dx * cos - dy * sin;
      const rotatedY = dx * sin + dy * cos;

      // Cek apakah point ada di dalam area tombol
      for (const button of this.buttons) {
        const buttonX = button.x;
        const buttonY = button.y;
        const distance = Math.hypot(rotatedX - buttonX, rotatedY - buttonY);
        if (distance <= 8) {
          if (this.selectedDirection === button.direction) {
            this.isOn = !this.isOn;
          } else {
            this.selectedDirection = button.direction;
            this.isOn = true;
          }
          return true;
        }
      }

      // Cek area switch body
      return Math.abs(rotatedX) <= 35 && Math.abs(rotatedY) <= 25;
    } else if (this.type === "switch") {
      // Transformasi koordinat klik ke koordinat lokal komponen
      const dx = x - this.x;
      const dy = y - this.y;
      const cos = Math.cos(-this.rotation);
      const sin = Math.sin(-this.rotation);
      const rotatedX = dx * cos - dy * sin;
      const rotatedY = dx * sin + dy * cos;

      // Cek apakah point berada dalam area switch
      return Math.abs(rotatedX) <= 25 && Math.abs(rotatedY) <= 15;
    } else {
      return Math.hypot(x - this.x, y - this.y) <= 20;
    }
  }

  isRotationHandleClicked(x, y) {
    if (!this.isSelected) return false;

    // Transformasi koordinat handle rotasi
    const handleX = this.x;
    const handleY = this.y - 40;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const rotatedHandleX = this.x + (0 * cos - -40 * sin);
    const rotatedHandleY = this.y + (0 * sin + -40 * cos);

    return Math.hypot(x - rotatedHandleX, y - rotatedHandleY) <= 6;
  }

  isNearConnectionPoint(index, point) {
    const originalPoint = this.connectionPoints[index];
    return (
      Math.abs(originalPoint.originalX - point.originalX) < 0.1 &&
      Math.abs(originalPoint.originalY - point.originalY) < 0.1
    );
  }

  toggleSwitch() {
    if (this.type === "switch") {
      this.switchState = !this.switchState;
      this.isOn = this.switchState;
    }
  }

  propagateCurrentToDirection(direction) {
    if (!this.isOn || !this.isPowered) return false;

    // Tentukan index connection point berdasarkan arah
    let outputIndex;
    switch (direction) {
      case "left":
        outputIndex = 1;
        break;
      case "center":
        outputIndex = 2;
        break;
      case "right":
        outputIndex = 3;
        break;
      default:
        return false;
    }

    // Aktifkan titik koneksi yang sesuai
    this.connectionPoints.forEach((point, index) => {
      point.isPowered = index === 0 || index === outputIndex;
    });

    return true;
  }

  startFlashing() {
    if (!this.flashInterval) {
      this.isFlashing = true;
      this.flashInterval = setInterval(() => {
        this.flashState = !this.flashState;
        // Trigger update untuk semua lampu yang terhubung
        if (this.circuit) {
          this.circuit.updateFlashingLamps();
        }
      }, this.flashSpeed);
    }
  }

  stopFlashing() {
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
      this.isFlashing = false;
      this.flashState = false;
    }
  }
}

class Circuit {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.components = [];
    this.wires = [];
    this.selectedComponent = null;
    this.isDragging = false;
    this.isRotating = false;
    this.connecting = null;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.rotationStartAngle = 0;
    this.lastUpdateTime = 0;
    this.wireUpdateQueue = new Set(); // Tambah queue untuk update wire
    this.rotationSensitivity = 0.5; // Sesuaikan sensitivitas rotasi
    this.lastRotationAngle = 0;
    this.flashers = new Set();

    this.setupEventListeners();
    this.updateInterval = setInterval(() => this.updateCircuit(), 100); // Update circuit setiap 100ms

    // Tambah method untuk delete component
    this.setupDeleteFeature();
  }

  setupEventListeners() {
    // Drag and drop komponen baru
    this.canvas.addEventListener("dragover", (e) => e.preventDefault());

    this.canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("text/plain");
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Unselect semua komponen yang ada
      this.components.forEach((c) => (c.isSelected = false));

      // Buat komponen baru dalam keadaan terseleksi
      const newComponent = new Component(type, x, y);
      newComponent.isSelected = true;
      this.components.push(newComponent);
      this.selectedComponent = newComponent;

      this.draw();
    });

    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Reset rotation tracking pada mousedown
      this.lastRotationAngle = undefined;

      let clickedOnConnection = false;
      this.components.forEach((component) => {
        component.connectionPoints.forEach((point, index) => {
          if (Math.hypot(x - point.x, y - point.y) < 5) {
            this.connecting = {
              start: point,
              component: component,
              pointIndex: index,
            };
            clickedOnConnection = true;
          }
        });
      });

      if (!clickedOnConnection) {
        // Cek rotation handle
        let clickedRotationHandle = false;
        this.components.forEach((component) => {
          if (component.isRotationHandleClicked(x, y)) {
            clickedRotationHandle = true;
            this.isRotating = true;
            this.selectedComponent = component;
            this.rotationStartAngle = Math.atan2(
              y - component.y,
              x - component.x
            );
          }
        });

        if (!clickedRotationHandle) {
          // Cek komponen
          let clickedComponent = false;
          for (let i = this.components.length - 1; i >= 0; i--) {
            const component = this.components[i];
            if (component.isPointInside(x, y)) {
              clickedComponent = true;
              this.components.forEach((c) => (c.isSelected = false));
              component.isSelected = true;
              this.selectedComponent = component;
              this.isDragging = true;
              this.lastMouseX = x;
              this.lastMouseY = y;
              break;
            }
          }

          if (!clickedComponent) {
            this.components.forEach((c) => (c.isSelected = false));
            this.selectedComponent = null;
          }
        }
      }

      this.draw();
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.isRotating && this.selectedComponent) {
        // Hitung sudut relatif terhadap pusat komponen
        const dx = x - this.selectedComponent.x;
        const dy = y - this.selectedComponent.y;
        const currentAngle = Math.atan2(dy, dx);

        if (this.lastRotationAngle === undefined) {
          this.lastRotationAngle = currentAngle;
        }

        // Hitung perubahan sudut
        let deltaAngle = currentAngle - this.lastRotationAngle;

        // Normalisasi delta angle
        if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
        if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

        // Terapkan sensitivitas
        deltaAngle *= this.rotationSensitivity;

        // Update rotasi komponen
        let newRotation = this.selectedComponent.rotation + deltaAngle;

        // Pastikan rotasi tetap dalam range yang valid
        while (newRotation < 0) newRotation += Math.PI * 2;
        while (newRotation >= Math.PI * 2) newRotation -= Math.PI * 2;

        this.selectedComponent.updateRotation(newRotation);
        this.lastRotationAngle = currentAngle;

        this.draw();
      } else if (this.isDragging && this.selectedComponent) {
        const dx = x - this.lastMouseX;
        const dy = y - this.lastMouseY;
        this.selectedComponent.updatePosition(dx, dy);
        this.lastMouseX = x;
        this.lastMouseY = y;
        this.draw();
      } else if (this.connecting) {
        this.draw();
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#000";
        this.ctx.moveTo(this.connecting.start.x, this.connecting.start.y);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      }

      // Update cursor
      let onRotationHandle = false;
      let onConnectionPoint = false;
      this.components.forEach((component) => {
        if (component.isRotationHandleClicked(x, y)) {
          onRotationHandle = true;
        }
        component.connectionPoints.forEach((point) => {
          if (Math.hypot(x - point.x, y - point.y) < 5) {
            onConnectionPoint = true;
          }
        });
      });
      this.canvas.style.cursor = onRotationHandle
        ? "grab"
        : onConnectionPoint
        ? "crosshair"
        : "default";
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (this.connecting) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.components.forEach((component) => {
          component.connectionPoints.forEach((point, index) => {
            if (Math.hypot(x - point.x, y - point.y) < 5) {
              const wire = {
                start: {
                  x: this.connecting.start.x,
                  y: this.connecting.start.y,
                  component: this.connecting.component,
                  originalIndex: this.connecting.pointIndex,
                },
                end: {
                  x: point.x,
                  y: point.y,
                  component: component,
                  originalIndex: index,
                },
              };

              this.wires.push(wire);
              this.connecting.component.connectedWires.push(wire);
              component.connectedWires.push(wire);
            }
          });
        });
        this.connecting = null;
      }

      this.isDragging = false;
      this.isRotating = false;
      this.lastRotationAngle = undefined;
      this.draw();
    });

    // Update event listener untuk toggle switch
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.components.forEach((component) => {
        if (component.type === "switch" && component.isPointInside(x, y)) {
          // Cek apakah klik pada area tombol switch
          const dx = x - component.x;
          const dy = y - component.y;
          const rotatedX =
            dx * Math.cos(-component.rotation) -
            dy * Math.sin(-component.rotation);

          // Area tombol switch
          if (Math.abs(rotatedX) <= 15) {
            component.toggleSwitch();
            this.updateCircuit();
          }
        }
      });
    });
  }

  setupDeleteFeature() {
    // Listener untuk tombol Delete
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete" && this.selectedComponent) {
        this.deleteComponent(this.selectedComponent);
      }
    });

    // Listener untuk context menu (klik kanan)
    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Cek apakah klik kanan pada komponen
      this.components.forEach((component) => {
        if (component.isPointInside(x, y)) {
          this.deleteComponent(component);
        }
      });
    });
  }

  deleteComponent(component) {
    // Hapus semua wire yang terhubung
    component.connectedWires.forEach((wire) => {
      // Hapus wire dari array wires
      const wireIndex = this.wires.indexOf(wire);
      if (wireIndex > -1) {
        this.wires.splice(wireIndex, 1);
      }

      // Hapus wire dari komponen yang terhubung
      const otherComponent =
        wire.start.component === component
          ? wire.end.component
          : wire.start.component;

      if (otherComponent) {
        const otherWireIndex = otherComponent.connectedWires.indexOf(wire);
        if (otherWireIndex > -1) {
          otherComponent.connectedWires.splice(otherWireIndex, 1);
        }
      }
    });

    // Bersihkan interval jika komponen adalah flasher
    if (component.type === "flasher") {
      component.stopFlashing();
      this.flashers.delete(component);
    }

    // Hapus komponen dari array
    const index = this.components.indexOf(component);
    if (index > -1) {
      this.components.splice(index, 1);
    }

    // Reset selected component jika yang dihapus adalah komponen yang dipilih
    if (this.selectedComponent === component) {
      this.selectedComponent = null;
    }

    // Update circuit dan redraw
    this.updateCircuit();
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Gambar wire
    this.wires.forEach((wire) => {
      this.ctx.beginPath();
      this.ctx.strokeStyle =
        wire.start.isPowered || wire.end.isPowered
          ? "rgba(255, 235, 59, 0.8)"
          : "#000";
      this.ctx.lineWidth = 2;
      this.ctx.moveTo(wire.start.x, wire.start.y);
      this.ctx.lineTo(wire.end.x, wire.end.y);
      this.ctx.stroke();

      // Tambah efek glow untuk wire yang aktif
      if (wire.start.isPowered || wire.end.isPowered) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgba(255, 235, 59, 0.3)";
        this.ctx.lineWidth = 4;
        this.ctx.moveTo(wire.start.x, wire.start.y);
        this.ctx.lineTo(wire.end.x, wire.end.y);
        this.ctx.stroke();
      }
    });

    // Gambar komponen
    this.components.forEach((component) => component.draw(this.ctx));
  }

  updateCircuit() {
    // Reset status listrik semua komponen kecuali battery
    this.components.forEach((component) => {
      if (component.type !== "battery") {
        component.isPowered = false;
        component.connectionPoints.forEach(
          (point) => (point.isPowered = false)
        );
      }
    });

    // Mulai dari battery
    const batteries = this.components.filter((c) => c.type === "battery");
    batteries.forEach((battery) => {
      battery.isPowered = true;
      battery.connectionPoints.forEach((point) => (point.isPowered = true));
      this.propagatePower(battery, new Set());
    });

    this.draw();
  }

  propagatePower(component, visited = new Set(), flasherState = null) {
    if (visited.has(component)) return;
    visited.add(component);

    // Set komponen sebagai powered
    component.isPowered = true;

    // Jika ada flasher state yang sedang aktif, terapkan ke komponen
    if (flasherState !== null) {
      component.isFlashing = true;
      component.flashState = flasherState;
    }

    if (component.type === "flasher") {
      if (component.isPowered) {
        component.startFlashing();
        this.flashers.add(component);
        flasherState = component.flashState; // Set flasher state untuk propagasi
      }
    }

    // Handle different component types
    if (component.type === "directionSwitch") {
      if (component.isOn && component.selectedDirection !== "none") {
        // Tentukan output yang aktif
        let activeOutputIndex;
        switch (component.selectedDirection) {
          case "left":
            activeOutputIndex = 1;
            break;
          case "center":
            activeOutputIndex = 2;
            break;
          case "right":
            activeOutputIndex = 3;
            break;
        }

        // Propagasi ke output yang aktif saja
        component.connectedWires.forEach((wire) => {
          let nextComponent, nextPoint;

          if (wire.start.component === component) {
            if (wire.start.originalIndex === activeOutputIndex) {
              nextComponent = wire.end.component;
              nextPoint = wire.end;
            }
          } else if (wire.end.component === component) {
            if (wire.end.originalIndex === activeOutputIndex) {
              nextComponent = wire.start.component;
              nextPoint = wire.start;
            }
          }

          if (nextComponent && !visited.has(nextComponent)) {
            nextPoint.isPowered = true;
            this.propagatePower(nextComponent, visited, flasherState);
          }
        });
      }
    } else if (component.type === "switch") {
      // Untuk switch biasa
      if (component.switchState) {
        component.connectedWires.forEach((wire) => {
          let nextComponent, nextPoint;

          if (wire.start.component === component) {
            nextComponent = wire.end.component;
            nextPoint = wire.end;
          } else {
            nextComponent = wire.start.component;
            nextPoint = wire.start;
          }

          if (nextComponent && !visited.has(nextComponent)) {
            nextPoint.isPowered = true;
            this.propagatePower(nextComponent, visited, flasherState);
          }
        });
      }
    } else {
      // Untuk komponen lain (battery, lamp, dll)
      component.connectedWires.forEach((wire) => {
        let nextComponent, nextPoint;

        if (wire.start.component === component) {
          nextComponent = wire.end.component;
          nextPoint = wire.end;
        } else {
          nextComponent = wire.start.component;
          nextPoint = wire.start;
        }

        if (nextComponent && !visited.has(nextComponent)) {
          nextPoint.isPowered = true;
          this.propagatePower(nextComponent, visited, flasherState);
        }
      });
    }
  }

  updateFlashingLamps() {
    this.flashers.forEach((flasher) => {
      if (flasher.isPowered) {
        const visited = new Set();
        this.propagateFlashState(flasher, flasher.flashState, visited);
      }
    });
    this.draw();
  }

  propagateFlashState(component, state, visited) {
    if (visited.has(component)) return;
    visited.add(component);

    // Update flash state untuk komponen yang sedang aktif
    if (component.isPowered) {
      component.flashState = state;

      // Khusus untuk directionSwitch
      if (component.type === "directionSwitch") {
        if (component.isOn && component.selectedDirection !== "none") {
          let activeOutputIndex;
          switch (component.selectedDirection) {
            case "left":
              activeOutputIndex = 1;
              break;
            case "center":
              activeOutputIndex = 2;
              break;
            case "right":
              activeOutputIndex = 3;
              break;
          }

          component.connectedWires.forEach((wire) => {
            let nextComponent;
            if (wire.start.component === component) {
              if (wire.start.originalIndex === activeOutputIndex) {
                nextComponent = wire.end.component;
              }
            } else if (wire.end.component === component) {
              if (wire.end.originalIndex === activeOutputIndex) {
                nextComponent = wire.start.component;
              }
            }

            if (nextComponent && !visited.has(nextComponent)) {
              this.propagateFlashState(nextComponent, state, visited);
            }
          });
        }
      } else {
        // Untuk komponen lain
        component.connectedWires.forEach((wire) => {
          let nextComponent;
          if (wire.start.component === component) {
            nextComponent = wire.end.component;
          } else {
            nextComponent = wire.start.component;
          }

          if (nextComponent && !visited.has(nextComponent)) {
            this.propagateFlashState(nextComponent, state, visited);
          }
        });
      }
    }
  }

  destroy() {
    // Bersihkan semua interval saat circuit dihancurkan
    this.components.forEach((component) => {
      if (component.type === "flasher") {
        component.stopFlashing();
      }
    });
  }
}

// Inisialisasi
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("workArea");
  const circuit = new Circuit(canvas);

  // Setup drag and drop untuk komponen
  document.querySelectorAll(".component").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.type);
    });
  });
});
