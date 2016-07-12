import emojiAuto from 'emoji-autocomplete/src/autocomplete';
import $ from 'jquery';
import 'jquery.caret';

import cursorPosition from './helpers/cursorPosition';
import wordAtPosition from './helpers/wordAtPosition';
import isContentEditable from './helpers/isContentEditable';
import suppress from './helpers/suppress';

'use strict';
const body = document.body;

const $input = $('div[contenteditable="true"],input[type=text], textarea');

$input.each(function (i, elem) {
  this.initialText = isContentEditable(this) ? $(this).text() : $(this).val()
});

let isSuggestionOpen = false;

/**
 * Removes the dropdown
 */
function removeSuggestions () {
  $('#emoji-autosuggest').remove();
  isSuggestionOpen = false;
}

function navigate (e) {
  const $elements = $('#emoji-autosuggest .emoji-suggesstion');
  if (!$elements.length) return;
  const activeIndex = $elements.siblings('.active').data('index');
  if (e.which === 40 && (activeIndex < $elements.length)) {
    $elements.removeClass('active');
    $($elements[activeIndex + 1]).addClass('active');
  } else if (e.which === 38 && activeIndex > 0) {
    $elements.removeClass('active');
    $($elements[activeIndex - 1]).addClass('active');
  } else if (e.which === 13) {
    const selected = $elements[activeIndex];
    return $(selected).find('.emoji-value').text()
  }
}

function handleKeyPress (e) {
  if (e.which === 16) return; // shift key
  if (e.which === 40 || e.which === 38 || e.which === 13) {
    e.preventDefault();
    e.stopPropagation();
    const selected = navigate(e);
    if (isSuggestionOpen && e.which === 13) {
      if (isContentEditable($(this)[0])) {
        this.innerHTML = html.replace(word, selected + ' ');
      } else {
        this.value = value.replace(word, selected)
      }
      removeSuggestions();
    }
    return false
  } else {
    value = this.value || this.innerText;
    html = this.innerHTML;

    const isDeleted = e.which === 8;
    changeIndex = cursorPosition(value, this.initialText, isDeleted);
    word = wordAtPosition(value, changeIndex);
  }

  removeSuggestions();
  if (word.indexOf(':') === 0) {
    $(body).append(suggestions($(this), word.slice(1)));
    isSuggestionOpen = true;
  }
  this.initialText = value;
}

let value, changeIndex, word, html;

$($input).off('keyup.emoji').on('keyup.emoji', function (e) {
  if (!isSuggestionOpen && e.which === 13) return true;
  suppress(e);
  handleKeyPress.bind(this)(e);
});


function suggestions (elem, query) {
  const results = emojiAuto.match(query).slice(0, 10);
  const position = elem.caret('offset');
  const suggestion = results.map((val, i) => {
    const className = i === 0 ? 'emoji-suggesstion active' : 'emoji-suggesstion';
    return `
    <div class='${className}' data-index='${i}'>
      <span class='emoji-value inline'>${val.emoji}</span>
      <span class='emoji-name inline'>${val.name}</span>
    </div>`;
  });

  return `
  <div id='emoji-autosuggest'
    style=' top: ${position.top + position.height + 5}px; left: ${position.left}px; '
  >${suggestion.join('')}</div>
`;
}

