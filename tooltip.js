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
      <div class="furigana"></div>
      <div class="kanji"></div>
      <div class="english"></div>
    </div>
  </div>
`);

document.onkeydown = function (event) {
  if (event.keyCode == 68){ // d button's keycode 
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
    let browserWidth = $(window).width();
    let { x, y, width, height } = selection.getRangeAt(0).getBoundingClientRect()
    console.log(x, y, width, height)
    let translateLeftPosition = Math.max(x + width / 2 - 15, 0);
    let translateRightPosition = Math.max(browserWidth - translateLeftPosition - 30, 0);
    let scrollTop = $(window).scrollTop();
    let translateTopPosition = scrollTop + y + height + 5

    $('.translate').css('top', translateTopPosition);
    $('.translate').css('left', translateLeftPosition);
    $('.translate').css('right', 'auto');
    $('.jisho-arrow').css('left', 10);
    $('.jisho-arrow').css('right', 'auto')

    let loadingWidth = $('.jisho-loading').width();
    if (translateLeftPosition + loadingWidth > browserWidth - 10) {
      $('.translate').css('right', translateRightPosition);
      $('.translate').css('left', 'auto');
      $('.jisho-arrow').css('right', 10);
      $('.jisho-arrow').css('left', 'auto')
    }

    $('.translate').show();
    $('.jisho-loading').show();

    try {
      var translatedJson = await translate(selectionString)
    } catch (error) {
      translated = "Can't not connect to Internet"
    } finally {
      $('.jisho-loading').hide();
      $('.translate-body').show();
      if(!translatedJson) {
        $(".word-not-found").show();
        return;
      }
      $(".word-not-found").hide();
      $('.english').html(`${ translatedJson.senses[0].english_definitions.toString()}`)
      $('.furigana').html(`${ translatedJson.japanese[0].reading }`)
      $('.kanji').html(`${ translatedJson.japanese[0].word }`)
      let divWidth = $('.translate').width();
      if (translateLeftPosition + divWidth > browserWidth) {
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
