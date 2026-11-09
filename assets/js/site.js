/* carbonverify.teardown — interactions */

(function () {
  'use strict';

  /* active nav */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a.lnk, .dr a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href === here || (here === 'index.html' && href === 'index.html')) a.classList.add('on');
  });

  /* reveal on scroll */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  /* unit economics calculator */
  var calc = document.getElementById('calcbox');
  if (!calc) return;

  var elBatches = document.getElementById('c-batches');
  var elShareA = document.getElementById('c-shareA');
  var outBatches = document.getElementById('c-batches-v');
  var outShareA = document.getElementById('c-shareA-v');

  var yuan = function (n) {
    return '¥' + Math.round(n).toLocaleString('en-US');
  };

  function render() {
    var batches = +elBatches.value;
    var shareA = +elShareA.value / 100;
    var shareC = Math.min(0.45, (1 - shareA) / 2);
    var shareB = Math.max(0, 1 - shareA - shareC);

    outBatches.textContent = batches + ' 批/年';
    outShareA.textContent = Math.round(shareA * 100) + '% A';

    /* buyer-side */
    var revA = batches * shareA * 80;
    var revB = batches * shareB * 60;
    var revC = batches * shareC * 40;
    var buyerSide = revA + revB + revC;

    /* signature share is fixed at 40 per batch regardless of grade */
    var sigFee = batches * 40;
    var evidenceKeep = buyerSide - sigFee;

    /* supplier side */
    var supplier = 28000 + 12000 + batches * 40 + 4000;

    var total = evidenceKeep + supplier;

    document.getElementById('o-buyer').textContent = yuan(buyerSide);
    document.getElementById('o-sig').textContent = '−' + yuan(sigFee);
    document.getElementById('o-keep').textContent = yuan(evidenceKeep);
    document.getElementById('o-supplier').textContent = yuan(supplier);
    document.getElementById('o-total').textContent = yuan(total);

    /* signature economics gap */
    var realCost = batches * 3000;
    document.getElementById('o-real').textContent = yuan(realCost);
    document.getElementById('o-gap').textContent = yuan(realCost - sigFee);

    /* grade mix bar */
    var m = document.getElementById('c-mix');
    m.innerHTML = '<i class="mix-a" style="width:' + (shareA * 100) + '%"></i>' +
                  '<i class="mix-b" style="width:' + (shareB * 100) + '%"></i>' +
                  '<i class="mix-c" style="width:' + (shareC * 100) + '%"></i>';
    document.getElementById('c-mix-a').textContent = Math.round(shareA * 100) + '%';
    document.getElementById('c-mix-b').textContent = Math.round(shareB * 100) + '%';
    document.getElementById('c-mix-c').textContent = Math.round(shareC * 100) + '%';

    /* verdict */
    var v = document.getElementById('o-verdict');
    if (batches > 200) {
      v.className = 'verdict bad';
      v.innerHTML = '批次密度 ' + batches + ' 批/年 > 200：每批固定 ¥40 签名费把持证方压到 ' +
        yuan(sigFee) + '/年，而其真实签发成本约 ' + yuan(realCost) +
        '（按 ¥3,000/柜计）。缺口 ' + yuan(realCost - sigFee) + ' 无处消化 —— 模型在此处断裂。';
    } else if (shareA >= 0.7) {
      v.className = 'verdict ok';
      v.innerHTML = '批次密度低 + A 级占比高：证据层留存 ' + yuan(evidenceKeep) +
        '，签名分成占比 ' + Math.round(sigFee / buyerSide * 100) + '%。此区间模型成立。';
    } else {
      v.className = 'verdict';
      v.innerHTML = '证据层留存 ' + yuan(evidenceKeep) + '，其中 ' +
        Math.round(sigFee / buyerSide * 100) + '% 作为固定签名分成流出。批次越密，流失越快。';
    }
  }

  elBatches.addEventListener('input', render);
  elShareA.addEventListener('input', render);
  render();
})();
