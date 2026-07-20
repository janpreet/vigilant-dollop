/**
 * Recipe ingredient scaling + unit conversion.
 * Reads ingredient densities (grams per US cup) from a JSON script tag
 * rendered once per recipe page from _data/ingredient_densities.yml, so
 * the conversion table stays in one global config instead of per-post.
 */
(function () {
  var G_PER_OZ = 28.3495;
  var ML_PER_TSP = 4.92892;
  var ML_PER_TBSP = 14.7868;
  var ML_PER_CUP = 236.588;

  var COUNT_UNITS = ['whole', 'clove', 'can', 'packet', 'leaf', 'pinch', ''];

  function round(n, decimals) {
    var f = Math.pow(10, decimals);
    return Math.round(n * f) / f;
  }

  function trimNumber(n) {
    // Scale precision to magnitude so small quantities (fractions of a
    // gram/oz, common in spice- and incense-scale recipes) don't collapse
    // to a meaningless "0" at a flat 2 decimal places.
    var abs = Math.abs(n);
    var decimals = 2;
    if (abs > 0 && abs < 1) decimals = 3;
    else if (abs >= 100) decimals = 1;
    return String(round(n, decimals));
  }

  function densities() {
    var el = document.getElementById('ingredient-densities');
    if (!el) return {};
    try {
      return JSON.parse(el.textContent) || {};
    } catch (e) {
      return {};
    }
  }

  var DENSITIES = densities();

  function cupsFromGrams(grams, key) {
    if (!key) return null;
    var perCup = DENSITIES[key.toLowerCase()];
    if (!perCup) return null;
    return grams / perCup;
  }

  function formatWeightMetric(grams) {
    if (grams >= 1000) return { value: trimNumber(grams / 1000), unit: 'kg' };
    return { value: trimNumber(grams), unit: 'g' };
  }

  function formatWeightUS(grams) {
    var oz = grams / G_PER_OZ;
    if (oz >= 16) return { value: trimNumber(oz / 16), unit: 'lb' };
    return { value: trimNumber(oz), unit: 'oz' };
  }

  function formatVolumeMetric(ml) {
    if (ml >= 1000) return { value: trimNumber(ml / 1000), unit: 'l' };
    return { value: trimNumber(ml), unit: 'ml' };
  }

  function formatVolumeUS(ml) {
    var cups = ml / ML_PER_CUP;
    if (cups >= 0.24) return { value: trimNumber(cups), unit: cups === 1 ? 'cup' : 'cups' };
    var tbsp = ml / ML_PER_TBSP;
    if (tbsp >= 1) return { value: trimNumber(tbsp), unit: 'tbsp' };
    return { value: trimNumber(ml / ML_PER_TSP), unit: 'tsp' };
  }

  function toMl(amount, unit) {
    switch (unit) {
      case 'ml': return amount;
      case 'l': return amount * 1000;
      case 'tsp': return amount * ML_PER_TSP;
      case 'tbsp': return amount * ML_PER_TBSP;
      case 'cup': return amount * ML_PER_CUP;
      default: return null;
    }
  }

  function toGrams(amount, unit) {
    if (unit === 'kg') return amount * 1000;
    if (unit === 'g') return amount;
    return null;
  }

  function renderIngredient(el, system) {
    var baseAmount = parseFloat(el.getAttribute('data-amount'));
    if (isNaN(baseAmount)) return; // freeform text row, nothing to compute

    var baseMaxAttr = el.getAttribute('data-amount-max');
    var baseMax = baseMaxAttr ? parseFloat(baseMaxAttr) : null;
    var unit = el.getAttribute('data-unit') || '';
    var key = el.getAttribute('data-key') || '';
    var multiplier = parseFloat(el.getAttribute('data-multiplier') || '1');

    var amount = baseAmount * multiplier;
    var amountMax = baseMax !== null ? baseMax * multiplier : null;

    var amountText, unitText, noteText = '';

    if (unit === 'g' || unit === 'kg') {
      var grams = toGrams(amount, unit);
      var gramsMax = amountMax !== null ? toGrams(amountMax, unit) : null;
      var fmt = system === 'metric' ? formatWeightMetric : formatWeightUS;
      var main = fmt(grams);
      amountText = main.value + (gramsMax !== null ? '–' + fmt(gramsMax).value : '');
      unitText = main.unit;
      if (system === 'us') {
        var cups = cupsFromGrams(grams, key);
        if (cups) noteText = ' (~' + trimNumber(cups) + ' cup' + (round(cups, 2) === 1 ? '' : 's') + ')';
      }
    } else if (unit === 'ml' || unit === 'l') {
      // Pure volume, no density needed either direction.
      var ml = toMl(amount, unit);
      var mlMax = amountMax !== null ? toMl(amountMax, unit) : null;
      var vfmt = system === 'metric' ? formatVolumeMetric : formatVolumeUS;
      var vmain = vfmt(ml);
      amountText = vmain.value + (mlMax !== null ? '–' + vfmt(mlMax).value : '');
      unitText = vmain.unit;
    } else if (unit === 'tsp' || unit === 'tbsp' || unit === 'cup') {
      // Spoon/cup measures read naturally in both systems; scale, don't convert.
      amountText = trimNumber(amount) + (amountMax !== null ? '–' + trimNumber(amountMax) : '');
      unitText = unit;
    } else if (COUNT_UNITS.indexOf(unit) !== -1) {
      amountText = trimNumber(amount) + (amountMax !== null ? '–' + trimNumber(amountMax) : '');
      unitText = unit === 'whole' || unit === '' ? '' : unit;
    } else {
      amountText = trimNumber(amount);
      unitText = unit;
    }

    var amountEl = el.querySelector('.ri-amount');
    var unitEl = el.querySelector('.ri-unit');
    var noteEl = el.querySelector('.ri-note');
    if (amountEl) amountEl.textContent = amountText;
    if (unitEl) unitEl.textContent = unitText;
    if (noteEl) noteEl.textContent = noteText;
  }

  function renderGroup(group, system) {
    var base = parseFloat(group.getAttribute('data-base-servings'));
    var current = parseFloat(group.getAttribute('data-current-servings'));
    var multiplier = base > 0 ? current / base : 1;
    var rows = group.querySelectorAll('.recipe-ingredient');
    rows.forEach(function (row) {
      row.setAttribute('data-multiplier', multiplier);
      renderIngredient(row, system);
    });
  }

  function currentSystem(recipeRoot) {
    return recipeRoot.getAttribute('data-unit-system') || 'metric';
  }

  // A page can have multiple ingredient cards (e.g. a dough and a filling
  // as separate sections, or a pasta and its sauce). Unit system and
  // "shared" servings are both page-wide: they're components of one dish,
  // so scaling or converting one should move every other shared card in
  // step. Only a group that opted into its own `servings` in front matter
  // (a genuine alternative, like two versions of a sauce you'd never make
  // both of) gets an independent, per-card stepper.
  function setUnitSystemEverywhere(next) {
    document.querySelectorAll('.recipe').forEach(function (recipeRoot) {
      recipeRoot.setAttribute('data-unit-system', next);
      recipeRoot.querySelectorAll('.unit-toggle-btn').forEach(function (btn) {
        var active = btn.getAttribute('data-unit') === next;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      recipeRoot.querySelectorAll('.recipe-group').forEach(function (group) {
        renderGroup(group, next);
      });
    });
  }

  var sharedServings = null; // { current } shared across every "shared" group/stepper on the page

  function applySharedServings() {
    if (!sharedServings) return;
    document.querySelectorAll('.recipe-group[data-servings-source="shared"]').forEach(function (group) {
      group.setAttribute('data-current-servings', sharedServings.current);
      renderGroup(group, currentSystem(group.closest('.recipe')));
    });
    document.querySelectorAll('.servings-stepper[data-servings-source="shared"]').forEach(function (stepper) {
      stepper.setAttribute('data-current-servings', sharedServings.current);
      var valueEl = stepper.querySelector('.servings-value');
      if (valueEl) valueEl.textContent = sharedServings.current;
    });
  }

  function initRecipe(recipeRoot) {
    var groups = recipeRoot.querySelectorAll('.recipe-group');

    groups.forEach(function (group) {
      renderGroup(group, currentSystem(recipeRoot));
    });

    var unitButtons = recipeRoot.querySelectorAll('.unit-toggle-btn');
    unitButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setUnitSystemEverywhere(btn.getAttribute('data-unit'));
      });
    });

    var steppers = recipeRoot.querySelectorAll('.servings-stepper');
    steppers.forEach(function (stepper) {
      var source = stepper.getAttribute('data-servings-source');
      var buttons = stepper.querySelectorAll('.servings-btn');

      if (source === 'shared') {
        if (!sharedServings) {
          sharedServings = { current: parseFloat(stepper.getAttribute('data-base-servings')) };
        }
        buttons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var step = parseFloat(btn.getAttribute('data-step'));
            sharedServings.current = Math.max(1, sharedServings.current + step);
            applySharedServings();
          });
        });
        return;
      }

      // Own stepper: scoped to just its one enclosing group.
      var valueEl = stepper.querySelector('.servings-value');
      var owner = stepper.closest('.recipe-group');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var step = parseFloat(btn.getAttribute('data-step'));
          var current = parseFloat(stepper.getAttribute('data-current-servings'));
          var next = Math.max(1, current + step);
          stepper.setAttribute('data-current-servings', next);
          valueEl.textContent = next;
          if (owner) {
            owner.setAttribute('data-current-servings', next);
            renderGroup(owner, currentSystem(recipeRoot));
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var recipes = document.querySelectorAll('.recipe');
    recipes.forEach(initRecipe);
    if (recipes.length) {
      setUnitSystemEverywhere(currentSystem(recipes[0]));
    }
    applySharedServings();
  });
})();
