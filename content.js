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

$.tooltipster.startSelectable(
  'html',
  async function (instance, selectedText) {
    let translated = await translate(selectedText)
    return Promise.resolve(translated);
  },
  { animation: 'fade' }
);

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
