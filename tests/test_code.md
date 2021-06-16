<span class="test-case"></span>

# Code with Highlight.js

Courtesy: [Rosetta Code](https://rosettacode.org/wiki/Factorial)

## JavaScript / ES6

```js
var factorial = n => (n < 2) ? 1 : n * factorial(n - 1);
```

## Python

```python
def factorial(n):
    return n * factorial(n - 1) if n else 1
```


## Vim script

```vim
function! Factorial(n)
  if a:n < 2
    return 1
  else
    return a:n * Factorial(a:n-1)
  endif
endfunction
```
