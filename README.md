# SpecWhy

Ranks competing CSS selectors by cascade rules (!important, inline, specificity, order) and explains the winner.

Open `app.html` (GitHub Pages). Everything runs client side.

## Testing
- `oracle.py <seed> <n> <out>` generates selectors in the Selectors 3 subset and records `cssselect` 1.3.0 `specificity()`. `test-engine.js` compares `engine.js` with it.
- Seeds 1-3 (60,000 lines) were used while debugging. Seeds 11-15 (100,000 lines) were run fresh after the last engine change that affects the compared subset. 0 mismatches.
- `test-doc.js`: 12 worked examples, the first six from the MDN Specificity page (fetched), 0 failures.
- `:where()` was removed from the oracle generator: cssselect 1.3.0 gives odd values for it (for example `*#x-1 ~ :lang(en):where(#b)` is (1,0,0)), and it rejects complex selectors inside it.

## Limits
- `:is()`, `:not()` and `:has()` lists, `:where()` and `:nth-child(.. of S)` have no oracle. The first four follow MDN; `of S` is not documented in what was fetched.
- The W3C Selectors 4 page fetch was cut off before the specificity section.
- Nesting (`&`), @layer, shadow DOM and element matching are not handled.
