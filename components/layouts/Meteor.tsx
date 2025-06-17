// From https://codepen.io/loktar00/pen/nXWOJL

"use client";

import React, { useEffect, useRef } from "react";

interface StarOptions {
  x: number;
  y: number;
}

class Star {
  size: number;
  speed: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;

  constructor(
    options: StarOptions,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    this.size = Math.random() * 2;
    this.speed = Math.random() * 0.1;
    this.x = options.x;
    this.y = options.y;
    this.width = width;
    this.height = height;
    this.ctx = ctx;
  }

  reset() {
    this.size = Math.random() * 2;
    this.speed = Math.random() * 0.1;
    this.x = this.width;
    this.y = Math.random() * this.height;
  }

  update() {
    this.x -= this.speed;
    if (this.x < 0) {
      this.reset();
    } else {
      this.ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }
}

class ShootingStar {
  x: number;
  y: number;
  len: number;
  speed: number;
  size: number;
  waitTime: number;
  active: boolean;
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.x = 0;
    this.y = 0;
    this.len = 0;
    this.speed = 0;
    this.size = 0;
    this.waitTime = 0;
    this.active = false;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.width;
    this.y = 0;
    this.len = Math.random() * 80 + 10;
    this.speed = Math.random() * 10 + 6;
    this.size = Math.random() * 1 + 0.1;
    this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
    this.active = false;
  }

  update() {
    if (this.active) {
      this.x -= this.speed;
      this.y += this.speed;
      if (this.x < 0 || this.y >= this.height) {
        this.reset();
      } else {
        this.ctx.lineWidth = this.size;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.x + this.len, this.y - this.len);
        this.ctx.stroke();
      }
    } else {
      if (this.waitTime < new Date().getTime()) {
        this.active = true;
      }
    }
  }
}

export function Meteor() {
  const terrainCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const entitiesRef = useRef<(Star | ShootingStar)[]>([]);
  useEffect(() => {
    const terrainCanvas = terrainCanvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;

    if (!terrainCanvas || !backgroundCanvas) return;

    const terCtx = terrainCanvas.getContext("2d");
    const bgCtx = backgroundCanvas.getContext("2d");

    if (!terCtx || !bgCtx) return;

    const initializeCanvas = () => {
      const width = window.innerWidth;
      const height = document.body.offsetHeight;
      terrainCanvas.width = backgroundCanvas.width = width;
      terrainCanvas.height = backgroundCanvas.height = height;

      // Generate terrain
      const points: number[] = [];
      let displacement = width / (Math.log(width) + 2);
      const power = Math.pow(2, Math.ceil(Math.log(width) / Math.log(2)));

      // Set start and end height for terrain
      points[0] = height - (Math.random() * height) / 3 - displacement;
      points[power] = height - (Math.random() * height) / 3 - displacement;

      // Create the rest of the points
      for (let i = 1; i < power; i *= 2) {
        for (let j = power / i / 2; j < power; j += power / i) {
          points[j] =
            (points[j - power / i / 2] + points[j + power / i / 2]) / 2 +
            Math.floor(Math.random() * -displacement + displacement);
        }
        displacement *= 0.6;
      }

      // Clear previous terrain
      terCtx.clearRect(0, 0, width, height);

      // Draw terrain
      terCtx.beginPath();
      for (let i = 0; i <= width; i++) {
        if (i === 0) {
          terCtx.moveTo(0, points[0]);
        } else if (points[i] !== undefined) {
          terCtx.lineTo(i, points[i]);
        }
      }
      terCtx.lineTo(width, terrainCanvas.height);
      terCtx.lineTo(0, terrainCanvas.height);
      terCtx.lineTo(0, points[0]);
      terCtx.fill();

      // Initialize entities
      const entities: (Star | ShootingStar)[] = [];

      // Initialize stars
      for (let i = 0; i < height; i++) {
        entities.push(
          new Star(
            {
              x: Math.random() * width,
              y: Math.random() * height,
            },
            bgCtx,
            width,
            height,
          ),
        );
      }

      // Add shooting stars
      entities.push(new ShootingStar(bgCtx, width, height));
      entities.push(new ShootingStar(bgCtx, width, height));

      entitiesRef.current = entities;
    };

    // Initialize canvas on first load
    initializeCanvas();

    // Animation function
    const animate = () => {
      if (!bgCtx || entitiesRef.current.length === 0) return;

      const width = backgroundCanvas.width;
      const height = backgroundCanvas.height;

      bgCtx.clearRect(0, 0, width, height);
      bgCtx.fillStyle = "#ffffff";
      bgCtx.strokeStyle = "#ffffff";

      let entLen = entitiesRef.current.length;
      while (entLen--) {
        entitiesRef.current[entLen].update();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      initializeCanvas();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={backgroundCanvasRef}
        id="bgCanvas"
        className="absolute inset-0 z-0"
      />
      <canvas
        ref={terrainCanvasRef}
        id="terCanvas"
        className="absolute inset-0 z-10"
      />
    </div>
  );
}
