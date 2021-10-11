function easeOutCirc(x) {
    return sqrt(1 - pow(x - 1, 2))
  }

  function easeInCirc(x) {
    return 1 - sqrt(1 - pow(x, 2));
  }

  function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  }

  function easeInBounce(x) {
    return 1 - easeOutBounce(1 - x);
  }

  function easeInCubic(x) {
    return x * x * x;
  }
