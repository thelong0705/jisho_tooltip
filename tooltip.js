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

async function showTooltip() {
  let selection = document.getSelection();
  let selectionString = selection.toString().trim();
  if (selectionString) {
    let windowWidth = $(window).width();
    let { x, y, width, height } = selection.getRangeAt(0).getBoundingClientRect()
    console.log(x, y, width, height)
    let translateLeftPosition = Math.max(x + width / 2 - 15, 0);
    let translateRightPosition = Math.max(windowWidth - translateLeftPosition - 30, 0);
    let scrollTop = $(window).scrollTop();
    let translateTopPosition = scrollTop + y + height + 5

    $('.translate').css('top', translateTopPosition);
    $('.translate').css('left', translateLeftPosition);
    $('.translate').css('right', 'auto');
    $('.jisho-arrow').css('left', 10);
    $('.jisho-arrow').css('right', 'auto')

    let loadingWidth = $('.jisho-loading').width();
    var skewRight = translateLeftPosition + 300 > windowWidth
    if (skewRight) {
      $('.translate').css('right', translateRightPosition);
      $('.translate').css('left', 'auto');
      $('.jisho-arrow').css('right', 10);
      $('.jisho-arrow').css('left', 'auto')
    }

    $('.translate').show();
    $('.jisho-loading').show();
    $('.translate-body').hide();

    try {
      var translatedJson = await translate(selectionString)
    } catch (error) {
      translated = "Can't not connect to Internet"
    } finally {
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
      $('.english').html(`${englishHTML}`)
      
      if (translatedJson.japanese[0].word) {
        $('.word').html(`${translatedJson.japanese[0].word}`);
        $('.reading').html(`${translatedJson.japanese[0].reading}`);
      } else {
        $('.word').html(`${translatedJson.japanese[0].reading}`);
        $('.reading').html(``);
      }
      
      $('.furigana').html(`${translatedJson.japanese[0].reading}`)
      $('.kanji').html(`${translatedJson.japanese[0].word}`)
      let divWidth = $('.translate').width();
      if (skewRight) {
        $('.translate').css('right', translateRightPosition);
        $('.translate').css('left', 'auto');
        $('.jisho-arrow').css('right', 10);
        $('.jisho-arrow').css('left', 'auto')
      }
    }
  }
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
