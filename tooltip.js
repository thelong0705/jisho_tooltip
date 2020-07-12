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

document.onmouseup = async function () {
  let selection = document.getSelection();
  let selectionString = selection.toString().trim();
  if (selectionString) {
    let { x, y, width, height } = selection.getRangeAt(0).getBoundingClientRect()
    console.log(x, y, width, height)
    $('.translate').css('top', y + height + 5);
    $('.translate').css('left', x + width/2 - 15);
    $('.translate').css('right', 'auto');
    $('.jisho-arrow').css('left', 10);
    $('.jisho-arrow').css('right', 'auto')
    $('.translate').show();
    $('.jisho-loading').show();
    let translated = await translate(selectionString)
    $('.jisho-loading').hide();
    $('.translated-text').html(`${translated}`)
    let divWidth = $('.translate').width();
    let browserWidth = $(window).width();
    if(x + divWidth > browserWidth){
      $('.translate').css('right', browserWidth - x - width);
      $('.translate').css('left', 'auto');
      $('.jisho-arrow').css('right', width/2);
      $('.jisho-arrow').css('left', 'auto')

    }
  }
};

document.onmousedown = function () {
  $('.translate').hide();
  $('.jisho-loading').hide();
  $('.translated-text').html(``)
}

async function translate(word) {
  let jisho_api = "https://cors-anywhere.herokuapp.com/https://jisho.org/api/v1/search/words?keyword="
  let response = await fetch(jisho_api + word, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
  let responseJson = await response.json();
  return responseJson.data[0].senses[0].english_definitions.toString();
}
