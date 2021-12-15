let profileFactor = window.location.hash.substr(1);
let digitsPrecision = 2;
if (!isBlank(profileFactor) && Number.isFinite(parseFloat(profileFactor))){
  profileFactor = parseFloat(profileFactor);
  digitsPrecision = 0;
}
const BlankChar = "&#8205;";
const spotUrl = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
const futureUrl = 'wss://fstream.binance.com/ws/btcusdt@trade';

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

let noSleep = new NoSleep();
document.addEventListener('click', function enableNoSleep() {
  document.removeEventListener('click', enableNoSleep, false);
  noSleep.enable();
}, false);

function connectWebsocket(wssUrl) {
  const ws = new WebSocket(wssUrl);

  ws.onmessage = function(event) {
    try {
      let message = JSON.parse(event.data);
      $("#lastPrice").val(message.p);
    }
    catch(e) {
      console.log(event.data, e);
    }
  }

  ws.onclose = function(e) {
    console.log('Spot WebSocket is closed. Connect to futures WebSocket will be attempted in 10 second.', e.reason);
    setTimeout(function() {
      connectWebsocket(futureUrl);
    }, 10000);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };
}
connectWebsocket(spotUrl);

function renderUpdatedPrice(newValue, oldValue) {
  let diff = (newValue - oldValue).toFixed(digitsPrecision);
  if (parseFloat(diff) === 0 || oldValue <= 0 || newValue <= 0) {
    return;
  }
  let strNewValue = (parseFloat(newValue).toFixed(digitsPrecision)).toString();
  let strOldValue = (parseFloat(oldValue).toFixed(digitsPrecision)).toString();
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
        html = html + "<span class='pump' id='tp0' data-link='" + strNewValue.charAt(0) + "'>" + BlankChar + "</span>";
      }
      else {
        html = html + "<span class='dump' id='tp0' data-link='" + BlankChar + "'>" + strOldValue.charAt(0) + "</span>";
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
    $(this).fadeOut(200, function() {
      $(this).addClass(strClass);
      $(this).text(newValue).fadeIn(300);
    });
  });
}

function renderDiff(newValue, oldValue) {
  let diff = (newValue - oldValue).toFixed(digitsPrecision);
  if (parseFloat(diff) === 0 || oldValue <= 0 || newValue <= 0) {
    return;
  }
  document.getElementById("diffUp").innerHTML = BlankChar;
  document.getElementById("diffDown").innerHTML = BlankChar;
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

function isBlank(str) {
  return (!str || /^\s*$/.test(str));
}

function getCurrentPrice(vue) {
  if (Number.isFinite(profileFactor)){
    vue.currentPrice = ($("#lastPrice").val() * profileFactor).toFixed(digitsPrecision);
  }
  else {
    vue.currentPrice = $("#lastPrice").val();
  }
  // vue.currentPrice = (Math.random() * (10010.99 - 9990.01) + 9990.01).toFixed(2);  // test numbers
}