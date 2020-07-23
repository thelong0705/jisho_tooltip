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

function findSelect() {
  let selection = document.getSelection();
  let selectionString = selection.toString().trim();
  return { selection, selectionString };
}

function getPosition(selection) {
  let { x, y, width, height } = selection.getRangeAt(0).getBoundingClientRect();

  let windowWidth = $(window).width();
  let translateLeftPosition = Math.max(x + width / 2 - 15, 0);
  let translateRightPosition = Math.max(windowWidth - translateLeftPosition - 30, 0);
  let isSkewRight = translateLeftPosition + 300 > windowWidth;
  let translateHorizontalPosition = isSkewRight ? translateRightPosition : translateLeftPosition;

  let scrollTop = $(window).scrollTop();
  let translateVerticalPosition = scrollTop + y + height + 5

  return { translateVerticalPosition, translateHorizontalPosition, isSkewRight }
}

function setPosition(translateVerticalPosition, translateHorizontalPosition, isSkewRight) {
  $('.translate').css('top', translateVerticalPosition);

  if (isSkewRight) {
    $('.translate').css('right', translateHorizontalPosition);
    $('.translate').css('left', 'auto');
    $('.jisho-arrow').css('right', 10);
    $('.jisho-arrow').css('left', 'auto')
  } else {
    $('.translate').css('left', translateHorizontalPosition);
    $('.translate').css('right', 'auto');
    $('.jisho-arrow').css('left', 10);
    $('.jisho-arrow').css('right', 'auto')
  }
}

function showLoading() {
  $('.translate').show();
  $('.jisho-loading').show();
  $('.translate-body').hide();
  $('.error').hide();
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
  const { selection, selectionString } = findSelect();
  if (!selectionString) return;
  const { translateVerticalPosition, translateHorizontalPosition, isSkewRight } = getPosition(selection);
  setPosition(translateVerticalPosition, translateHorizontalPosition, isSkewRight)
  showLoading();
  
  let translatedJson;
  
  try {
    translatedJson = await translate(selectionString)
  } catch (error) {
    $('.jisho-loading').hide();
    $('.translate-body').hide();
    $('.error').show();
    return;
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