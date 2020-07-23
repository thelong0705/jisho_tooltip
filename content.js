chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      var text = "";
      if (window.getSelection) {
        text = window.getSelection().toString();
      } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
      }
      chrome.runtime.sendMessage({ "message": "open_new_tab", "text": text });
    }
  }
);

$(document).ready(function () {
  $(document.body).append(`
    <div class="translate">
      <div class="jisho-arrow">
        <div class="jisho-arrow-inside"></div>
      </div>
      <div class="jisho-loading">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="error">There is something wrong. Check your internet connection</div>
      <div class="translate-body">
        <div class="word-not-found">Can not translate this word</div>
        <div class="japanese">
          <div class="reading"></div>
          <div class="word"></div>
          <hr>
        </div>
        <div class="english">
        </div>
      </div>
    </div>
`);
});

document.onkeydown = function (event) {
  if (event.keyCode == 68) { // d button's keycode 
    showTooltip();
  }
}

document.onmousedown = function () {
  $('.translate').hide();
  $('.jisho-loading').hide();
  $('.translate-body').hide();
}

function showTranslated(translatedJson) {
  $('.jisho-loading').hide();
  $('.translate-body').show();
  if (!translatedJson) {
    $(".word-not-found").show();
    return;
  }
  $(".word-not-found").hide();
  let englishHTML = ''
  for (let index = 0; index < translatedJson.senses.length; index++) {
    let englishDefinitions = translatedJson.senses[index].english_definitions.join(', ');
    englishHTML += `<p>${index + 1}. ${englishDefinitions}</p>`
  }
  $('.english').html(`${englishHTML}`);

  if (translatedJson.japanese[0].word) {
    $('.word').html(`${translatedJson.japanese[0].word}`);
    $('.reading').html(`${translatedJson.japanese[0].reading}`);
  } else {
    $('.word').html(`${translatedJson.japanese[0].reading}`);
    $('.reading').html(``);
  }
}

async function showTooltip() {
  let selection = document.getSelection();
  let tooltip = new Tooltip(selection);
  if (!tooltip.selectionString) return;
  tooltip.setTooltipCSS();
  tooltip.setArrowCSS();
  Tooltip.showLoading();
  
  let translatedJson;
  
  try {
    translatedJson = await translate(tooltip.selectionString)
  } catch (error) {
    $('.jisho-loading').hide();
    $('.translate-body').hide();
    $('.error').show();
    throw error;
  }
  showTranslated(translatedJson)
}

async function translate(word) {
  let jisho_api = "https://cors-anywhere.herokuapp.com/https://jisho.org/api/v1/search/words?keyword="
  let response = await fetch(jisho_api + word, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
  let responseJson = await response.json();
  return responseJson.data?.[0];
}
