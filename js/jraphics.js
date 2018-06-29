// Just a simple little canvas graphics library that I cobbled together

function degreeToRadians(value) {
  return (value / 360) * 2 * Math.PI;
}

const vector = {
  _x: 0,
  _y: 0,

  // dummy constructor
  create: (x, y) => {
    const obj = Object.create(this);

    obj._y = y;
    obj._x = x;

    return obj;
  },

  // member functions
  getX: () => {
    return this._x;
  },

  getY: () => {
    return this._y;
  },

  setX: (value) => {
    this._x = value;
  },

  setY: (value) => {
    this._y = value;
  },

  getLength: () => {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  },

  getAngle: () => {
    return Math.atan2(this._y, this._x);
  },

  setAngle: (angle) => {
    length = this.getLength();
    this._y = Math.cos(angle) * length;
    this._x = Math.sin(angle) * length;
  },

  setLength: (length) => {
    angle = this.getAngle();
    this._y = Math.cos(angle) * length;
    this._x = Math.sin(angle) * length;
  },

  add: (v2) => {
    vect = this.create(this._x + v2._x, this._y + v2._y);
    return vect;
  },

  subtract: (v2) => {
    vect = this.create(this._x - v2._x, this._y - v2._y);
    return vect;
  },

  multiply: (value) => {
    return vector.create(this._x * value, this._y * value);
  },

  divide: (value) => {
    return vector.create(this._x / value, this._y / value);
  },

  scale: (value) => {
    this._x = this._x * value;
    this._y = this._y * value;
  },

  addTo: (v2) => {
    this._x = this._x + v2._x;
    this._y = this._y + v2._y;
  },

  subtractFrom: (v2) => {
    this._x = this._x - v2._x;
    this._y = this._y - v2._y;
  }
};

const particle = {
  velocity: null,
  position: null,

  /// dummy constructor

  create: (x, y, speed, angle) => {
    _debug("Particle x: " + x);
    _debug("Particle y: " + y);
    _debug("Particle speed: " + speed);
    _debug("Particle angle: " + angle);

    var obj = Object.create(this);

    obj.velocity = vector.create(0, 0);
    obj.velocity.setLength(speed);
    obj.velocity.setAngle(angle);
    obj.position = vector.create(x, y);

    _debug("Particle object: " + obj);

    return obj;
  },

  update: () => {
    this.position.addTo(this.velocity);
  }

};

const particle_explosion = {
  _x: 0,
  _y: 0,
  _particles: [],
  _max_particle: 0,
  _context: null,

  create: (ctx, x, y, max_particle) => {
    this._context = ctx;

    for (let i = 0; i < max_particle; i++) {
      this._particles.push(particle.create(x, y, (Math.random() * 10) + 1, Math.random() * Math.PI * 2));
    }
  },

  update: () => {
    this._context.clearRect(0, 0, canvas_width, canvas_height);
    for (let i = 0; i < this._max_particle; i++) {
      this._particles[i].update();
      this._context.beginPath();
      this._context.arc(this._particles[i].position.getX(), this._particles[i].position.getY(), 3, 0, 2 * Math.PI, false);
      this._context.fill();
    }

    requestAnimationFrame(this.update());
  }
};

function _debug(msg) {
  if (_DEBUG) {
    console.log("**DEBUG: " + msg);
  }
}
