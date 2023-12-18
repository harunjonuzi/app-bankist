Useful links:
https://www.iban.com/currency-codes
http://www.lingoes.net/en/translator/langcode.htm

Solution to my sort feature:
Others have noted that the reason sort didn't work is Jonas forgot to update the argument there, when he changed displayMovements to take the entire account and not just the movements so that we could display the movement dates as well.

Now when fixing that, people have noticed that the dates are not sorted with the movements, and so here is my solution to that challenge:

First we create a sort function that takes both arrays as parameters:

```js
const sortMovements = function (movs, dates) {
    const arrCombined = [],
        sortedMovs = [],
        sortedDates = [];

    movs.forEach((el, i) => arrCombined.push([movs[i], dates[i]]));
    arrCombined.sort((a, b) => a[0] - b[0]);
    arrCombined.forEach((el) => {
        sortedMovs.push(el[0]);
        sortedDates.push(el[1]);
    });

    return [sortedMovs, sortedDates];
};
```

This simply starts by pushing all rows of the unsorted arrays into an array of arrays, where each movement and its date is an array inside arrCombined.

```js
movs.forEach((el, i) => arrCombined.push([movs[i], dates[i]]));
```

So arrCombined will now have elements like this, with a movement and its corresponding date, each being held together in an array:

0: [-642.21, '2020-05-08T14:11:59.604Z']
1: [-306.5, '2020-01-28T09:15:04.904Z']
Now we can sort arrCombined on the amount by simply doing

```js
arrCombined.sort((a, b) => a[0] - b[0]);
```

We can sort on date instead by simply using a[1] - b[1]. (Note: This of course depends on the date format being year-mon-day, and padded with zeros, like in my example. It is a string, and is sorted as such, so other formats may produce strange results.)

So now we have a sorted array, and simply split this into two again:

```js
arrCombined.forEach((el) => {
    sortedMovs.push(el[0]);
    sortedDates.push(el[1]);
});
```

And return these in a wrapper array, since we can only have one return value.

```js
return [sortedMovs, sortedDates];
```

Then in displayMovements I have a boolean parameter named sort, which defaults to false:

```js
const displayMovements = function (acc, sort = false) { ... }
```

And then to sort or not I use a simple ternary:

```js
const [movs, dates] = sort
    ? sortMovements(acc.movements, acc.movementsDates)
    : [acc.movements, acc.movementsDates];
```

And now I have the movements and dates both sorted in the same order in movs and dates. And then I use those two when setting the html.

```js
movs.forEach(function (mov, i)
```

and

```js
const displayDate = formatDate(new Date(dates[i]));
```

I keep the original arrays in their original unsorted state, so I do not have to keep track of if and how they are sorted. I just flip the "sort" argument in the sort event handler:

```js
displayMovements(currentAccount, !sorted);
sorted = !sorted;
```

(Now this part has to be a bit more advanced if you decide to have multiple different sort orders, of course.
