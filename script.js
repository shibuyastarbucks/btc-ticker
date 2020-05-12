window.onload = function() {

    let rr = 1.5; // refresh rate in seconds
    let mode = 'btc';

    let price = new Vue({
        el: '#container',
        data: {
            currentPrice: 0,
            animatedPrice: 0,
            currency: 'Bitcoin'
        },
        watch: {
            currentPrice: function(newValue, oldValue) {
                var vm = this;
				debugValues(newValue, oldValue);
				let newHtml = renderUpdatedPrice(newValue, oldValue);
				renderDiff(newValue, oldValue);
				if (newHtml.length > 0) {
					document.getElementById("animatedPrice").innerHTML = newHtml;
				}
            }
        }
    });

    //price.currentPrice = 15000;
    getCurrentPrice(mode, price);
    setInterval(function() {
        //price.currentPrice += 100;
        getCurrentPrice(mode, price);
    }, rr * 1000);
}

function renderUpdatedPrice(newValue, oldValue) {
  let diff = (newValue - oldValue).toFixed(2);
  if (diff === 0 || oldValue <= 0 || newValue <= 0) {
	return "";
  }
  let strNewValue = (parseFloat(newValue).toFixed(2)).toString();
  let strOldValue = (parseFloat(oldValue).toFixed(2)).toString();
  if (strNewValue === strOldValue) {
	return "";
  }
  let html = "";
  let isUp = newValue >= oldValue;
  let firstDiffIndex = getFirstDiffIndex(strNewValue, strOldValue);
  if (strNewValue.length != strOldValue.length){
	firstDiffIndex = 0;
  }
  for (i = 0; i < strNewValue.length; i++){
    if (i < firstDiffIndex || strNewValue.charAt(i) === ".") {
		html = html + "<span>" + strNewValue.charAt(i) + "</span>";
	}
	else if (isUp) {
		html = html + "<span class='pump'>" + strNewValue.charAt(i) + "</span>";
	}
	else {
		html = html + "<span class='dump'>" + strNewValue.charAt(i) + "</span>";
	}
  }
  return html;
}

function renderDiff(newValue, oldValue) {
  let diff = (newValue - oldValue).toFixed(2);
  if (diff === 0 || oldValue <= 0 || newValue <= 0) {
	return;
  }
  document.getElementById("diffUp").innerHTML = "&#8205;";
  document.getElementById("diffDown").innerHTML = "&#8205;";
  let isUp = newValue >= oldValue;
  if (isUp) {
	document.getElementById("diffUp").innerHTML = "+" + diff;
  }
  else {
	document.getElementById("diffDown").innerHTML = diff;  
  }
}

function debugValues(newValue, oldValue) {
  let diff = (newValue - oldValue).toFixed(2);
  if (diff === 0 || oldValue <= 0 || newValue <= 0) {
    document.getElementById("debugDiff").innerHTML = "";
	return;
  }
  document.getElementById("debugDiff").innerHTML = (newValue - oldValue).toFixed(2);
  let strNewValue = (parseFloat(newValue).toFixed(2)).toString();
  let strOldValue = (parseFloat(oldValue).toFixed(2)).toString();
  if (strNewValue === strOldValue) {
    document.getElementById("debugFirstChangedIndex").innerHTML = "";
	return;
  }
  if (strNewValue.length != strOldValue.length){
	document.getElementById("debugFirstChangedIndex").innerHTML = 0;
	// todo: shift of number of dollar digits, i.e.: 9999 to 10000 or 1000 to 999
	return;
  }
  let firstDiffIndex = getFirstDiffIndex(strNewValue, strOldValue);
  document.getElementById("debugFirstChangedIndex").innerHTML = firstDiffIndex;
}

function getFirstDiffIndex(n, o) {
  var i = 0;
  if (n === o) return -1;
  while (n[i] === o[i]) i++;
  return i;
}

function getCurrentPrice(coin, vue) {
    let http = new XMLHttpRequest();
    let cors_proxy = 'https://cors-anywhere.herokuapp.com/';
    if (coin == 'btc') {
		var api = 'https://www.bitstamp.net/api/ticker/';
    } 
    http.open("GET", api, true);
    http.onload = function() {
        var data = JSON.parse(http.responseText);
		vue.currentPrice = data.last;
    }
    http.send();
}



