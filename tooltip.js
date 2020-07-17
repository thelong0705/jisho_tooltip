$(document.body).append(`
  <div class="translate">
  <div class="jisho-arrow"></div>
  <div class="jisho-loading">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="translated-text">
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
  $('.translated-text').html(``)
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
      var translated = await translate(selectionString) || "Can't translate this word"
    } catch (error) {
      translated = "Can't not connect to Internet"
    } finally {
      $('.jisho-loading').hide();
      $('.translated-text').html(`${translated}`)
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
  return responseJson.data[0]?.senses[0].english_definitions.toString();
}
