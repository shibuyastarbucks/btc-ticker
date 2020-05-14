window.onload = function() {
  let rr = 3; // refresh rate in seconds
  let price = new Vue({
    el: '#container',
      data: {
        currentPrice: 0,
        animatedPrice: 0,
      },
      watch: {
        currentPrice: function(newValue, oldValue) {
          renderUpdatedPrice(newValue, oldValue);
          renderDiff(newValue, oldValue);
        }
      }
  });

  getCurrentPrice(price);
  setInterval(function() {
    getCurrentPrice(price);
  }, rr * 1000);
}

const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
ws.onmessage = function(evt) {
  try {
    let msg = JSON.parse(evt.data);
    $("#lastPrice").val(msg.p);
  }
  catch(e) {
    console.log(evt.data, e);
  }
}

function renderUpdatedPrice(newValue, oldValue) {
  let diff = (newValue - oldValue).toFixed(2);
  if (parseFloat(diff) === 0 || oldValue <= 0 || newValue <= 0) {
    return;
  }
  let strNewValue = (parseFloat(newValue).toFixed(2)).toString();
  let strOldValue = (parseFloat(oldValue).toFixed(2)).toString();
  if (strNewValue === strOldValue) {
    return;
  }
  let html = "";
  let isUp = parseFloat(diff) > 0;
  let digitsLengthChanged = false;
  if (strNewValue.length !== strOldValue.length){
    digitsLengthChanged = true;
    if (strNewValue.length > strOldValue.length) {
      strOldValue = "0" + strOldValue;
    }
    else {
      strNewValue = "0" + strNewValue;
    }
  }
  let firstDiffIndex = getFirstDiffIndex(strNewValue, strOldValue), i;
  for (i = 0; i < strNewValue.length; i++){
    if (i === 0 && digitsLengthChanged) {
      if (isUp) {
        html = html + "<span class='pump' id='tp0' data-link='" + strNewValue.charAt(0) +"'>&#8205;</span>";
      }
      else {
        html = html + "<span class='dump' id='tp0' data-link='&#8205;'>" + strOldValue.charAt(0) + "</span>";
      }
    }
    else if (i < firstDiffIndex || strNewValue.charAt(i) === "." || strOldValue.charAt(i) === strNewValue.charAt(i)) {
      html = html + "<span id='tp" + i + "'>" + strNewValue.charAt(i) + "</span>";
    }
    else if (isUp) {
      html = html + "<span class='pump' id='tp" + i + "' data-link='" + strNewValue.charAt(i) +"'>" + strOldValue.charAt(i) + "</span>";
    }
    else {
      html = html + "<span class='dump' id='tp" + i + "' data-link='" + strNewValue.charAt(i) +"'>" + strOldValue.charAt(i) + "</span>";
    }
  }
  document.getElementById("animatedPrice").innerHTML = html;
  let strClass = isUp ? "pump" : "dump";
  $("." + strClass).each(function(){
    let newValue = $(this).attr("data-link");
    $(this).removeClass(strClass);
    $(this).fadeOut(function() {
      $(this).addClass(strClass);
      $(this).text(newValue).fadeIn();
    });
  });
}

function renderDiff(newValue, oldValue) {
  let diff = (newValue - oldValue).toFixed(2);
  if (parseFloat(diff) === 0 || oldValue <= 0 || newValue <= 0) {
    return;
  }
  document.getElementById("diffUp").innerHTML = "&#8205;";
  document.getElementById("diffDown").innerHTML = "&#8205;";
  let isUp = parseFloat(diff) > 0;
  if (isUp) {
    document.getElementById("diffUp").innerHTML = "+" + diff;
  }
  else {
    document.getElementById("diffDown").innerHTML = diff;
  }
}

function getFirstDiffIndex(n, o) {
  let i = 0;
  if (n === o) return -1;
  while (n[i] === o[i]) i++;
  return i;
}

function getCurrentPrice(vue) {
  vue.currentPrice = $("#lastPrice").val();
  // vue.currentPrice = (Math.random() * (10010.99 - 9990.01) + 9990.01).toFixed(2);  // test numbers
}